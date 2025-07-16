import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { ProductsService } from '../products/products.service';
import { OrderStatus } from '../common/enums/order-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @Inject(forwardRef(() => ProductsService))
    private productsService: ProductsService,
    @InjectQueue('order-processing') private orderQueue: Queue,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    if (user.role !== UserRole.SHOPPER) {
      throw new ForbiddenException('Only shoppers can place orders');
    }

    // Validate and calculate total
    let totalAmount = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: number;
    }> = [];

    for (const item of createOrderDto.items) {
      const product = await this.productsService.findById(item.productId);

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}`,
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create order
    const order = this.orderRepository.create({
      userId: user.id,
      totalAmount,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    for (const item of orderItems) {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
      await this.orderItemRepository.save(orderItem);
    }

    // Add to processing queue
    await this.orderQueue.add('process-order', {
      orderId: savedOrder.id,
      items: orderItems,
    });

    return this.findById(savedOrder.id);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'payments'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStore(storeId: string): Promise<Order[]> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('product.store', 'store')
      .leftJoinAndSelect('order.user', 'user')
      .where('store.id = :storeId', { storeId })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    user: User,
  ): Promise<Order> {
    const order = await this.findById(id);

    // Check permissions
    if (user.role === UserRole.SHOPPER && order.userId !== user.id) {
      throw new ForbiddenException('You can only view your own orders');
    }

    if (user.role === UserRole.SELLER) {
      // Check if seller owns any product in the order
      const hasSellerProduct = order.items.some(
        (item) => item.product.store.id === user.store?.id,
      );
      if (!hasSellerProduct) {
        throw new ForbiddenException(
          'You can only update orders containing your products',
        );
      }
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  async remove(id: string, user: User): Promise<void> {
    const order = await this.findById(id);

    // Only admin or order owner can delete
    if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own orders');
    }

    // Can only delete pending orders
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Can only delete pending orders');
    }

    await this.orderRepository.remove(order);
  }
}

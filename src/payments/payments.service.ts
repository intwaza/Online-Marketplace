import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { OrdersService } from '../orders/orders.service';
import { PaymentMethod } from '../common/enums/payment-method.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private ordersService: OrdersService,
  ) {}

  async processPayment(
    processPaymentDto: ProcessPaymentDto,
    user: User,
  ): Promise<Payment> {
    const order = await this.ordersService.findById(processPaymentDto.orderId);

    if (order.userId !== user.id) {
      throw new BadRequestException('You can only pay for your own orders');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is no longer pending');
    }

    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId: order.id, status: PaymentStatus.COMPLETED },
    });
    if (existingPayment) {
      throw new BadRequestException('Order has already been paid for');
    }

    const payment = this.paymentRepository.create({
      orderId: order.id,
      amount: order.totalAmount,
      paymentMethod: processPaymentDto.paymentMethod,
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    const paymentResult = await this.mockPaymentProcess(processPaymentDto);

    savedPayment.status = paymentResult.success
      ? PaymentStatus.COMPLETED
      : PaymentStatus.FAILED;
    savedPayment.paymentReference = paymentResult.reference;

    await this.paymentRepository.save(savedPayment);

    if (paymentResult.success) {
      await this.ordersService.updateStatus(
        order.id,
        OrderStatus.PROCESSING,
        user,
      );
    }

    return savedPayment;
  }

  async findByOrder(orderId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  private async mockPaymentProcess(
    paymentDto: ProcessPaymentDto,
  ): Promise<{ success: boolean; reference: string }> {
    const reference = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const success = Math.random() > 0.1;

    if (paymentDto.paymentMethod === PaymentMethod.CARD) {
      if (
        !paymentDto.cardNumber ||
        !paymentDto.cardExpiry ||
        !paymentDto.cardCvv
      ) {
        return { success: false, reference };
      }
    } else if (paymentDto.paymentMethod === PaymentMethod.MOBILE_MONEY) {
      if (!paymentDto.phoneNumber) {
        return { success: false, reference };
      }
    }

    return { success, reference };
  }

  async refundPayment(id: string): Promise<Payment> {
    const payment = await this.findById(id);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    payment.status = PaymentStatus.REFUNDED;
    return this.paymentRepository.save(payment);
  }
}

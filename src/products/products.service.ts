import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { StoresService } from '../stores/stores.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private storesService: StoresService,
    private categoriesService: CategoriesService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    user: User,
  ): Promise<Product> {
    // Check if user is seller
    if (user.role !== UserRole.SELLER) {
      throw new ForbiddenException('Only sellers can create products');
    }

    // Get seller's store
    const store = await this.storesService.findByOwner(user.id);
    if (!store) {
      throw new BadRequestException('You need to create a store first');
    }

    if (!store.isApproved) {
      throw new BadRequestException('Your store needs to be approved first');
    }

    // Verify category exists
    await this.categoriesService.findById(createProductDto.categoryId);

    const product = this.productRepository.create({
      ...createProductDto,
      storeId: store.id,
    });

    return this.productRepository.save(product);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    categoryId?: string,
  ): Promise<{ products: Product[]; total: number }> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.store', 'store')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.reviews', 'reviews')
      .where('store.isApproved = :approved', { approved: true })
      .orderBy('product.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    const [products, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { products, total };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['store', 'category', 'reviews', 'reviews.user'],
      select: {
        store: {
          id: true,
          name: true,
          description: true,
        },
        category: {
          id: true,
          name: true,
        },
        reviews: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByStore(storeId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { storeId },
      relations: ['category', 'reviews'],
    });
  }

  async update(
    id: string,
    updateProductDto: CreateProductDto,
    user: User,
  ): Promise<Product> {
    const product = await this.findById(id);

    // Check if user owns the product or is admin
    if (
      user.role !== UserRole.ADMIN &&
      product.store.id !== (await this.storesService.findByOwner(user.id))?.id
    ) {
      throw new ForbiddenException('You can only update your own products');
    }

    // Verify category exists if being updated
    if (updateProductDto.categoryId) {
      await this.categoriesService.findById(updateProductDto.categoryId);
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async feature(id: string): Promise<Product> {
    const product = await this.findById(id);
    product.isFeatured = !product.isFeatured;
    return this.productRepository.save(product);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findById(id);
    product.stockQuantity = quantity;
    return this.productRepository.save(product);
  }

  async remove(id: string, user: User): Promise<void> {
    const product = await this.findById(id);

    // Check if user owns the product or is admin
    if (
      user.role !== UserRole.ADMIN &&
      product.store.id !== (await this.storesService.findByOwner(user.id))?.id
    ) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productRepository.remove(product);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isFeatured: true },
      relations: ['store', 'category'],
      select: {
        store: {
          id: true,
          name: true,
        },
        category: {
          id: true,
          name: true,
        },
      },
    });
  }
}

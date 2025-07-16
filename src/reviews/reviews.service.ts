import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../users/entities/user.entity';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private productsService: ProductsService,
    private ordersService: OrdersService,
  ) {}

  async create(createReviewDto: CreateReviewDto, user: User): Promise<Review> {
    if (user.role !== UserRole.SHOPPER) {
      throw new ForbiddenException('Only shoppers can leave reviews');
    }

    // Verify product exists
    const product = await this.productsService.findById(
      createReviewDto.productId,
    );

    // Check if user has purchased this product
    const userOrders = await this.ordersService.findByUser(user.id);
    const hasPurchased = userOrders.some((order) =>
      order.items.some((item) => item.productId === createReviewDto.productId),
    );

    if (!hasPurchased) {
      throw new BadRequestException(
        'You can only review products you have purchased',
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: { userId: user.id, productId: createReviewDto.productId },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId: user.id,
    });

    return this.reviewRepository.save(review);
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { productId },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
      select: {
        user: {
          id: true,
          name: true,
        },
        product: {
          id: true,
          name: true,
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(
    id: string,
    updateReviewDto: CreateReviewDto,
    user: User,
  ): Promise<Review> {
    const review = await this.findById(id);

    // Check if user owns the review
    if (review.userId !== user.id) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async remove(id: string, user: User): Promise<void> {
    const review = await this.findById(id);

    // Check if user owns the review or is admin
    if (user.role !== UserRole.ADMIN && review.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);
  }

  async getProductRatingStats(
    productId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    const reviews = await this.reviewRepository.find({
      where: { productId },
      select: ['rating'],
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    return { averageRating: Math.round(averageRating * 10) / 10, totalReviews };
  }
}

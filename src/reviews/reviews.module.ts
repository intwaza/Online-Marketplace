import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    forwardRef(() => ProductsModule),
    forwardRef(() => OrdersModule),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}

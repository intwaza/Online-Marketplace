import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { StoresModule } from '../stores/stores.module';
import { CategoriesModule } from '../categories/categories.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    StoresModule,
    CategoriesModule,
    forwardRef(() => ReviewsModule), // Handle potential circular dependency
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Make sure ProductsService is exported
})
export class ProductsModule {}

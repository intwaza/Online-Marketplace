import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProcessorService } from './order-processor.service';
import { EmailService } from './email.service';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Order]),
    BullModule.registerQueue({
      name: 'order-processing',
    }),
  ],
  providers: [OrderProcessorService, EmailService],
  exports: [EmailService],
})
export class QueueModule {}

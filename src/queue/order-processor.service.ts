import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { EmailService } from './email.service';
import { OrderStatus } from '../common/enums/order-status.enum';

@Injectable()
@Processor('order-processing')
export class OrderProcessorService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private emailService: EmailService,
  ) {}

  @Process('process-order')
  async processOrder(job: Job<{ orderId: string; items: any[] }>) {
    const { orderId, items } = job.data;

    try {
      // Update stock quantities
      for (const item of items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });

        if (product) {
          product.stockQuantity -= item.quantity;
          await this.productRepository.save(product);
        }
      }

      // Get order details for email
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['user'],
      });

      if (order) {
        // Send order confirmation email
        await this.emailService.sendOrderConfirmationEmail(
          order.user.email,
          orderId,
          order.totalAmount,
        );

        console.log(`Order ${orderId} processed successfully`);
      }
    } catch (error) {
      console.error(`Error processing order ${orderId}:`, error);
      throw error;
    }
  }

  @Process('send-order-status-update')
  async sendOrderStatusUpdate(
    job: Job<{ email: string; orderId: string; status: string }>,
  ) {
    const { email, orderId, status } = job.data;

    try {
      await this.emailService.sendOrderStatusEmail(email, orderId, status);
      console.log(`Order status update email sent for order ${orderId}`);
    } catch (error) {
      console.error(`Error sending order status update email:`, error);
      throw error;
    }
  }
}

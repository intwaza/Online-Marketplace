import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { PaymentMethod } from '../../common/enums/payment-method.enum';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  paymentReference: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @ManyToOne(() => Order, (order) => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  orderId: string;
}

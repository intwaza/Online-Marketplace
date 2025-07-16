import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsString, IsOptional } from 'class-validator';
import { PaymentMethod } from '../../common/enums/payment-method.enum';

export class ProcessPaymentDto {
  @ApiProperty({ example: 'uuid-of-order' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '4111111111111111', required: false })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiProperty({ example: '12/25', required: false })
  @IsOptional()
  @IsString()
  cardExpiry?: string;

  @ApiProperty({ example: '123', required: false })
  @IsOptional()
  @IsString()
  cardCvv?: string;

  @ApiProperty({ example: '+250788123456', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
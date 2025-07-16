import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class SellerApplicationDto {
  @ApiProperty({ example: 'seller@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'My Store Name' })
  @IsString()
  storeName: string;

  @ApiProperty({ example: 'Store description', required: false })
  @IsOptional()
  @IsString()
  storeDescription?: string;
}

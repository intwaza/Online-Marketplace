import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 14 Pro' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Latest iPhone with amazing camera',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  categoryId: string;
}

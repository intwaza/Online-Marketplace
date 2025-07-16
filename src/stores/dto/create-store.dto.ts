import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'My Awesome Store' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Store description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
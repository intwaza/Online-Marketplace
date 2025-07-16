import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Create review (Shopper only)' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 403, description: 'Only shoppers can leave reviews' })
  @Post()
  @Roles(UserRole.SHOPPER)
  async create(@Body() createReviewDto: CreateReviewDto, @GetUser() user: User) {
    return this.reviewsService.create(createReviewDto, user);
  }

  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findById(id);
  }

  @ApiOperation({ summary: 'Update review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 403, description: 'You can only update your own reviews' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: CreateReviewDto, @GetUser() user: User) {
    return this.reviewsService.update(id, updateReviewDto, user);
  }

  @ApiOperation({ summary: 'Delete review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete your own reviews' })
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.reviewsService.remove(id, user);
    return { message: 'Review deleted successfully' };
  }
}

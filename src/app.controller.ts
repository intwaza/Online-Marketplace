import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  @ApiOperation({ summary: 'API welcome message' })
  @ApiResponse({
    status: 200,
    description: 'Welcome message with API information',
  })
  @Get()
  getWelcome() {
    return {
      message: 'Welcome to Marketplace API',
      documentation: '/api/docs',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        stores: '/api/stores',
        products: '/api/products',
        categories: '/api/categories',
        orders: '/api/orders',
        reviews: '/api/reviews',
        payments: '/api/payments',
      },
    };
  }
}

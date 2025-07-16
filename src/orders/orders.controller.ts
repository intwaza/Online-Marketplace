import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Place order (Shopper only)' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  @ApiResponse({ status: 403, description: 'Only shoppers can place orders' })
  @Post()
  @Roles(UserRole.SHOPPER)
  async create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    return this.ordersService.create(createOrderDto, user);
  }

  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @Get('all')
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.ordersService.findAll();
  }

  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({
    status: 200,
    description: 'User orders retrieved successfully',
  })
  @Get()
  async findUserOrders(@GetUser() user: User) {
    return this.ordersService.findByUser(user.id);
  }

  @ApiOperation({ summary: 'Get store orders (Seller only)' })
  @ApiResponse({
    status: 200,
    description: 'Store orders retrieved successfully',
  })
  @Get('store')
  @Roles(UserRole.SELLER)
  async findStoreOrders(@GetUser() user: User) {
    if (!user.store) {
      return [];
    }
    return this.ordersService.findByStore(user.store.id);
  }

  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @GetUser() user: User,
  ) {
    return this.ordersService.updateStatus(id, status, user);
  }

  @ApiOperation({ summary: 'Delete order' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'You can only delete your own orders',
  })
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.ordersService.remove(id, user);
    return { message: 'Order deleted successfully' };
  }
}

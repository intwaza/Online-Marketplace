import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Process payment' })
  @ApiResponse({ status: 201, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Payment processing failed' })
  @Post('process')
  async processPayment(
    @Body() processPaymentDto: ProcessPaymentDto,
    @GetUser() user: User,
  ) {
    return this.paymentsService.processPayment(processPaymentDto, user);
  }

  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @ApiOperation({ summary: 'Get payments for order' })
  @ApiResponse({
    status: 200,
    description: 'Order payments retrieved successfully',
  })
  @Get('order/:orderId')
  async findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(orderId);
  }

  @ApiOperation({ summary: 'Refund payment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Can only refund completed payments',
  })
  @Put(':id/refund')
  @Roles(UserRole.ADMIN)
  async refund(@Param('id') id: string) {
    return this.paymentsService.refundPayment(id);
  }
}

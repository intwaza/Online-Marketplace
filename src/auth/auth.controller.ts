import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SellerApplicationDto } from './dto/seller-application.dto';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Verify email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 404, description: 'Invalid verification token' })
  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

    @ApiOperation({ summary: 'Approve seller (Admin only)' })
    @ApiResponse({ status: 200, description: 'Seller approved successfully' })
    @Post('approve-seller/:email')
    @Roles(UserRole.ADMIN)
    async approveSeller(
    @Param('email') email: string,
    @Body() body?: { isUpgrade?: boolean }
    ) {
    const isUpgrade = body?.isUpgrade || false;
    return this.authService.approveSeller(email, isUpgrade);
    }

    // Alternative: Create separate endpoints for clarity
    @ApiOperation({ summary: 'Approve new seller (Admin only)' })
    @ApiResponse({ status: 200, description: 'New seller approved successfully' })
    @Post('approve-seller/:email')
    @Roles(UserRole.ADMIN)
    async approveNewSeller(@Param('email') email: string) {
    return this.authService.approveSeller(email, false);
    }

    @ApiOperation({ summary: 'Upgrade shopper to seller (Admin only)' })
    @ApiResponse({ status: 200, description: 'Shopper upgraded to seller successfully' })
    @Post('upgrade-to-seller/:email')
    @Roles(UserRole.ADMIN)
    async upgradeToSeller(@Param('email') email: string) {
    return this.authService.approveSeller(email, true);
    }
}
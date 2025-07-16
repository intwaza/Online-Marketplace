import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SellerApplicationDto } from './dto/seller-application.dto';
import { EmailService } from 'src/queue/email.service';
import { UserRole } from '../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      verificationToken,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return {
      message: 'User registered successfully. Please check your email for verification.',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    await this.usersService.update(user.id, {
      isVerified: true,
      verificationToken: undefined,
    });

    return { message: 'Email verified successfully' };
  }

  async applyAsSeller(sellerApplicationDto: SellerApplicationDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(sellerApplicationDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create a pending seller application (we'll store this in a separate table or use a flag)
    // For now, we'll send email to admin
    await this.emailService.sendSellerApplicationEmail(sellerApplicationDto);

    return {
      message: 'Seller application submitted successfully. You will receive an email once approved.',
    };
  }

  async approveSeller(email: string) {
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create seller account
    const user = await this.usersService.create({
      email,
      name: 'Seller', // Will be updated by user
      password: hashedPassword,
      role: UserRole.SELLER,
      isVerified: true,
    });

    // Send account creation email
    await this.emailService.sendSellerApprovalEmail(email, tempPassword);

    return {
      message: 'Seller approved and account created successfully',
      userId: user.id,
    };
  }
}
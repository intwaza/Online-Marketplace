import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SellerApplicationDto } from './dto/seller-application.dto';
import { EmailService } from '../queue/email.service';
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
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const verificationToken = uuidv4();

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      verificationToken,
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );

    return {
      message:
        'User registered successfully. Please check your email for verification.',
      userId: user.id,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    console.log('user', user);
    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    await this.usersService.update(user.id, {
      isVerified: true,
      verificationToken: undefined,
    });

    return { message: 'Email verified successfully' };
  }

  async login(loginDto: LoginDto) {

    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }


    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }


    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }


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



  async applyAsSeller(sellerApplicationDto: SellerApplicationDto) {
    const existingUser = await this.usersService.findByEmail(
      sellerApplicationDto.email,
    );

    if (existingUser) {

      switch (existingUser.role) {
        case UserRole.SELLER:
          throw new ConflictException('User is already a seller');

        case UserRole.ADMIN:
          throw new ConflictException('Admin users cannot apply as sellers');

        case UserRole.SHOPPER:
          await this.emailService.sendSellerApplicationEmail({
            ...sellerApplicationDto,
            upgradeRequest: true, 
          });

          return {
            message:
              'Seller upgrade application submitted successfully. You will receive an email once approved.',
            type: 'upgrade',
          };

        default:
          throw new ConflictException(
            'Invalid user role for seller application',
          );
      }
    }


    await this.emailService.sendSellerApplicationEmail(sellerApplicationDto);

    return {
      message:
        'Seller application submitted successfully. You will receive an email once approved.',
      type: 'new_application',
    };
  }


  async approveSeller(email: string, isUpgrade: boolean = false) {
    const existingUser = await this.usersService.findByEmail(email);

    if (isUpgrade && existingUser && existingUser.role === UserRole.SHOPPER) {
      await this.usersService.update(existingUser.id, {
        role: UserRole.SELLER,
      });


      await this.emailService.sendSellerUpgradeEmail(email);

      return {
        message: 'Shopper successfully upgraded to seller',
        userId: existingUser.id,
        type: 'upgrade',
      };
    }

    if (existingUser) {
      throw new ConflictException(
        'User already exists. Use upgrade process instead.',
      );
    }


    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await this.usersService.create({
      email,
      name: 'Seller',
      password: hashedPassword,
      role: UserRole.SELLER,
      isVerified: true,
    });

    await this.emailService.sendSellerApprovalEmail(email, tempPassword);

    return {
      message: 'Seller approved and account created successfully',
      userId: user.id,
      type: 'new_account',
    };
  }
}

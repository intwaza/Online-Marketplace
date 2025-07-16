import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: RegisterDto & { verificationToken?: string; isVerified?: boolean }): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'name', 'role', 'isVerified', 'createdAt', 'updatedAt'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'role', 'isVerified', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { verificationToken: token } });
  }

  async update(id: string, updateUserDto: UpdateUserDto & { verificationToken?: string; isVerified?: boolean; role?: UserRole }): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async createAdmin(): Promise<User> {
    const adminEmail = 'admin@marketplace.com';
    const existingAdmin = await this.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      return this.create({
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isVerified: true,
      });
    }
    
    return existingAdmin;
  }
}
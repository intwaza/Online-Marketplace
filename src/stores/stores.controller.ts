import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Stores')
@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StoresController {
  constructor(private storesService: StoresService) {}

  @ApiOperation({ summary: 'Create store (Seller only)' })
  @ApiResponse({ status: 201, description: 'Store created successfully' })
  @ApiResponse({ status: 403, description: 'Only sellers can create stores' })
  @Post()
  @Roles(UserRole.SELLER)
  async create(@Body() createStoreDto: CreateStoreDto, @GetUser() user: User) {
    return this.storesService.create(createStoreDto, user);
  }

  @ApiOperation({ summary: 'Get all stores' })
  @ApiResponse({ status: 200, description: 'Stores retrieved successfully' })
  @Get()
  async findAll() {
    return this.storesService.findAll();
  }

  @ApiOperation({ summary: 'Get store by ID' })
  @ApiResponse({ status: 200, description: 'Store retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.storesService.findById(id);
  }

  @ApiOperation({ summary: 'Update store' })
  @ApiResponse({ status: 200, description: 'Store updated successfully' })
  @ApiResponse({ status: 403, description: 'You can only update your own store' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateStoreDto: CreateStoreDto, @GetUser() user: User) {
    return this.storesService.update(id, updateStoreDto, user);
  }

  @ApiOperation({ summary: 'Approve store (Admin only)' })
  @ApiResponse({ status: 200, description: 'Store approved successfully' })
  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  async approve(@Param('id') id: string) {
    return this.storesService.approve(id);
  }

  @ApiOperation({ summary: 'Delete store' })
  @ApiResponse({ status: 200, description: 'Store deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete your own store' })
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.storesService.remove(id, user);
    return { message: 'Store deleted successfully' };
  }
}
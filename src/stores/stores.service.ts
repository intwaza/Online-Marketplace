import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto, user: User): Promise<Store> {
    // Check if user is seller
    if (user.role !== UserRole.SELLER) {
      throw new ForbiddenException('Only sellers can create stores');
    }

    // Check if seller already has a store
    const existingStore = await this.storeRepository.findOne({
      where: { ownerId: user.id },
    });
    if (existingStore) {
      throw new ConflictException('Seller can only have one store');
    }

    const store = this.storeRepository.create({
      ...createStoreDto,
      ownerId: user.id,
    });

    return this.storeRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find({
      relations: ['owner'],
      select: {
        owner: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
  }

  async findById(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['owner', 'products'],
      select: {
        owner: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  async findByOwner(ownerId: string): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { ownerId },
      relations: ['products'],
    });
  }

  async update(
    id: string,
    updateStoreDto: CreateStoreDto,
    user: User,
  ): Promise<Store> {
    const store = await this.findById(id);

    // Check if user owns the store or is admin
    if (user.role !== UserRole.ADMIN && store.ownerId !== user.id) {
      throw new ForbiddenException('You can only update your own store');
    }

    Object.assign(store, updateStoreDto);
    return this.storeRepository.save(store);
  }

  async approve(id: string): Promise<Store> {
    const store = await this.findById(id);
    store.isApproved = true;
    return this.storeRepository.save(store);
  }

  async remove(id: string, user: User): Promise<void> {
    const store = await this.findById(id);

    // Check if user owns the store or is admin
    if (user.role !== UserRole.ADMIN && store.ownerId !== user.id) {
      throw new ForbiddenException('You can only delete your own store');
    }

    await this.storeRepository.remove(store);
  }
}

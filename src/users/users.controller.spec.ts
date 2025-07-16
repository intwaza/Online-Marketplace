import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '../common/enums/user-role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.SHOPPER,
    isVerified: true,
  };

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockUser as any);

      expect(service.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateDto };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser as any, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockUser.id, updateDto);
      expect(result).toEqual(updatedUser);
    });
  });
});
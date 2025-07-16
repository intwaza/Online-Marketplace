import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { UserRole } from '../common/enums/user-role.enum';

describe('StoresController', () => {
  let controller: StoresController;
  let service: StoresService;

  const mockUser = {
    id: '1',
    role: UserRole.SELLER,
  };

  const mockStore = {
    id: '1',
    name: 'Test Store',
    description: 'Test description',
    ownerId: '1',
  };

  const mockStoresService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    approve: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        {
          provide: StoresService,
          useValue: mockStoresService,
        },
      ],
    }).compile();

    controller = module.get<StoresController>(StoresController);
    service = module.get<StoresService>(StoresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a store', async () => {
      const createDto = { name: 'Test Store', description: 'Test description' };
      mockStoresService.create.mockResolvedValue(mockStore);

      const result = await controller.create(createDto, mockUser as any);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockStore);
    });
  });

  describe('findAll', () => {
    it('should return all stores', async () => {
      const stores = [mockStore];
      mockStoresService.findAll.mockResolvedValue(stores);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(stores);
    });
  });

  describe('approve', () => {
    it('should approve a store', async () => {
      const approvedStore = { ...mockStore, isApproved: true };
      mockStoresService.approve.mockResolvedValue(approvedStore);

      const result = await controller.approve('1');

      expect(service.approve).toHaveBeenCalledWith('1');
      expect(result).toEqual(approvedStore);
    });
  });
});

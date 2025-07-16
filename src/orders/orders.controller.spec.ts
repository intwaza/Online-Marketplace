import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UserRole } from '../common/enums/user-role.enum';
import { OrderStatus } from '../common/enums/order-status.enum';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockUser = {
    id: '1',
    role: UserRole.SHOPPER,
  };

  const mockOrder = {
    id: 'order-1',
    userId: '1',
    totalAmount: 100,
    status: OrderStatus.PENDING,
    items: [],
  };

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findByStore: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const createDto = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };
      mockOrdersService.create.mockResolvedValue(mockOrder);

      const result = await controller.create(createDto, mockUser as any);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findAll', () => {
    it('should return all orders for admin', async () => {
      const orders = [mockOrder];
      mockOrdersService.findAll.mockResolvedValue(orders);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(orders);
    });
  });

  describe('findUserOrders', () => {
    it('should return user orders', async () => {
      const orders = [mockOrder];
      mockOrdersService.findByUser.mockResolvedValue(orders);

      const result = await controller.findUserOrders(mockUser as any);

      expect(service.findByUser).toHaveBeenCalledWith('1');
      expect(result).toEqual(orders);
    });
  });

  describe('findStoreOrders', () => {
    it('should return store orders for seller', async () => {
      const seller = {
        ...mockUser,
        role: UserRole.SELLER,
        store: { id: 'store-1' },
      };
      const orders = [mockOrder];
      mockOrdersService.findByStore.mockResolvedValue(orders);

      const result = await controller.findStoreOrders(seller as any);

      expect(service.findByStore).toHaveBeenCalledWith('store-1');
      expect(result).toEqual(orders);
    });

    it('should return empty array when seller has no store', async () => {
      const seller = { ...mockUser, role: UserRole.SELLER, store: null };

      const result = await controller.findStoreOrders(seller as any);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      mockOrdersService.findById.mockResolvedValue(mockOrder);

      const result = await controller.findOne('order-1');

      expect(service.findById).toHaveBeenCalledWith('order-1');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const updatedOrder = { ...mockOrder, status: OrderStatus.PROCESSING };
      mockOrdersService.updateStatus.mockResolvedValue(updatedOrder);

      const result = await controller.updateStatus(
        'order-1',
        OrderStatus.PROCESSING,
        mockUser as any,
      );

      expect(service.updateStatus).toHaveBeenCalledWith(
        'order-1',
        OrderStatus.PROCESSING,
        mockUser,
      );
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('remove', () => {
    it('should remove an order', async () => {
      mockOrdersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('order-1', mockUser as any);

      expect(service.remove).toHaveBeenCalledWith('order-1', mockUser);
      expect(result).toEqual({ message: 'Order deleted successfully' });
    });
  });
});

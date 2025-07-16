import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { UserRole } from '../common/enums/user-role.enum';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  const mockUser = {
    id: '1',
    role: UserRole.SHOPPER,
  };

  const mockReview = {
    id: '1',
    userId: '1',
    productId: '1',
    rating: 5,
    comment: 'Great product!',
    user: mockUser,
    product: { id: '1', name: 'Test Product' },
  };

  const mockReviewsService = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByProduct: jest.fn(),
    getProductRatingStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a review', async () => {
      const createDto = {
        productId: '1',
        rating: 5,
        comment: 'Great product!',
      };
      mockReviewsService.create.mockResolvedValue(mockReview);

      const result = await controller.create(createDto, mockUser as any);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockReview);
    });
  });

  describe('findOne', () => {
    it('should return a review by id', async () => {
      mockReviewsService.findById.mockResolvedValue(mockReview);

      const result = await controller.findOne('1');

      expect(service.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockReview);
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      const updateDto = {
        productId: '1',
        rating: 4,
        comment: 'Good product',
      };
      const updatedReview = { ...mockReview, ...updateDto };
      mockReviewsService.update.mockResolvedValue(updatedReview);

      const result = await controller.update('1', updateDto, mockUser as any);

      expect(service.update).toHaveBeenCalledWith('1', updateDto, mockUser);
      expect(result).toEqual(updatedReview);
    });
  });

  describe('remove', () => {
    it('should remove a review', async () => {
      mockReviewsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1', mockUser as any);

      expect(service.remove).toHaveBeenCalledWith('1', mockUser);
      expect(result).toEqual({ message: 'Review deleted successfully' });
    });
  });
});
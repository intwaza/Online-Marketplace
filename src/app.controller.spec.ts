import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      // Remove EmailService since your AppController might not use it
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWelcome', () => {
    it('should return welcome message with API information', () => {
      const result = controller.getWelcome();

      expect(result).toEqual({
        message: 'Welcome to Marketplace API',
        documentation: '/api/docs',
        health: '/api/health',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          stores: '/api/stores',
          products: '/api/products',
          categories: '/api/categories',
          orders: '/api/orders',
          reviews: '/api/reviews',
          payments: '/api/payments',
        },
      });
    });

    it('should have correct message', () => {
      const result = controller.getWelcome();
      expect(result.message).toBe('Welcome to Marketplace API');
    });

    it('should have documentation endpoint', () => {
      const result = controller.getWelcome();
      expect(result.documentation).toBe('/api/docs');
    });

    it('should have health endpoint', () => {
      const result = controller.getWelcome();
      expect(result.health).toBe('/api/health');
    });

    it('should have version information', () => {
      const result = controller.getWelcome();
      expect(result.version).toBe('1.0.0');
    });

    it('should have all required endpoints', () => {
      const result = controller.getWelcome();
      const expectedEndpoints = [
        'auth',
        'users',
        'stores',
        'products',
        'categories',
        'orders',
        'reviews',
        'payments',
      ];

      expectedEndpoints.forEach((endpoint) => {
        expect(result.endpoints).toHaveProperty(endpoint);
        expect(result.endpoints[endpoint]).toBe(`/api/${endpoint}`);
      });
    });

    it('should return object with correct structure', () => {
      const result = controller.getWelcome();

      expect(typeof result).toBe('object');
      expect(typeof result.message).toBe('string');
      expect(typeof result.documentation).toBe('string');
      expect(typeof result.health).toBe('string');
      expect(typeof result.version).toBe('string');
      expect(typeof result.endpoints).toBe('object');
    });
  });
});

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));


  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Marketplace API')
    .setDescription('A comprehensive online marketplace API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Users')
    .addTag('Stores')
    .addTag('Products')
    .addTag('Categories')
    .addTag('Orders')
    .addTag('Reviews')
    .addTag('Payments')
    .addTag('Health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Add a simple root route handler
  app.use('/', (req, res, next) => {
    if (req.method === 'GET' && req.url === '/') {
      res.json({
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
        }
      });
    } else {
      next();
    }
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
  console.log(`Health check available at: http://localhost:${port}/api/health`);
}

bootstrap();
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Welcome to Online Marketplace API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        api: '/api',
        docs: '/api/docs', 
      }
    };
  }
}
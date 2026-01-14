# Online Marketplace API

A full-featured marketplace backend built with NestJS. This started as a learning project to understand how real e-commerce systems work—authentication, role-based access, order processing, and all the moving parts that make online marketplaces tick.

**Live Demo:** [online-marketplace-api](https://online-marketplace-production-91b8.up.railway.app)  
**API Docs:** [Swagger UI](https://online-marketplace-production-91b8.up.railway.app/api/docs)

## What it does

This API handles the complete lifecycle of an online marketplace:
- Users can register as shoppers, apply to become sellers, or get admin privileges
- Sellers manage their stores and products
- Shoppers browse, order, and review products
- Admins oversee the entire platform
- Background jobs handle emails and notifications
- Simulated payment processing (card and mobile money)

## Tech Stack

**Backend:** NestJS (Node.js + TypeScript)  
**Database:** PostgreSQL with TypeORM  
**Cache & Queues:** Redis + Bull for background jobs  
**Email:** Nodemailer for transactional emails  
**Docs:** Swagger/OpenAPI  
**Deployment:** Docker + Railway

## Key Features

### Role-Based System
Built three distinct user experiences:

**Admin (Full Control)**
- Approve seller applications
- Manage users, stores, products, and orders
- Feature products and organize categories
- Handle refunds and disputes

**Seller (Store Management)**
- Apply to sell via email verification
- Create and manage one store
- Add products with inventory tracking
- Process incoming orders
- View sales analytics

**Shopper (Customer Experience)**
- Browse products and stores
- Place orders with delivery tracking
- Leave reviews and ratings
- Receive email notifications for order updates

### Authentication & Security
- JWT-based authentication
- Email verification for new accounts
- Role-based access control with guards
- Password hashing with bcrypt
- Protected routes based on user roles

### Background Processing
- Bull queues for async tasks
- Email notifications (order confirmations, status updates, seller approvals)
- Redis for caching and job management

### Payment Simulation
- Mock card and mobile money payments
- Payment records linked to orders
- Refund support for admins

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- Docker (optional)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/intwaza/Online-Marketplace.git
cd Online-Marketplace

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your database, JWT secret, email config, and Redis URL

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

Access the API at `http://localhost:3000`  
Explore endpoints at `http://localhost:3000/api/docs`

### Docker Setup

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down
```

## API Overview

All endpoints are documented in Swagger. Here are the main routes:

**Authentication**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `POST /api/auth/verify-email` - Verify email address

**Stores**
- `GET /api/stores` - List all stores
- `POST /api/stores` - Create store (sellers only)
- `PUT /api/stores/:id` - Update store

**Products**
- `GET /api/products` - Browse products
- `POST /api/products` - Add product (sellers only)
- `PUT /api/products/:id` - Update product

**Orders**
- `POST /api/orders` - Place order
- `GET /api/orders` - View orders
- `PATCH /api/orders/:id/status` - Update order status

**Payments**
- `POST /api/payments` - Process payment
- `GET /api/payments/:id` - View payment details

Visit `/api/docs` for complete endpoint documentation with request/response examples.

## Project Structure

```
src/
├── auth/           # Authentication & authorization
├── users/          # User management
├── stores/         # Store operations
├── products/       # Product catalog
├── orders/         # Order processing
├── payments/       # Payment handling
├── reviews/        # Product reviews
├── email/          # Email service
├── queues/         # Background jobs
└── common/         # Shared utilities
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## What I Learned

Building this taught me a lot about:
- Structuring a real-world NestJS application
- Implementing role-based access control properly
- Managing async workflows with queues
- Handling transactional emails
- Designing a scalable API architecture
- Writing maintainable TypeScript code

The modular structure makes it easy to add new features or modify existing ones without breaking things.

## Deployment

Currently deployed on Railway with:
- PostgreSQL database
- Redis for queues
- SSL enabled
- Environment-based configuration

## Future Improvements

Some ideas I'm considering:
- Add real payment gateway integration (Stripe/PayPal)
- Implement product search with Elasticsearch
- Add file upload for product images
- Create admin dashboard
- Implement inventory alerts
- Add order analytics and reporting

---

**Note:** This is a portfolio project showcasing backend development skills. Payment processing is simulated for demonstration purposes.


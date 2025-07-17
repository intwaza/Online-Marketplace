# Online Marketplace API

A production-ready **NestJS-based RESTful API** for an online marketplace. Supports user authentication, store management, product listings, order processing, and mock payments — all built with **TypeScript**, **PostgreSQL**, **Redis**, and **Docker**.

### Live Demo

* **API**: [online-marketplace](https://online-marketplace-production-91b8.up.railway.app)
* **Swagger Docs**: [/api/docs](https://online-marketplace-production-91b8.up.railway.app/api/docs)
* Use the Swagger UI to explore and test endpoints.


## Authentication & Roles

* **JWT-based** auth with email verification
* **Role-based access control**: Admin, Seller, Shopper
* Password hashing (`bcrypt`), secure tokens
* Guard-protected routes per role


## Core Features by Role

### Admin (GOD MODE)

* Approve sellers, manage users/stores/products/orders
* Feature products and manage categories
* Full system control

### Seller

* Apply via email
* Manage a store and products
* Handle incoming orders and view sales analytics

### Shopper

* Browse, order, track delivery, and review products
* Get email notifications for updates


## Payments

* Simulated card and mobile money payments
* Payment records linked to orders
* Refund support for admins


## Architecture Overview

```
Clients ↔ API Gateway (NestJS) ↔ Auth | Services | Queue
                              ↘ PostgreSQL, Redis, Email
```

* **Redis + Bull** for background queues
* **Nodemailer** for email events
* **Swagger** for self-documented APIs
* **Docker** for containerized deployment


## Tech Stack

| Tech                | Description                      |
| ------------------- | -------------------------------- |
| **NestJS**          | Backend framework (Node.js + TS) |
| **PostgreSQL**      | Relational database with TypeORM |
| **Redis + Bull**    | Queue processing system          |
| **Nodemailer**      | Email sending service            |
| **Swagger/OpenAPI** | API documentation                |
| **Docker**          | Containerization                 |
| **Jest**            | Testing framework                |

## Getting Started

### Prerequisites

* Node.js 18+
* PostgreSQL 13+
* Redis (for queues)
* Docker (optional but recommended)

### Setup Instructions

```bash
# 1. Clone the project
git clone https://github.com/intwaza/Online-Marketplace.git
cd Online-Marketplace

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill out .env with database, JWT, email, and Redis config

# 4. Start app in development
npm run start:dev
```

Access API at: `http://localhost:3000`
Swagger UI at: `http://localhost:3000/api/docs`

---

## Docker Quickstart

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down
```


## API Overview

Here’s a sample of available endpoints:

* `/api/auth/register` – Register a user
* `/api/auth/login` – Login and receive JWT
* `/api/stores` – Create and manage stores
* `/api/products` – List and manage products
* `/api/orders` – Place, view, and manage orders
* `/api/payments` – Process and track payments

Explore them all via Swagger at `/api/docs`.


## Testing

```bash
npm run test       
npm run test:e2e   
npm run test:cov   
```


## Roles Summary

| Role    | Permissions                                                                |
| ------- | -------------------------------------------------------------------------- |
| Admin   | System-wide control: users, stores, categories, featured products, refunds |
| Seller  | One store, manage products/orders, see sales analytics                     |
| Shopper | Browse, buy, review, view order history                                    |


## Deployment

Currently hosted on [Railway](https://railway.app).
Includes SSL, PostgreSQL, Redis, and environment support.


## Highlights

* Robust modular structure (follows NestJS best practices)
* Realistic e-commerce flows
* Scalable design with queues and email notifications
* Easy to test, run, and deploy



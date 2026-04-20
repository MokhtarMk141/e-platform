# Smart E-Commerce Platform

E-commerce platform with Next.js (frontend), Express.js (backend), and PostgreSQL. Features integrated AI chatbot for product discovery and Stripe for payments.

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS
- **Backend:** Express 5, TypeScript, Prisma ORM
- **Database:** PostgreSQL 15
- **Deploy:** Docker Compose

## Setup Instructions

### 1. Requirements
- Docker Desktop
- Git

### 2. Configure Environment
Create a `.env` file in the root directory:

```env
DATABASE_URL_DOCKER=postgresql://ecommerce_user:ecommerce_pass@postgres:5432/ecommerce_db?schema=public
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:3000

STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@ecommerce.com
```

### 3. Run the Application
Start all containers:
```bash
docker-compose up -d
```

Migrations run automatically on container start.

### 4. Seed Database (Optional)
Populate test data:
```bash
docker exec -it ecommerce-backend npm run prisma:seed
```

### 5. Access Endpoints
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **pgAdmin (DB Viewer):** http://localhost:8080 (Login: `admin@example.com` / `admin`)

## Developer Commands

**View Logs:**
```bash
docker-compose logs -f
```

**Run Database Migration:**
Modify `backend/prisma/schema.prisma` locally, then apply:
```bash
docker exec -it ecommerce-backend npx prisma migrate dev --name <migration_name>
```

**Stop Services:**
```bash
docker-compose down
```

**Full Reset (Wipes Database):**
```bash
docker-compose down -v
```

<div align="center">
  
# 🛍️ Smart E-Commerce Platform

A production-ready e-commerce platform built with Next.js and Express.js. It features an integrated AI chatbot for sophisticated product discovery, secure Stripe payments, and a fully Dockerized development environment engineered for scale.

</div>

## 🚀 Tech Stack & Architecture

This platform was built to maintain robust, modern engineering standards from frontend to database.

### Core Technologies
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Zustand for state management.
- **Backend:** Express 5, TypeScript, Zod for strict runtime validation.
- **Database:** PostgreSQL 15, managed via Prisma ORM.
- **Infrastructure:** Fully containerized with Docker & Docker Compose.
- **Integrations:** Stripe for secure payment processing, Nodemailer for automated SMTP workflows.

### 🧠 Modern AI Integration
Rather than implementing a simple keyword-search tool, the platform integrates a sophisticated AI chatbot. It utilizes **Function Calling** to interpret natural language user intents, translating them into structured, executable queries against the PostgreSQL database to retrieve precise product recommendations.

### 🏗️ Domain-Driven Backend
The Express API separates concerns into isolated modules (`auth`, `cart`, `payments`, `product`). 
- **Validation:** Strict runtime type checking using `Zod` ensures malformed payloads fail early (e.g., catching missing checkout fields immediately).
- **Relational Integrity:** The `Prisma` schema handles complex interconnectivity: Products link to Brands, Categories (hierarchical slugs), Flash Sales, and promotional Discounts.
- **Security:** Secrets are strictly injected via `.env` interpolation at runtime, keeping configuration clean and bypassing repository secret scanners.

---

## 💻 Getting Started

The platform utilizes a containerized architecture to eliminate manual database installations and local web server configurations. Following these steps will boot the entire ecosystem.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Must be running)
- [Git](https://git-scm.com/)

### 2. Environment Configuration
The application requires specific environment variables for secure database connections and external APIs (like Stripe). 

Create a file named `.env` in the root of the project (where this README is located) and populate it with your local configuration:

```env
# Database Configuration
DATABASE_URL_DOCKER=postgresql://ecommerce_user:ecommerce_pass@postgres:5432/ecommerce_db?schema=public

# Security Settings
JWT_SECRET=your_super_secret_jwt_string_here

# Network Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Stripe Credentials (replace with your test keys if testing real payments)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@ecommerce.com
```

### 3. Build and Run the Platform
Open your terminal in the project directory and invoke Docker Compose. This single command builds the custom NodeJS containers, sets up the custom `ecommerce-network`, boots the database, and runs the necessary Prisma migrations automatically.

```bash
docker-compose up -d
```

### 4. Create Demo Data (Optional)
If you are starting with a fresh database, you can automatically seed it with categories, brands, and products by executing a script within the running backend container:

```bash
docker exec -it ecommerce-backend npm run prisma:seed
```

### 5. Access the Services
Once running, the interconnected services are available locally:
- 🛍️ **Next.js Storefront:** [http://localhost:3000](http://localhost:3000)
- 🔌 **Express API:** [http://localhost:5000/api](http://localhost:5000/api)
- 🗄️ **pgAdmin Database Viewer:** [http://localhost:8080](http://localhost:8080) *(Login: `admin@example.com` / Password: `admin`)*

---

## 🐳 Developer Workflows

Hot-reloading is configured by default. Any changes made to the React code in `./frontend` or the TypeScript controllers in `./backend` will automatically trigger a rebuild inside the containers.

**Viewing real-time unified logs:**
```bash
docker-compose logs -f
```

**Running Schema Changes locally:**
If you make modifications to `backend/prisma/schema.prisma`:
```bash
docker exec -it ecommerce-backend npx prisma migrate dev --name <migration_name>
```

**Stopping the Environment cleanly:**
```bash
docker-compose down
```

**Full Reset (Destroys database volumes):**
```bash
docker-compose down -v
```

<div align="center">
  
# 🛍️ Smart E-Commerce Platform

*Navigating complex online catalogs often leaves customers frustrated, leading to abandoned carts.*

The Smart E-Commerce Platform solves this by introducing an **AI-powered shopping assistant** directly into the user interface, helping customers discover the exact products they need naturally through conversation.

> 🚧 **Note:** This project is currently under active development.

</div>

---

## 📸 Screenshots

<div align="center">
  <img src="docs/screenshots/homepage.png" alt="Homepage - Hero section with brand carousel" width="90%">
  <br><em>Homepage — Hero banner with mega menu navigation and trusted brand logos</em>
  <br><br>
  <img src="docs/screenshots/product-listing.png" alt="Product listing with filters and categories" width="90%">
  <br><em>Product Listing — Category tabs, brand filters, and sortable product grid</em>
  <br><br>
  <img src="docs/screenshots/product-detail.png" alt="Product detail page" width="90%">
  <br><em>Product Detail — SKU info, pricing with discounts, stock availability, and specs table</em>
  <br><br>
  <img src="docs/screenshots/chatbot.png" alt="AI Chatbot assistant" width="90%">
  <br><em>AI Chatbot — "Oggy" assistant powered by DeepSeek for product recommendations</em>
  <br><br>
  <img src="docs/screenshots/login.png" alt="Login page" width="90%">
  <br><em>Authentication — Login page with PC build imagery and brand ticker</em>
</div>

---

## 🚀 Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Zustand
- **Backend:** Express 5, TypeScript, Zod
- **Database:** PostgreSQL 15, Prisma ORM
- **Infrastructure:** Docker & Docker Compose
- **Integrations:** Stripe (Payments), Nodemailer (Emails), AI (Function Calling)

---

## 🏗️ Architecture Profiles & Structure

### Project Layout
```text
ecommerce-platform/
├── backend/            # Express.js API (Port 5000)
│   ├── prisma/         # Database schema, migrations, and seeds
│   ├── src/            
│   │   ├── config/     # Environment, Database setups
│   │   ├── modules/    # Domain-specific logic (Auth, Products, Cart...)
│   │   └── utils/      # Helpers (Async handlers, email sender)
│   └── Dockerfile
├── frontend/           # Next.js Application (Port 3000)
│   ├── src/ 
│   │   ├── app/        # App Router Pages (Checkout, Mega Menu, Admin)
│   │   ├── hooks/      # Global state and data fetching
│   │   └── services/   # Client APIs communicating with the Backend
│   └── Dockerfile
├── docker-compose.yml  # Multi-container orchestration
└── .env                # Centralized Environment Secrets (Git Ignored)
```

### Domain-Driven Backend Design
The Express API separates concerns into isolated modules (`auth`, `cart`, `payments`, `product`). 
- **AI Integration:** Utilizes **Function Calling** to interpret natural language user intents, translating them into structured, executable queries against the database rather than simple keyword matching.
- **Validation:** Strict runtime type checking using `Zod` ensures malformed payloads fail early.
- **Relational Integrity:** The `Prisma` schema handles complex interconnectivity: Products link to Brands, Categories (hierarchical slugs), Flash Sales, and Promotional Discounts.
- **Security:** Secrets are strictly injected via `.env` interpolation at runtime, keeping configuration clean and keeping credentials out of source control.

---

## 💻 Getting Started

The platform utilizes a containerized architecture to eliminate manual database installations and local web server configurations. 

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Must be running)
- [Git](https://git-scm.com/)

### 2. Environment Configuration
Create a file named `.env` in the root of the project (where this README is located) and populate it with your local configuration keys:

```env
# Database Configuration
DATABASE_URL_DOCKER=postgresql://ecommerce_user:ecommerce_pass@postgres:5432/ecommerce_db?schema=public

# Security Settings
JWT_SECRET=your_super_secret_jwt_string_here

# Network Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Stripe Credentials (test keys)
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
This command builds the custom NodeJS containers, sets up the `ecommerce-network`, boots the database, and runs the necessary Prisma migrations automatically.

```bash
docker-compose up -d
```

### 4. Create Demo Data (Optional)
If you are starting with a fresh database, seed it with categories, brands, and products:

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

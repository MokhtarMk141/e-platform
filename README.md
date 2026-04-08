# AI-Powered E-Commerce Platform

A modern e-commerce platform with AI features built with Next.js, Express.js, and PostgreSQL.

## 🚀 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI/Mistral (planned)
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 20+
- Docker Desktop
- Git

## 🏗️ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/MokhtarMk141/e-platform.git
cd e-platform
```

### 2. Start with Docker

```bash
docker-compose up -d
```

### 3. Run database migrations

```bash
cd backend
npx prisma migrate dev
cd ..
```

The Docker backend now runs `prisma migrate deploy` automatically on startup, so existing committed migrations are applied when the container boots. Use `migrate dev` only when creating a new migration during development.

### 4. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

## 📁 Project Structure

ecommerce-platform/
├── backend/ # Express.js API
├── frontend/ # Next.js application
├── docker-compose.yml # Docker configuration
└── README.md

## 🛠️ Development

### Daily workflow

```bash
# Start development
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Database migrations

```bash
cd backend
npx prisma migrate dev --name migration_name
npx prisma generate
```

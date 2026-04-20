FROM node:20-slim

WORKDIR /app

# Install system dependencies needed for Prisma on Debian
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client during build
RUN npx prisma generate

# Copy rest of the source
COPY . .

EXPOSE 5000

# Generate again, apply pending migrations, and start
CMD sh -c "npx prisma generate && npm run prisma:deploy && npm run dev"

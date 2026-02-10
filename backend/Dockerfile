FROM node:20-alpine

WORKDIR /app

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

# Generate again at runtime (in case schema changed) and start
CMD sh -c "npx prisma generate && npm run dev"
// src/config/database.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple instances in development
  var prisma: PrismaClient | undefined;
}

// Use the global variable in dev to avoid "too many clients" errors
export const prisma: PrismaClient = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Optional helper to test DB connection
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

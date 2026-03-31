import dotenv from "dotenv";
// Loads from .env but DOES NOT override already set environment variables (important for Docker)
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  JWT_SECRET: requireEnv("JWT_SECRET"),
  DATABASE_URL: requireEnv("DATABASE_URL"),
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  PORT: parseInt(process.env.PORT || "3001", 10),
};

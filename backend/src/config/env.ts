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
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "noreply@ecommerce.com",
};

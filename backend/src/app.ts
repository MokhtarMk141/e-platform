import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { AppError } from "./exceptions/app-error";
import { errorMiddleware } from "./middlewares/error.middleware";

import userRoutes from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/product/product.routes";
import categoryRoutes from "./modules/category/category.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

app.use(errorMiddleware);

export default app;

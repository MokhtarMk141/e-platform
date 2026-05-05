import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env";
import { AppError } from "./exceptions/app-error";
import { errorMiddleware } from "./middlewares/error.middleware";

import userRoutes from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/product/product.routes";
import categoryRoutes from "./modules/category/category.routes";
import brandRoutes from "./modules/brand/brand.routes";
import cartRoutes from "./modules/cart/cart.routes";
import promotionRoutes from "./modules/promotion/promotion.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import orderRoutes from "./modules/order/order.routes";
import chatbotRoutes from "./modules/chatbot/chatbot.routes";
import homepageConfigRoutes from "./modules/homepage-config/homepage-config.routes";
import paymentRoutes from "./modules/payments/payments.routes";
import reviewRoutes from "./modules/review/review.routes";

const app = express();

app.use(
  helmet({
    // Allow frontend on a different origin (localhost:3000) to render uploaded images
    // served by backend (localhost:5000).
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use("/api/payments", paymentRoutes);

// Increased limits to allow for image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/homepage-config", homepageConfigRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

app.use(errorMiddleware);

export default app;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.get("/api", (req, res) => {
  res.json({ message: "yo hello u good ??" });
});
app.get("/hello", (req, res) => {
  res.json({ message: "hello world !!!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} - UPDATEddddD!`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});

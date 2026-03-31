// src/server.ts

import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";

const PORT = env.PORT;

async function startServer() {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();

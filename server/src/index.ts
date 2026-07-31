import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import requestRoutes from "./routes/requestRoutes";
import aiRoutes from "./routes/aiRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const corsOptions: cors.CorsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Service is healthy",
  });
});

app.get("/api/health/ai", (req, res) => {
  res.status(200).json({
    status: "OK",
    provider: process.env.AI_PROVIDER || "mock",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
  });
});

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);

    res.status(500).json({
      error: "Internal Server Error",
    });
  },
);

app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`,
  );
});

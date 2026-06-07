import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/Auth.js";
import chatRoutes from "./routes/Chat.js";
import viewRoutes from "./routes/Views.js";

const getAllowedOrigins = () => {
  const configuredOrigins = process.env.CORS_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins?.length) {
    return configuredOrigins;
  }

  return process.env.NODE_ENV === "production"
    ? ["https://pippo.debarghya.org"]
    : ["http://localhost:5173"];
};

export const createApp = ({ allowedOrigins = getAllowedOrigins() } = {}) => {
  const app = express();
  const allowedOriginSet = new Set(allowedOrigins);

  app.disable("x-powered-by");
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOriginSet.has(origin)) {
          return callback(null, true);
        }

        const error = new Error("Origin is not allowed by CORS");
        error.status = 403;
        return callback(error);
      },
    }),
  );
  app.use(clerkMiddleware());
  app.use(express.json({ limit: "32kb" }));
  app.use("/api", viewRoutes);
  app.use("/api", authRoutes);
  app.use("/api", chatRoutes);

  app.get("/", (req, res) => {
    res.json({ message: "Pippo GPT backend is running" });
  });

  app.get("/health", (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;

    return res.status(dbConnected ? 200 : 503).json({
      status: dbConnected ? "ok" : "degraded",
      database: dbConnected ? "connected" : "disconnected",
    });
  });

  app.use((error, req, res, next) => {
    if (error?.status === 403) {
      return res.status(403).json({ error: error.message });
    }

    return next(error);
  });

  return app;
};

export default createApp();

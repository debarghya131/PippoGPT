import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import chatRoutes from "./routes/Chat.js";
import authRoutes from "./routes/Auth.js";

dotenv.config();

const requiredEnvVars = ["MONGODB_URI", "GROQ_API_KEY", "GROQ_MODEL"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const ALLOW_START_WITHOUT_DB = process.env.ALLOW_START_WITHOUT_DB === "true";
let isDatabaseConnected = false;

app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", chatRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isDatabaseConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    isDatabaseConnected = false;
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

app.get("/", (req, res) => {
  res.json({ message: "Pippo GPT backend is running" });
});

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbConnected = dbState === 1 || isDatabaseConnected;
  const status = dbConnected ? "ok" : "degraded";

  return res.status(dbConnected ? 200 : 503).json({
    status,
    database: dbConnected ? "connected" : "disconnected",
  });
});

const startServer = async () => {
  try {
    await connectDB();
  } catch {
    if (!ALLOW_START_WITHOUT_DB) {
      process.exit(1);
    }

    console.warn("Starting server in degraded mode because database is unavailable.");
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

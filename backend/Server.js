import "dotenv/config";
import mongoose from "mongoose";
import app from "./App.js";

const isProduction = process.env.NODE_ENV === "production";
const requiredEnvVars = [
  "MONGODB_URI",
  "GROQ_API_KEY",
  "GROQ_MODEL",
  "CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  ...(isProduction ? ["ARCJET_KEY"] : []),
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const ALLOW_START_WITHOUT_DB = process.env.ALLOW_START_WITHOUT_DB === "true";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

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

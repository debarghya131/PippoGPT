import dotenv from "dotenv";
import mongoose from "mongoose";
import SiteStat from "../models/SiteStat.js";
import Thread from "../models/Thread.js";
import User from "../models/User.js";
import ViewSession from "../models/ViewSession.js";

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI in backend/.env");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const model of [User, Thread, SiteStat, ViewSession]) {
    const result = await model.syncIndexes();
    console.log(`${model.modelName} indexes synchronized`, result);
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Index synchronization failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

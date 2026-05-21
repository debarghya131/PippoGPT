import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI in backend/.env");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const users = await User.find({}).sort({ createdAt: 1 });
  let normalizedCount = 0;
  const missingClerkUsers = [];

  for (const user of users) {
    let changed = false;

    if (typeof user.passwordHash !== "string") {
      user.passwordHash = "";
      changed = true;
    }

    if (!user.clerkId) {
      missingClerkUsers.push({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      });
    }

    if (changed) {
      await user.save();
      normalizedCount += 1;
    }
  }

  console.log(`Scanned ${users.length} user(s).`);
  console.log(`Normalized ${normalizedCount} user(s).`);

  if (missingClerkUsers.length === 0) {
    console.log("All users already have a clerkId.");
  } else {
    console.log("Users still missing clerkId:");
    for (const user of missingClerkUsers) {
      console.log(`- ${user.email} (${user.name}) [${user.id}]`);
    }
    console.log(
      "These users will get a clerkId automatically the first time they sign in with Clerk using the same email.",
    );
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Clerk user migration failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

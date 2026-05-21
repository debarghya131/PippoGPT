import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/User.js";

const getPrimaryEmail = (clerkUser) =>
  clerkUser.emailAddresses.find((emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId)
    ?.emailAddress ||
  clerkUser.emailAddresses[0]?.emailAddress ||
  "";

const getDisplayName = (clerkUser) => {
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
  return fullName || clerkUser.username || getPrimaryEmail(clerkUser) || "Pippo User";
};

export const syncClerkUser = async (clerkUserId) => {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = getPrimaryEmail(clerkUser).toLowerCase();
  const name = getDisplayName(clerkUser);
  let user = await User.findOne({ clerkId: clerkUser.id });

  if (!user) {
    user = await User.findOne({ email });
  }

  if (user?.clerkId && user.clerkId !== clerkUser.id) {
    throw new Error(`Email ${email} is already linked to another Clerk account`);
  }

  if (!user) {
    try {
      user = await User.create({
        clerkId: clerkUser.id,
        email,
        name,
        passwordHash: "",
      });
      return user;
    } catch (error) {
      if (error?.code !== 11000) {
        throw error;
      }
    }

    user = await User.findOne({
      $or: [{ clerkId: clerkUser.id }, { email }],
    });
  }

  if (!user) {
    throw new Error("Unable to sync user record");
  }

  user.clerkId = clerkUser.id;
  user.email = email;
  user.name = name;

  if (!user.passwordHash) {
    user.passwordHash = "";
  }

  try {
    await user.save();
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    const existingUser = await User.findOne({
      $or: [{ clerkId: clerkUser.id }, { email }],
    });

    if (!existingUser) {
      throw error;
    }

    existingUser.clerkId = clerkUser.id;
    existingUser.email = email;
    existingUser.name = name;

    if (!existingUser.passwordHash) {
      existingUser.passwordHash = "";
    }

    await existingUser.save();
    return existingUser;
  }

  return user;
};

export const requireAuth = async (req, res, next) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
      return res.status(401).json({ error: "Please login first" });
    }

    req.user = await syncClerkUser(userId);
    return next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ error: "Unable to verify login" });
  }
};

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
  const user =
    (await User.findOne({
      $or: [{ clerkId: clerkUser.id }, { email }],
    })) ||
    new User();

  user.clerkId = clerkUser.id;
  user.email = email;
  user.name = name;

  if (!user.passwordHash) {
    user.passwordHash = "";
  }

  await user.save();

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

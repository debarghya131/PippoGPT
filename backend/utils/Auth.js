import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/User.js";

const getPrimaryEmailAddress = (clerkUser) =>
  clerkUser.emailAddresses.find((emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId) ||
  clerkUser.emailAddresses[0];

const getPrimaryEmail = (clerkUser) => getPrimaryEmailAddress(clerkUser)?.emailAddress || "";

export const hasVerifiedPrimaryEmail = (clerkUser) =>
  getPrimaryEmailAddress(clerkUser)?.verification?.status === "verified";

const getPrimaryPhone = (clerkUser) =>
  clerkUser.phoneNumbers.find((phoneNumber) => phoneNumber.id === clerkUser.primaryPhoneNumberId)
    ?.phoneNumber ||
  clerkUser.phoneNumbers[0]?.phoneNumber ||
  "";

const getDisplayName = (clerkUser) => {
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
  return (
    fullName ||
    clerkUser.username ||
    getPrimaryEmail(clerkUser) ||
    getPrimaryPhone(clerkUser) ||
    "Pippo User"
  );
};

const updateLinkedUser = async (user, { clerkId, email, name }) => {
  if (email) {
    const conflictingUser = await User.findOne({
      email,
      _id: { $ne: user._id },
    });

    if (conflictingUser) {
      throw new Error(`Email ${email} is already linked to another Clerk account`);
    }
  }

  user.clerkId = clerkId;
  user.name = name;
  user.email = email || undefined;
  user.passwordHash = typeof user.passwordHash === "string" ? user.passwordHash : "";
  await user.save();
  return user;
};

const canRelinkExistingUser = (user, profile) =>
  user.clerkId !== profile.clerkId && Boolean(profile.email) && profile.hasVerifiedPrimaryEmail;

export const syncClerkUser = async (clerkUserId) => {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const profile = {
    clerkId: clerkUser.id,
    email: getPrimaryEmail(clerkUser).toLowerCase() || undefined,
    name: getDisplayName(clerkUser),
    hasVerifiedPrimaryEmail: hasVerifiedPrimaryEmail(clerkUser),
  };
  let user = await User.findOne({ clerkId: profile.clerkId });

  if (user) {
    return updateLinkedUser(user, profile);
  }

  if (profile.email) {
    user = await User.findOne({ email: profile.email });

    if (user) {
      if (user.clerkId && !canRelinkExistingUser(user, profile)) {
        throw new Error(`Email ${profile.email} is already linked to another Clerk account`);
      }

      if (canRelinkExistingUser(user, profile)) {
        console.info("Relinking an existing local user to a verified Clerk account");
      }

      return updateLinkedUser(user, profile);
    }
  }

  try {
    return await User.create({
      clerkId: profile.clerkId,
      ...(profile.email ? { email: profile.email } : {}),
      name: profile.name,
      passwordHash: "",
    });
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }
  }

  user = await User.findOne({ clerkId: profile.clerkId });

  if (!user && profile.email) {
    user = await User.findOne({ email: profile.email });
  }

  if (
    !user ||
    (user.clerkId && user.clerkId !== profile.clerkId && !canRelinkExistingUser(user, profile))
  ) {
    throw new Error("Unable to safely sync user record");
  }

  if (canRelinkExistingUser(user, profile)) {
    console.info("Relinking an existing local user to a verified Clerk account");
  }

  return updateLinkedUser(user, profile);
};

const getAuthenticatedUserId = (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);

  if (!isAuthenticated || !userId) {
    res.status(401).json({ error: "Please login first" });
    return null;
  }

  return userId;
};

export const requireAuth = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    req.user = await User.findOne({ clerkId: userId });

    if (!req.user) {
      req.user = await syncClerkUser(userId);
    }

    return next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ error: "Unable to verify login" });
  }
};

export const requireFreshAuth = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req, res);

    if (!userId) {
      return;
    }

    req.user = await syncClerkUser(userId);
    return next();
  } catch (error) {
    console.error("Authentication sync error:", error.message);
    return res.status(401).json({ error: "Unable to sync login" });
  }
};

import { Router } from "express";
import User from "../models/User.js";
import {
  createAuthToken,
  hashPassword,
  requireAuth,
  verifyPassword,
} from "../utils/Auth.js";

const router = Router();

const buildAuthResponse = (user) => ({
  token: createAuthToken(user),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
});

router.post("/auth/register", async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!name || !email || password.length < 6) {
    return res.status(400).json({
      error: "Name, email, and a password of at least 6 characters are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: hashPassword(password),
    });

    return res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ error: "Failed to create account" });
  }
});

router.post("/auth/login", async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ error: "Failed to login" });
  }
});

router.get("/auth/me", requireAuth, (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

export default router;

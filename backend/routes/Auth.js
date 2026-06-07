import { Router } from "express";
import { requireAuth, requireFreshAuth } from "../utils/Auth.js";

const router = Router();

const buildUserResponse = (user) => ({
  id: user._id,
  clerkId: user.clerkId,
  name: user.name,
  email: user.email,
});

router.post("/auth/sync", requireFreshAuth, (req, res) => {
  return res.status(200).json({
    user: buildUserResponse(req.user),
  });
});

router.get("/auth/me", requireAuth, (req, res) => {
  return res.status(200).json({
    user: buildUserResponse(req.user),
  });
});

export default router;

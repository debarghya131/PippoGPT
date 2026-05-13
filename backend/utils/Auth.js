import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import User from "../models/User.js";

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_KEY_LENGTH = 64;

const getAuthSecret = () => process.env.AUTH_SECRET || process.env.GROQ_API_KEY;

const toBase64Url = (value) => Buffer.from(value).toString("base64url");

const fromBase64Url = (value) => Buffer.from(value, "base64url").toString("utf8");

const sign = (payload) =>
  createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, passwordHash) => {
  const [salt, storedHash] = passwordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const hash = scryptSync(password, salt, PASSWORD_KEY_LENGTH);
  const storedHashBuffer = Buffer.from(storedHash, "hex");

  return (
    hash.length === storedHashBuffer.length &&
    timingSafeEqual(hash, storedHashBuffer)
  );
};

export const createAuthToken = (user) => {
  const payload = toBase64Url(
    JSON.stringify({
      userId: user._id.toString(),
      exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE_SECONDS,
    }),
  );

  return `${payload}.${sign(payload)}`;
};

export const verifyAuthToken = (token) => {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payload, signature] = token.split(".");
  const expectedSignature = sign(payload);

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const data = JSON.parse(fromBase64Url(payload));

    if (!data.userId || !data.exp || data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const tokenData = verifyAuthToken(token);

  if (!tokenData) {
    return res.status(401).json({ error: "Please login first" });
  }

  const user = await User.findById(tokenData.userId).select("_id name email");

  if (!user) {
    return res.status(401).json({ error: "Please login first" });
  }

  req.user = user;
  return next();
};

import "dotenv/config";
import arcjet, { fixedWindow, tokenBucket } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const isProduction = process.env.NODE_ENV === "production";

const chatArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        tokenBucket({
          mode: "LIVE",
          characteristics: ["userId"],
          refillRate: 2,
          interval: "1d",
          capacity: 2,
        }),
      ],
    })
  : null;

const counterArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        fixedWindow({
          mode: "LIVE",
          characteristics: ["ip.src"],
          window: "1h",
          max: 60,
        }),
      ],
    })
  : null;

let hasLoggedMissingKeyWarning = false;

const handleUnavailableProtection = (res, next, message) => {
  if (!hasLoggedMissingKeyWarning) {
    console.warn(message);
    hasLoggedMissingKeyWarning = true;
  }

  if (isProduction) {
    return res.status(503).json({
      error: "Request protection is temporarily unavailable. Please try again later.",
    });
  }

  return next();
};

const logDecisionErrors = (decision) => {
  for (const { reason } of decision.results) {
    if (reason.isError()) {
      console.warn("Arcjet error:", reason.message);
    }
  }
};

export const protectChatRateLimit = async (req, res, next) => {
  if (!chatArcjet) {
    return handleUnavailableProtection(
      res,
      next,
      isProduction
        ? "ARCJET_KEY is missing. Chat requests are blocked in production."
        : "ARCJET_KEY is missing. Chat rate limiting is disabled outside production.",
    );
  }

  try {
    const decision = await chatArcjet.protect(req, {
      userId: req.user._id.toString(),
      requested: 1,
    });

    logDecisionErrors(decision);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Daily chat limit reached. You can send up to 2 messages per day.",
        });
      }

      return res.status(403).json({ error: "Request blocked by Arcjet." });
    }

    return next();
  } catch (error) {
    console.warn("Arcjet chat protection failed:", error.message);
    return handleUnavailableProtection(
      res,
      next,
      "Arcjet chat protection is unavailable.",
    );
  }
};

export const protectCounterRateLimit = async (req, res, next) => {
  if (!counterArcjet) {
    return handleUnavailableProtection(
      res,
      next,
      isProduction
        ? "ARCJET_KEY is missing. Counter updates are blocked in production."
        : "ARCJET_KEY is missing. Counter rate limiting is disabled outside production.",
    );
  }

  try {
    const decision = await counterArcjet.protect(req);

    logDecisionErrors(decision);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Too many counter updates. Please try again later.",
        });
      }

      return res.status(403).json({ error: "Request blocked by Arcjet." });
    }

    return next();
  } catch (error) {
    console.warn("Arcjet counter protection failed:", error.message);
    return handleUnavailableProtection(
      res,
      next,
      "Arcjet counter protection is unavailable.",
    );
  }
};

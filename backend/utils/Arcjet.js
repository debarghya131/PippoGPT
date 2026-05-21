import arcjet, { tokenBucket } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;

const aj = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        tokenBucket({
          mode: "LIVE",
          characteristics: ["userId"],
          refillRate: 3,
          interval: 86400,
          capacity: 3,
        }),
      ],
    })
  : null;

let hasLoggedMissingKeyWarning = false;

const logMissingKeyWarning = () => {
  if (!hasLoggedMissingKeyWarning) {
    console.warn("ARCJET_KEY is missing. Arcjet rate limiting is disabled.");
    hasLoggedMissingKeyWarning = true;
  }
};

export const protectChatRateLimit = async (req, res, next) => {
  if (!aj) {
    logMissingKeyWarning();
    return next();
  }

  try {
    const decision = await aj.protect(req, {
      userId: req.user._id.toString(),
      requested: 1,
    });

    for (const { reason } of decision.results) {
      if (reason.isError()) {
        console.warn("Arcjet error:", reason.message);
      }
    }

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Daily chat limit reached. You can send up to 3 messages per day.",
        });
      }

      return res.status(403).json({
        error: "Request blocked by Arcjet.",
      });
    }

    return next();
  } catch (error) {
    console.warn("Arcjet protect failed:", error.message);
    return next();
  }
};

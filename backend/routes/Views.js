import { createHash } from "crypto";
import { Router } from "express";
import SiteStat from "../models/SiteStat.js";
import ViewSession from "../models/ViewSession.js";
import { protectCounterRateLimit } from "../utils/Arcjet.js";

const WEBSITE_VIEWS_KEY = "websiteViews";
const VIEW_SESSION_HEADER = "x-view-session";
const VIEW_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

export const DEMO_THREAD_IDS = new Set([
  "demo-1",
  "demo-quick-sort",
  "demo-attachment-overthinking",
  "demo-11",
  "demo-limerence",
  "demo-moving-on-breakup",
  "demo-3",
  "demo-4",
  "demo-6",
  "demo-7",
  "demo-8",
  "demo-9",
  "demo-10",
]);

const getDemoStatKey = (threadId) => `demoViews:${threadId}`;
const hashSessionId = (sessionId) => createHash("sha256").update(sessionId).digest("hex");

export const createViewsRouter = ({
  SiteStatModel = SiteStat,
  ViewSessionModel = ViewSession,
  counterRateLimit = protectCounterRateLimit,
} = {}) => {
  const router = Router();

  const getCounterValue = async (counterKey) => {
    const stat = await SiteStatModel.findOne({ key: counterKey });
    return stat?.value || 0;
  };

  const recordView = async (counterKey, sessionId) => {
    const sessionHash = hashSessionId(sessionId);

    try {
      await ViewSessionModel.create({
        counterKey,
        sessionHash,
        expiresAt: new Date(Date.now() + VIEW_SESSION_TTL_MS),
      });
    } catch (error) {
      if (error?.code === 11000) {
        return getCounterValue(counterKey);
      }

      throw error;
    }

    try {
      const stat = await SiteStatModel.findOneAndUpdate(
        { key: counterKey },
        { $inc: { value: 1 } },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      );
      return stat.value;
    } catch (error) {
      await ViewSessionModel.deleteOne({ counterKey, sessionHash }).catch(() => {});
      throw error;
    }
  };

  const requireViewSession = (req, res, next) => {
    const sessionId = req.get(VIEW_SESSION_HEADER);

    if (!sessionId || !SESSION_ID_PATTERN.test(sessionId)) {
      return res.status(400).json({ error: "A valid view session is required" });
    }

    req.viewSessionId = sessionId;
    return next();
  };

  router.get("/views", async (req, res) => {
    try {
      return res.status(200).json({ views: await getCounterValue(WEBSITE_VIEWS_KEY) });
    } catch (error) {
      console.error("Get website views error:", error.message);
      return res.status(500).json({ error: "Failed to fetch website views" });
    }
  });

  router.post("/views", counterRateLimit, requireViewSession, async (req, res) => {
    try {
      const views = await recordView(WEBSITE_VIEWS_KEY, req.viewSessionId);
      return res.status(200).json({ views });
    } catch (error) {
      console.error("Increment website views error:", error.message);
      return res.status(500).json({ error: "Failed to update website views" });
    }
  });

  router.get("/views/demo", async (req, res) => {
    try {
      const stats = await SiteStatModel.find({
        key: { $in: [...DEMO_THREAD_IDS].map(getDemoStatKey) },
      });
      const views = Object.fromEntries([...DEMO_THREAD_IDS].map((threadId) => [threadId, 0]));

      for (const stat of stats) {
        const threadId = stat.key.slice("demoViews:".length);
        views[threadId] = stat.value;
      }

      return res.status(200).json({ views });
    } catch (error) {
      console.error("Get demo views error:", error.message);
      return res.status(500).json({ error: "Failed to fetch demo views" });
    }
  });

  router.post(
    "/views/demo/:threadId",
    counterRateLimit,
    requireViewSession,
    async (req, res) => {
      const { threadId } = req.params;

      if (!DEMO_THREAD_IDS.has(threadId)) {
        return res.status(404).json({ error: "Demo thread not found" });
      }

      try {
        const views = await recordView(getDemoStatKey(threadId), req.viewSessionId);
        return res.status(200).json({ threadId, views });
      } catch (error) {
        console.error("Increment demo views error:", error.message);
        return res.status(500).json({ error: "Failed to update demo views" });
      }
    },
  );

  return router;
};

export default createViewsRouter();

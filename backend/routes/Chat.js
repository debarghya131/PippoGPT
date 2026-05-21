import { Router } from "express";
import { randomUUID } from "crypto";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/Openai.js";
import { requireAuth } from "../utils/Auth.js";
import { protectChatRateLimit } from "../utils/Arcjet.js";

const router = Router();

router.use(requireAuth);

const buildThreadTitle = (title, message) => {
  if (title && typeof title === "string" && title.trim()) {
    return title.trim();
  }

  return message.trim().slice(0, 40);
};

const sanitizeThreadTitle = (title, messages = []) => {
  const normalizedTitle = typeof title === "string" ? title.replace(/\s+/g, " ").trim() : "";
  const firstUserMessage = messages.find((message) => message.role === "user")?.content?.trim() || "";
  const fallbackTitle = firstUserMessage.slice(0, 40) || "New Thread";

  if (!normalizedTitle) {
    return fallbackTitle;
  }

  const looksCorrupted =
    normalizedTitle.includes("PippoGPT") ||
    normalizedTitle.includes("You ") ||
    normalizedTitle.length > 60;

  return looksCorrupted ? fallbackTitle : normalizedTitle;
};

router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select("threadId title messages createdAt updatedAt");

    const normalizedThreads = threads.map((thread) => ({
      threadId: thread.threadId,
      title: sanitizeThreadTitle(thread.title, thread.messages),
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }));

    return res.status(200).json({ threads: normalizedThreads });
  } catch (error) {
    console.error("Get threads error:", error.message);
    return res.status(500).json({ error: "Failed to fetch threads" });
  }
});

router.get("/thread/:threadId", async (req, res) => {
  try {
    const thread = await Thread.findOne({
      threadId: req.params.threadId,
      userId: req.user._id,
    });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    thread.title = sanitizeThreadTitle(thread.title, thread.messages);

    return res.status(200).json({ thread });
  } catch (error) {
    console.error("Get thread error:", error.message);
    return res.status(500).json({ error: "Failed to fetch thread" });
  }
});

router.delete("/thread/:threadId", async (req, res) => {
  try {
    const deletedThread = await Thread.findOneAndDelete({
      threadId: req.params.threadId,
      userId: req.user._id,
    });

    if (!deletedThread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    return res.status(200).json({ message: "Thread deleted successfully" });
  } catch (error) {
    console.error("Delete thread error:", error.message);
    return res.status(500).json({ error: "Failed to delete thread" });
  }
});

router.post("/chat", protectChatRateLimit, async (req, res) => {
  const { message, threadId, title } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const currentThreadId = threadId || randomUUID();

  try {
    let thread = await Thread.findOne({
      threadId: currentThreadId,
      userId: req.user._id,
    });

    if (!thread) {
      thread = new Thread({
        threadId: currentThreadId,
        userId: req.user._id,
        title: buildThreadTitle(title, message),
        messages: [],
      });
    }

    const userMessage = {
      role: "user",
      content: message.trim(),
    };

    thread.messages.push(userMessage);

    const reply = await getOpenAIAPIResponse(thread.messages);

    thread.messages.push({
      role: "assistant",
      content: reply,
    });

    thread.updatedAt = new Date();
    await thread.save();

    return res.status(200).json({
      threadId: currentThreadId,
      title: thread.title,
      reply,
      messages: thread.messages,
    });
  } catch (error) {
    console.error("Chat route error:", error.message);
    return res.status(500).json({ error: "Failed to process chat request" });
  }
});

router.get("/chat", (req, res) => {
  return res.status(200).json({ message: "Chat route is working" });
});

export default router;

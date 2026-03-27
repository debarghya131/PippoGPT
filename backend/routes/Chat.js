import { Router } from "express";
import { randomUUID } from "crypto";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/Openai.js";

const router = Router();

const buildThreadTitle = (title, message) => {
  if (title && typeof title === "string" && title.trim()) {
    return title.trim();
  }

  return message.trim().slice(0, 40);
};

router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find()
      .sort({ updatedAt: -1 })
      .select("threadId title createdAt updatedAt");

    return res.status(200).json({ threads });
  } catch (error) {
    console.error("Get threads error:", error.message);
    return res.status(500).json({ error: "Failed to fetch threads" });
  }
});

router.get("/thread/:threadId", async (req, res) => {
  try {
    const thread = await Thread.findOne({ threadId: req.params.threadId });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

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

router.post("/chat", async (req, res) => {
  const { message, threadId, title } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const currentThreadId = threadId || randomUUID();

  try {
    let thread = await Thread.findOne({ threadId: currentThreadId });

    if (!thread) {
      thread = new Thread({
        threadId: currentThreadId,
        title: buildThreadTitle(title, message),
        messages: [],
      });
    }

    const userMessage = {
      role: "user",
      content: message.trim(),
    };

    thread.messages.push(userMessage);

    const reply = await getOpenAIAPIResponse(userMessage.content);

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

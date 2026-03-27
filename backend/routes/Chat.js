import { Router } from "express";
import { randomUUID } from "crypto";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/Openai.js";

const router = Router();

router.get("/", (req, res) => {
  return res.status(200).json({ message: "Chat route is working" });
});

router.post("/", async (req, res) => {
  const { message, threadId } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const currentThreadId = threadId || randomUUID();

  try {
    let thread = await Thread.findOne({ threadId: currentThreadId });

    if (!thread) {
      thread = new Thread({
        threadId: currentThreadId,
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
      reply,
      messages: thread.messages,
    });
  } catch (error) {
    console.error("Chat route error:", error.message);
    return res.status(500).json({ error: "Failed to process chat request" });
  }
});

export default router;

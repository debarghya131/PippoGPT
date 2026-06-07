import { randomUUID } from "crypto";
import { Router } from "express";
import Thread from "../models/Thread.js";
import { protectChatRateLimit } from "../utils/Arcjet.js";
import { requireAuth } from "../utils/Auth.js";
import getOpenAIAPIResponse from "../utils/Openai.js";

const MAX_MESSAGE_LENGTH = 10000;
const MAX_THREAD_ID_LENGTH = 128;
const MAX_TITLE_LENGTH = 60;
const MAX_STORED_MESSAGES = 100;

const buildThreadTitle = (title, message) => {
  if (title && typeof title === "string" && title.trim()) {
    return title.replace(/\s+/g, " ").trim().slice(0, MAX_TITLE_LENGTH);
  }

  return message.trim().slice(0, 40);
};

export const sanitizeThreadTitle = (title, messages = []) => {
  const normalizedTitle = typeof title === "string" ? title.replace(/\s+/g, " ").trim() : "";
  const firstUserMessage = messages.find((message) => message.role === "user")?.content?.trim() || "";
  const fallbackTitle = firstUserMessage.slice(0, 40) || "New Thread";

  if (!normalizedTitle) {
    return fallbackTitle;
  }

  const looksCorrupted =
    normalizedTitle.includes("PippoGPT") ||
    normalizedTitle.includes("You ") ||
    normalizedTitle.length > MAX_TITLE_LENGTH;

  return looksCorrupted ? fallbackTitle : normalizedTitle;
};

const validateChatInput = ({ message, threadId, title }) => {
  if (!message || typeof message !== "string" || !message.trim()) {
    return "Message is required";
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`;
  }

  if (threadId !== undefined && typeof threadId !== "string") {
    return "Thread ID must be a string";
  }

  if (typeof threadId === "string" && threadId.trim().length > MAX_THREAD_ID_LENGTH) {
    return "Thread ID is too long";
  }

  if (title !== undefined && typeof title !== "string") {
    return "Title must be a string";
  }

  return null;
};

export const createChatRouter = ({
  ThreadModel = Thread,
  authMiddleware = requireAuth,
  rateLimitMiddleware = protectChatRateLimit,
  getAIResponse = getOpenAIAPIResponse,
} = {}) => {
  const router = Router();

  router.use(authMiddleware);

  router.get("/thread", async (req, res) => {
    try {
      const threads = await ThreadModel.find({ userId: req.user._id })
        .sort({ updatedAt: -1 })
        .select({
          threadId: 1,
          title: 1,
          messages: { $slice: 1 },
          createdAt: 1,
          updatedAt: 1,
        })
        .lean();

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
      const thread = await ThreadModel.findOne({
        threadId: req.params.threadId,
        userId: req.user._id,
      });

      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      const threadResponse = thread.toObject ? thread.toObject() : { ...thread };
      threadResponse.title = sanitizeThreadTitle(thread.title, thread.messages);

      return res.status(200).json({ thread: threadResponse });
    } catch (error) {
      console.error("Get thread error:", error.message);
      return res.status(500).json({ error: "Failed to fetch thread" });
    }
  });

  router.delete("/thread/:threadId", async (req, res) => {
    try {
      const deletedThread = await ThreadModel.findOneAndDelete({
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

  router.post("/chat", rateLimitMiddleware, async (req, res) => {
    const { message, threadId, title } = req.body;
    const validationError = validateChatInput({ message, threadId, title });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const trimmedMessage = message.trim();
    const requestedThreadId = typeof threadId === "string" ? threadId.trim() : "";
    const currentThreadId = requestedThreadId || randomUUID();

    try {
      const existingThread = await ThreadModel.findOne({
        threadId: currentThreadId,
        userId: req.user._id,
      });
      const userMessage = { role: "user", content: trimmedMessage };
      const contextMessages = [...(existingThread?.messages || []), userMessage];
      const reply = await getAIResponse(contextMessages);
      const assistantMessage = { role: "assistant", content: reply };
      const now = new Date();
      let updatedThread;

      if (existingThread) {
        updatedThread = await ThreadModel.findOneAndUpdate(
          { threadId: currentThreadId, userId: req.user._id },
          {
            $push: {
              messages: {
                $each: [userMessage, assistantMessage],
                $slice: -MAX_STORED_MESSAGES,
              },
            },
            $set: { updatedAt: now },
          },
          { returnDocument: "after", runValidators: true },
        );
      } else {
        try {
          updatedThread = await ThreadModel.create({
            threadId: currentThreadId,
            userId: req.user._id,
            title: buildThreadTitle(title, trimmedMessage),
            messages: [userMessage, assistantMessage],
            updatedAt: now,
          });
        } catch (error) {
          if (error?.code !== 11000) {
            throw error;
          }

          updatedThread = await ThreadModel.findOneAndUpdate(
            { threadId: currentThreadId, userId: req.user._id },
            {
              $push: {
                messages: {
                  $each: [userMessage, assistantMessage],
                  $slice: -MAX_STORED_MESSAGES,
                },
              },
              $set: { updatedAt: now },
            },
            { returnDocument: "after", runValidators: true },
          );
        }
      }

      if (!updatedThread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      return res.status(200).json({
        threadId: currentThreadId,
        title: updatedThread.title,
        reply,
        messages: updatedThread.messages,
      });
    } catch (error) {
      console.error("Chat route error:", error.message);
      return res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  router.get("/chat", (req, res) => {
    return res.status(200).json({ message: "Chat route is working" });
  });

  return router;
};

export default createChatRouter();

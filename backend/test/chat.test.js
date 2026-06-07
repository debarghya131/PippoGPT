import assert from "node:assert/strict";
import test from "node:test";
import { createChatRouter } from "../routes/Chat.js";
import { jsonRequest, requestRouter } from "../support/httpTestUtils.js";

const authenticated = (req, res, next) => {
  req.user = { _id: "user-a" };
  next();
};

const allowRequest = (req, res, next) => next();

test("protected chat routes reject unauthenticated requests", async () => {
  const router = createChatRouter({
    ThreadModel: {},
    authMiddleware: (req, res) => res.status(401).json({ error: "Please login first" }),
    rateLimitMiddleware: allowRequest,
    getAIResponse: async () => "unused",
  });

  const { response } = await requestRouter(router, "/thread");
  assert.equal(response.status, 401);
});

test("thread lookup is scoped to the authenticated user", async () => {
  let capturedFilter;
  const ThreadModel = {
    findOne: async (filter) => {
      capturedFilter = filter;
      return null;
    },
  };
  const router = createChatRouter({
    ThreadModel,
    authMiddleware: authenticated,
    rateLimitMiddleware: allowRequest,
    getAIResponse: async () => "unused",
  });

  const { response } = await requestRouter(router, "/thread/thread-b");

  assert.equal(response.status, 404);
  assert.deepEqual(capturedFilter, { threadId: "thread-b", userId: "user-a" });
});

test("rate limiting stops chat work before database and AI calls", async () => {
  let databaseCalled = false;
  let aiCalled = false;
  const router = createChatRouter({
    ThreadModel: {
      findOne: async () => {
        databaseCalled = true;
      },
    },
    authMiddleware: authenticated,
    rateLimitMiddleware: (req, res) => res.status(429).json({ error: "limited" }),
    getAIResponse: async () => {
      aiCalled = true;
      return "unused";
    },
  });

  const { response } = await requestRouter(
    router,
    "/chat",
    jsonRequest("POST", { message: "hello" }),
  );

  assert.equal(response.status, 429);
  assert.equal(databaseCalled, false);
  assert.equal(aiCalled, false);
});

test("existing chats append an atomic user and assistant pair", async () => {
  const existingMessages = [{ role: "user", content: "Earlier question" }];
  let updateFilter;
  let updateDocument;
  let receivedContext;
  const ThreadModel = {
    findOne: async () => ({
      title: "Existing chat",
      messages: existingMessages,
    }),
    findOneAndUpdate: async (filter, update) => {
      updateFilter = filter;
      updateDocument = update;
      return {
        title: "Existing chat",
        messages: [...existingMessages, ...update.$push.messages.$each],
      };
    },
  };
  const router = createChatRouter({
    ThreadModel,
    authMiddleware: authenticated,
    rateLimitMiddleware: allowRequest,
    getAIResponse: async (messages) => {
      receivedContext = messages;
      return "New answer";
    },
  });

  const { response, body } = await requestRouter(
    router,
    "/chat",
    jsonRequest("POST", { message: "New question", threadId: "thread-a" }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(updateFilter, { threadId: "thread-a", userId: "user-a" });
  assert.deepEqual(updateDocument.$push.messages.$each, [
    { role: "user", content: "New question" },
    { role: "assistant", content: "New answer" },
  ]);
  assert.equal(updateDocument.$push.messages.$slice, -100);
  assert.deepEqual(receivedContext.at(-1), { role: "user", content: "New question" });
  assert.equal(body.messages.at(-1).content, "New answer");
});

test("oversized chat messages are rejected", async () => {
  const router = createChatRouter({
    ThreadModel: {},
    authMiddleware: authenticated,
    rateLimitMiddleware: allowRequest,
    getAIResponse: async () => "unused",
  });

  const { response } = await requestRouter(
    router,
    "/chat",
    jsonRequest("POST", { message: "x".repeat(10001) }),
  );

  assert.equal(response.status, 400);
});

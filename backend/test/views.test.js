import assert from "node:assert/strict";
import test from "node:test";
import { createViewsRouter } from "../routes/Views.js";
import { requestRouter } from "../support/httpTestUtils.js";

const allowRequest = (req, res, next) => next();

const createModels = () => {
  const counters = new Map();
  const sessions = new Set();

  return {
    counters,
    SiteStatModel: {
      findOne: async ({ key }) => {
        const value = counters.get(key);
        return value === undefined ? null : { key, value };
      },
      findOneAndUpdate: async ({ key }) => {
        const value = (counters.get(key) || 0) + 1;
        counters.set(key, value);
        return { key, value };
      },
      find: async () =>
        [...counters].map(([key, value]) => ({
          key,
          value,
        })),
    },
    ViewSessionModel: {
      create: async ({ counterKey, sessionHash }) => {
        const key = `${counterKey}:${sessionHash}`;

        if (sessions.has(key)) {
          const error = new Error("duplicate");
          error.code = 11000;
          throw error;
        }

        sessions.add(key);
      },
      deleteOne: async ({ counterKey, sessionHash }) => {
        sessions.delete(`${counterKey}:${sessionHash}`);
      },
    },
  };
};

test("website views are idempotent for the same server-side session", async () => {
  const models = createModels();
  const router = createViewsRouter({
    ...models,
    counterRateLimit: allowRequest,
  });
  const options = {
    method: "POST",
    headers: { "X-View-Session": "session_identifier_12345" },
  };

  const first = await requestRouter(router, "/views", options);
  const second = await requestRouter(router, "/views", options);

  assert.equal(first.response.status, 200);
  assert.equal(second.response.status, 200);
  assert.equal(first.body.views, 1);
  assert.equal(second.body.views, 1);
  assert.equal(models.counters.get("websiteViews"), 1);
});

test("different demo counters increment independently", async () => {
  const models = createModels();
  const router = createViewsRouter({
    ...models,
    counterRateLimit: allowRequest,
  });
  const options = {
    method: "POST",
    headers: { "X-View-Session": "session_identifier_12345" },
  };

  const coding = await requestRouter(router, "/views/demo/demo-1", options);
  const sorting = await requestRouter(router, "/views/demo/demo-quick-sort", options);

  assert.equal(coding.body.views, 1);
  assert.equal(sorting.body.views, 1);
  assert.equal(models.counters.get("demoViews:demo-1"), 1);
  assert.equal(models.counters.get("demoViews:demo-quick-sort"), 1);
});

test("counter updates require a valid session identifier", async () => {
  const models = createModels();
  const router = createViewsRouter({
    ...models,
    counterRateLimit: allowRequest,
  });

  const { response } = await requestRouter(router, "/views", { method: "POST" });
  assert.equal(response.status, 400);
});

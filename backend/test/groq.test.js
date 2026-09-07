import assert from "node:assert/strict";
import test from "node:test";
import Groq from "groq-sdk";
import { AIServiceError, createGroqResponder } from "../utils/Groq.js";

const messages = [{ role: "user", content: "Hello" }];
const responder = (create, model = "test-model") => createGroqResponder({
  client: { chat: { completions: { create } } },
  model,
});

test("Groq responses use the configured model and conversation", async () => {
  let request;
  const reply = await responder(async (body) => {
    request = body;
    return { choices: [{ message: { content: "Hello back" } }] };
  })(messages);
  assert.equal(reply, "Hello back");
  assert.equal(request.model, "test-model");
  assert.deepEqual(request.messages.at(-1), messages[0]);
});

for (const [error, status, code] of [
  [new Groq.RateLimitError(429, {}, "private upstream detail", new Headers()), 503, "AI_RATE_LIMITED"],
  [new Groq.AuthenticationError(401, {}, "private upstream detail", new Headers()), 503, "AI_CONFIGURATION_ERROR"],
  [new Groq.PermissionDeniedError(403, {}, "private upstream detail", new Headers()), 503, "AI_CONFIGURATION_ERROR"],
  [new Groq.NotFoundError(404, {}, "private upstream detail", new Headers()), 502, "AI_REQUEST_FAILED"],
  [new Groq.APIConnectionTimeoutError({}), 504, "AI_TIMEOUT"],
  [new Groq.APIConnectionError({ message: "private upstream detail" }), 502, "AI_REQUEST_FAILED"],
]) {
  test(`Groq ${error.constructor.name} preserves its cause with a safe public error`, async () => {
    await assert.rejects(responder(async () => { throw error; })(messages), (failure) => {
      assert.ok(failure instanceof AIServiceError);
      assert.equal(failure.status, status);
      assert.equal(failure.code, code);
      assert.equal(failure.cause, error);
      assert.ok(!failure.message.includes("private upstream detail"));
      return true;
    });
  });
}

test("missing model configuration fails before calling Groq", async () => {
  await assert.rejects(responder(async () => {
    assert.fail("Groq should not be called");
  }, "")(messages), { code: "AI_CONFIGURATION_ERROR" });
});

test("empty, malformed, and oversized replies are rejected before persistence", async () => {
  for (const content of [undefined, "", "   ", 123, "x".repeat(10001)]) {
    await assert.rejects(responder(async () => ({
      choices: [{ message: { content } }],
    }))(messages), { status: 502, code: "AI_INVALID_RESPONSE" });
  }
});

import assert from "node:assert/strict";
import test from "node:test";
import User from "../models/User.js";
import { buildConversationContext } from "../utils/Openai.js";

test("phone-only Clerk users satisfy local user validation", async () => {
  const user = new User({
    clerkId: "clerk-phone-user",
    name: "+15555550123",
  });

  await assert.doesNotReject(user.validate());
});

test("AI context keeps only recent messages within configured limits", () => {
  const messages = Array.from({ length: 40 }, (_, index) => ({
    role: index % 2 === 0 ? "user" : "assistant",
    content: `message-${index}`,
  }));

  const context = buildConversationContext(messages);

  assert.equal(context.length, 30);
  assert.equal(context[0].content, "message-10");
  assert.equal(context.at(-1).content, "message-39");
});

import assert from "node:assert/strict";
import test from "node:test";
import User from "../models/User.js";
import { hasVerifiedPrimaryEmail } from "../utils/Auth.js";
import { buildConversationContext } from "../utils/Groq.js";

test("phone-only Clerk users satisfy local user validation", async () => {
  const user = new User({
    clerkId: "clerk-phone-user",
    name: "+15555550123",
  });

  await assert.doesNotReject(user.validate());
});

test("only verified Clerk primary emails can relink an existing local user", () => {
  const clerkUser = {
    primaryEmailAddressId: "email_primary",
    emailAddresses: [
      {
        id: "email_primary",
        emailAddress: "person@example.com",
        verification: { status: "verified" },
      },
    ],
  };

  assert.equal(hasVerifiedPrimaryEmail(clerkUser), true);

  clerkUser.emailAddresses[0].verification.status = "unverified";
  assert.equal(hasVerifiedPrimaryEmail(clerkUser), false);
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

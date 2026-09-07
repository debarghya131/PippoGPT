import "dotenv/config";
import Groq from "groq-sdk";

let groq;

export class AIServiceError extends Error {
  constructor(message, status, code, cause) {
    super(message, { cause });
    this.name = "AIServiceError";
    this.status = status;
    this.code = code;
  }
}

const classifyAIError = (error) => {
  if (error instanceof AIServiceError) return error;
  if (error?.status === 429) {
    return new AIServiceError("The AI service is busy. Please try again later.", 503, "AI_RATE_LIMITED", error);
  }
  if (error?.status === 401 || error?.status === 403) {
    return new AIServiceError("The AI service is unavailable. Please contact the site owner.", 503, "AI_CONFIGURATION_ERROR", error);
  }
  if (error instanceof Groq.APIConnectionTimeoutError) {
    return new AIServiceError("The AI service took too long to respond. Please try again.", 504, "AI_TIMEOUT", error);
  }
  return new AIServiceError("The AI service could not answer this request. Please try again later.", 502, "AI_REQUEST_FAILED", error);
};

const SYSTEM_PROMPT = `
You are PippoGPT, a helpful AI assistant.

Rules:
- Use the full conversation context to answer follow-up questions.
- Be concise by default unless the user asks for detail.
- For coding questions, prefer direct working code over long theory.
- If the user asks for "short" code, give a short solution with minimal explanation.
- Correct obvious typos naturally when answering.
- If the user asks an ambiguous coding question, make the most reasonable assumption and say it briefly.
- Keep formatting clean and easy to read.
`.trim();
const MAX_CONTEXT_MESSAGES = 30;
const MAX_CONTEXT_CHARACTERS = 24000;

const getLastUserMessage = (messages) =>
  [...messages].reverse().find((message) => message.role === "user")?.content?.trim() || "";

const buildRequestInstruction = (messages) => {
  const lastUserMessage = getLastUserMessage(messages).toLowerCase();

  const wantsShort =
    lastUserMessage.includes("short") ||
    lastUserMessage.includes("brief") ||
    lastUserMessage.includes("small");

  const wantsCode =
    lastUserMessage.includes("code") ||
    lastUserMessage.includes("program") ||
    lastUserMessage.includes("c code") ||
    lastUserMessage.includes("python") ||
    lastUserMessage.includes("java") ||
    lastUserMessage.includes("javascript");

  if (wantsShort && wantsCode) {
    return "The user wants very short code. Return only the code, no heading, no bullets, no markdown bold, and no explanation unless absolutely necessary.";
  }

  if (wantsCode) {
    return "For this coding request, prefer a direct solution. Keep explanation minimal and avoid decorative markdown.";
  }

  return "Answer normally, but keep the response concise and clear.";
};

export const buildConversationContext = (messages) => {
  const selectedMessages = [];
  let characterCount = 0;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    const content = typeof message.content === "string" ? message.content : "";

    if (
      selectedMessages.length >= MAX_CONTEXT_MESSAGES ||
      characterCount + content.length > MAX_CONTEXT_CHARACTERS
    ) {
      break;
    }

    selectedMessages.push({
      role: message.role,
      content,
    });
    characterCount += content.length;
  }

  return selectedMessages.reverse();
};

export const createGroqResponder = ({ client, model = process.env.GROQ_MODEL?.trim() } = {}) => async (messages) => {
  try {
    if (!model || (!client && !process.env.GROQ_API_KEY?.trim())) {
      throw new AIServiceError("The AI service is unavailable. Please contact the site owner.", 503, "AI_CONFIGURATION_ERROR");
    }
    const activeClient = client || (groq ??= new Groq({
      apiKey: process.env.GROQ_API_KEY.trim(),
      timeout: 30000,
      maxRetries: 1,
    }));
    const requestInstruction = buildRequestInstruction(messages);

    const chatCompletion = await activeClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "system",
          content: requestInstruction,
        },
        ...buildConversationContext(messages),
      ],
      model,
      temperature: 0.4,
      max_completion_tokens: requestInstruction.includes("very short code") ? 220 : 1024,
      top_p: 1,
      stream: false,
      stop: null,
    });

    const reply = chatCompletion?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim() || reply.length > 10000) {
      throw new AIServiceError("The AI service returned an unusable reply. Please try again.", 502, "AI_INVALID_RESPONSE");
    }
    return reply;
  } catch (error) {
    throw classifyAIError(error);
  }
};

export default createGroqResponder();

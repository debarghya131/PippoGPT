import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

const getOpenAIAPIResponse = async (messages) => {
  try {
    const requestInstruction = buildRequestInstruction(messages);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "system",
          content: requestInstruction,
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      model: process.env.GROQ_MODEL,
      temperature: 0.4,
      max_completion_tokens: requestInstruction.includes("very short code") ? 220 : 1024,
      top_p: 1,
      stream: false,
      stop: null,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "";
    return reply;
  } catch (error) {
    console.error("Error in getOpenAIAPIResponse:", error);
    throw new Error("Failed to get response from Groq API");
  }
};

export default getOpenAIAPIResponse;

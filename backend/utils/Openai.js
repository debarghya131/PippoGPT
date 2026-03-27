import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getOpenAIAPIResponse = async (message) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      model: process.env.GROQ_MODEL,
      temperature: 1,
      max_completion_tokens: 1024,
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
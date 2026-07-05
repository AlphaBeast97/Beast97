import OpenAI from "openai";
import { JUGARI_MODEL, PROVIDER_API_KEY, PROVIDER_BASE_URL } from "./config.js";
import { history } from "./history.js";

export const llm = async (payload) => {
  const { input: userInput, history: his } = payload;

  const openai = new OpenAI({
    baseURL: PROVIDER_BASE_URL,
    apiKey: PROVIDER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": "https://github.com/AlphaBeast97/Jugari",
      "X-Title": "Jugari",
    },
  });

  const priorTurns = his.flatMap((turn) => {
    if (!turn || typeof turn !== "object") return [];

    const msgs = [];
    if (turn.userMsg) msgs.push({ role: "user", content: turn.userMsg });
    if (turn.aiResponse)
      msgs.push({ role: "assistant", content: turn.aiResponse });

    return msgs;
  });

  // Create a streaming chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    model: JUGARI_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Give one line answer to the user input. Do not give any explanation.",
      },
      ...priorTurns,
      {
        role: "user",
        content: userInput,
      },
    ],
    stream: true,
    max_tokens: 4096,
  });

  const aiResponse = [];

  for await (const chunk of completion) {
    const content = chunk.choices[0].delta?.content || "";
    aiResponse.push(content);
    process.stdout.write(content);
  }
  process.stdout.write("\n");

  history(userInput, aiResponse.join(""), payload.history);
};

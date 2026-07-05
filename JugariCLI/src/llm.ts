import OpenAI from "openai";
import { JUGARI_MODEL, PROVIDER_API_KEY, PROVIDER_BASE_URL } from "./config.js";
import { history, type HistoryEntry } from "./history.js";

const openai = new OpenAI({
  baseURL: PROVIDER_BASE_URL,
  apiKey: PROVIDER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/AlphaBeast97/Jugari",
    "X-Title": "Jugari",
  },
});

interface LlmPayload {
  input: string;
  history: HistoryEntry[];
}

export const llm = async (payload: LlmPayload): Promise<void> => {
  const { input: userInput, history: his } = payload;

  const priorTurns = his.flatMap((turn) => {
    if (!turn || typeof turn !== "object") return [];

    const msgs: { role: "user" | "assistant"; content: string }[] = [];
    if (turn.userMsg) msgs.push({ role: "user", content: turn.userMsg });
    if (turn.aiResponse)
      msgs.push({ role: "assistant", content: turn.aiResponse });

    return msgs;
  });

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

  const aiResponse: string[] = [];

  for await (const chunk of completion) {
    const content = chunk.choices[0]?.delta?.content || "";
    aiResponse.push(content);
    process.stdout.write(content);
  }
  process.stdout.write("\n");

  history(userInput, aiResponse.join(""), payload.history);
};

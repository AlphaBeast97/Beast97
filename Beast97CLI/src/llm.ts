import { OpenAIProvider } from "./provider/index.js";
import { config } from "./config/index.js";
import { history, type HistoryEntry } from "./history.js";

const provider = new OpenAIProvider({
  apiKey: config.PROVIDER_API_KEY,
  model: config.MODEL,
  baseUrl: config.PROVIDER_BASE_URL,
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

  try {
    const stream = provider.chat([
      { role: "system", content: "You are a helpful assistant." },
      ...priorTurns,
      { role: "user", content: userInput },
    ]);
    const aiResponse: string[] = [];

    for await (const chunk of stream) {
      aiResponse.push(chunk);
      process.stdout.write(chunk);
    }
    process.stdout.write("\n");

    const responseText = aiResponse.join("");
    if (!responseText.trim()) {
      throw new Error("Received empty response from the provider.");
    }

    history(userInput, responseText, payload.history);
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Error: ${e.message}`);
    } else {
      throw new Error(`Error: ${String(e)}`);
    }
  }
};

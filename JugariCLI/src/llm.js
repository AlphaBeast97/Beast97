import OpenAI from "openai";
import { PROVIDER_API_KEY, PROVIDER_BASE_URL } from "./config.js";

export const openai = new OpenAI({
  baseURL: PROVIDER_BASE_URL,
  apiKey: PROVIDER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/AlphaBeast97/Jugari", // Optional. Site URL for rankings on openrouter.ai.
    "X-OpenRouter-Title": "Jugari", // Optional. Site title for rankings on openrouter.ai.
  },
});

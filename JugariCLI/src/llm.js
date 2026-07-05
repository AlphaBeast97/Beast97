import OpenAI from "openai";
import { OPENROUTER_API_KEY, OPENROUTER_BASE_URL } from "./config.js";

export const openai = new OpenAI({
  baseURL: BASEURL,
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/AlphaBeast97/Jugari", // Optional. Site URL for rankings on openrouter.ai.
    "X-OpenRouter-Title": "Jugari", // Optional. Site title for rankings on openrouter.ai.
  },
});

// this file exist so the OpenAIProvider class can be imported without importing the entire openai package, which is a large dependency and can cause issues with bundlers like esbuild.
import OpenAI, { APIConnectionError, APIError, RateLimitError } from "openai";
import type { Message, Provider } from "../types.js";

// OpenAIProvider implements the Provider interface for interacting with the OpenAI API.
export class OpenAIProvider implements Provider {
  // The model to use for chat completions.
  readonly model: string;
  private client: OpenAI;

  // The constructor initializes the OpenAIProvider with the provided configuration.
  constructor(config: { apiKey: string; model: string; baseUrl: string }) {
    this.model = config.model;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/AlphaBeast97/Beast97",
        "X-Title": "Beast97",
      },
    });
  }

  // The chat method sends a series of messages to the OpenAI API and returns an asynchronous iterable of strings representing the streamed responses.
  async *chat(messages: Message[]): AsyncIterable<string> {
    let stream;
    try {
      stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        stream: true,
      });
    } catch (error) {
      if (error instanceof APIConnectionError) {
        throw new Error("connection-error: Could not connect to the provider.");
      }
      if (error instanceof RateLimitError) {
        throw new Error("rate-limit: Rate limit exceeded.");
      }
      if (error instanceof APIError) {
        throw new Error(
          `api-error: API returned status ${error.status}: ${error.message}`,
        );
      }
      throw error;
    }

    // Yield each chunk of the streamed response, handling any connection errors that may occur during streaming.
    try {
      for await (const chunk of stream) {
        yield chunk.choices[0]?.delta?.content || "";
      }
    } catch (error) {
      if (error instanceof APIConnectionError) {
        throw new Error("connection-error: Connection lost during streaming.");
      }
      throw error;
    }
  }
}

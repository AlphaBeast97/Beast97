import z from "zod";

// Type definitions for the provider interface
export interface Provider {
  readonly model: string;
  chat(messages: Message[]): AsyncIterable<string>;
}

// Type definitions for the result of a tool execution
export interface ToolCall {
  id: string;
  name: string;
  args: unknown;
}

// Type definitions for the result of a tool execution
export interface ToolResult {
  output: string;
  isError?: boolean;
}

//   Type definitions for the result of a tool execution
export interface Tool {
  name: string;
  description: string;
  parameters: z.ZodSchema; // zod schema → convert to JSON schema for the API
  requiresApproval: boolean; // shell exec, file writes = true; file reads = maybe false
  execute: (args: unknown) => Promise<ToolResult>;
}

// Type definitions for messages exchanged with the LLM
export type Message =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; toolCalls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string; isError?: boolean };

// Type definitions for the configuration of the application
export interface Config {
  PROVIDER_API_KEY: string;
  PROVIDER_BASE_URL: string;
  MODEL: string;
}

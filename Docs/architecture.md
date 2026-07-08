# Beast97 — Architecture

## Status Legend
- ✅ Built (may be refined later)
- 🚧 Not yet built (planned)
- 🔄 In progress

---

## Agent Loop 🚧

```
loop:
  1. send messages[] + tool definitions to the model
  2. model responds with either:
       a) plain text → show it, wait for next user input, done
       b) one or more tool_calls → go to step 3
  3. for each tool_call:
       - validate args against the tool's schema (zod)
       - check permissions (does this tool/path/command need user approval?)
       - execute it
       - capture result (stdout, file contents, error, whatever)
  4. append the tool results as a new message with role "tool"
  5. go back to step 1
```

**Current reality:** The app uses a simple chat loop (`llm.ts` + `index.ts`) with no tool-calling. This loop will be replaced by a proper `Agent` class in `src/agent/`.

---

## Provider Interface ✅

```ts
interface Provider {
  readonly model: string;
  chat(messages: Message[]): AsyncIterable<string>;      // streaming text (simple chat)
  complete(messages: Message[], tools?: Tool[]): Promise<Message>;  // structured response with toolCalls 🚧
}
```

- `chat()` — for simple streaming conversations, no tool calls. ✅ built.
- `complete()` — returns full `Message` including `toolCalls`. Used by the agent loop. 🚧

**Implementation:** `OpenAIProvider` in `src/provider/openai.ts`. Only one provider exists today; the interface is designed for more.

---

## Provider Factory 🚧

A single entry point for creating providers, eliminating manual instantiation and enabling multi-provider support via config changes instead of code changes.

```ts
// src/provider/factory.ts
function createProvider(config: Config): Provider
```

**Dispatch logic (planned):**
- `PROVIDER_TYPE` env var → explicit selection (e.g. `"openai"`, `"anthropic"`)
- Env var scanning → `ANTHROPIC_API_KEY` detected → AnthropicProvider, etc.
- `PROVIDER_BASE_URL` pattern matching → Groq, OpenRouter, local endpoint → all reuse OpenAIProvider with custom base URL
- Fallback priority chain when multiple credentials are present

**Current use:** `llm.ts` calls `createProvider(config)` instead of manually importing `OpenAIProvider` and calling `new OpenAIProvider({...})`.

**Future:** Any OpenAI-compatible service (Groq, OpenRouter, local, xAI) reuses `OpenAIProvider` with a different `baseURL`. Native providers (Anthropic, Google Gemini) each get their own implementation class.

---

## Message Types ✅

```ts
type Message =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; toolCalls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string; isError?: boolean };
```

System role is included in the type but never stored in history — it's injected per-call by the chat/agent layer.

---

## Tool Schema ✅

Each tool is self-describing:

```ts
interface Tool {
  name: string;
  description: string;
  parameters: z.ZodSchema;       // zod schema → convert to JSON schema for the API
  requiresApproval: boolean;     // shell exec, file writes = true; file reads = maybe false
  execute: (args: unknown) => Promise<ToolResult>;
}
```

**Status:** Types defined. No tool implementations yet. Registry 🚧.

---

## Memory ✅ / 🚧

**Current:** `src/history.ts` — flat `{ userMsg, aiResponse }` pairs in a mutable array. Works for basic chat but incompatible with tool calls.

**Planned:** `src/memory/` — `Memory` interface + `InMemoryMemory` class storing full `Message[]`.

---

## Folder Structure

Everything should have its own folder. The `src/` directory is organized by domain, not by layer.

```
src/
├── config/         ✅  config loading, env vars, types
├── memory/         🚧  conversation history, persistence (currently flat history.ts)
├── provider/       ✅  Provider interface, OpenAI implementation, factory
├── tools/          🚧  tool definitions and registry (types exist, implementations pending)
├── ui/             🚧  input/output interface (readline still in index.ts)
├── agent/          🚧  the core loop (chat-only in llm.ts, no tool loop)
└── types.ts        ✅  shared domain types (Message, Tool, Provider, Config, etc.)
```

import { describe, it, expect, vi, beforeAll } from "vitest";

process.env.PROVIDER_API_KEY = "sk-test-key";
process.env.PROVIDER_BASE_URL = "https://test-provider.com/api/v1";
process.env.JUGARI_MODEL = "test-model";

const { mockCreate, mockHistory } = vi.hoisted(() => {
  async function* createStream<T>(chunks: T[]): AsyncGenerator<T> {
    for (const chunk of chunks) yield chunk;
  }

  const mockCreate = vi.fn((opts: unknown) => {
    const chunks = [
      { choices: [{ delta: { content: "Hello" } }] },
      { choices: [{ delta: { content: " " } }] },
      { choices: [{ delta: { content: "World" } }] },
      { choices: [{ index: 0, delta: {} }] },
    ];
    return createStream(chunks);
  });

  const mockHistory = vi.fn(
    (userMsg: string, aiResponse: string, his: unknown[]) => {
      his.push({ userMsg, aiResponse });
    },
  );

  return { mockCreate, mockHistory };
});

vi.mock("openai", () => {
  return {
    default: class {
      constructor() {}
      chat = { completions: { create: mockCreate } };
    },
  };
});

vi.mock("../src/history.js", () => {
  return { history: mockHistory };
});

describe("llm", () => {
  beforeAll(async () => {
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  it("should call create with the correct arguments", async () => {
    const { llm } = await import("../src/llm.js");
    const his: { userMsg: string; aiResponse: string }[] = [];

    await llm({ input: "test input", history: his });

    const opts = mockCreate.mock.calls[0][0] as Record<string, unknown>;
    expect(opts.model).toBe("test-model");
    expect(opts.stream).toBe(true);
    expect(opts.max_tokens).toBe(4096);

    const msgs = opts.messages as { role: string; content: string }[];
    expect(msgs[0].role).toBe("system");
    expect(msgs[1].role).toBe("user");
    expect(msgs[1].content).toBe("test input");
  });

  it("should include prior conversation history in messages", async () => {
    const { llm } = await import("../src/llm.js");
    const his = [
      { userMsg: "previous question", aiResponse: "previous answer" },
    ];

    await llm({ input: "next question", history: his });

    const opts = mockCreate.mock.calls[1][0] as Record<string, unknown>;
    const msgs = opts.messages as { role: string; content: string }[];
    const userMsgs = msgs.filter((m) => m.role === "user");
    const assistantMsgs = msgs.filter((m) => m.role === "assistant");

    expect(userMsgs.some((m) => m.content === "previous question")).toBe(true);
    expect(assistantMsgs.some((m) => m.content === "previous answer")).toBe(
      true,
    );
    expect(userMsgs.some((m) => m.content === "next question")).toBe(true);
  });

  it("should call history with accumulated response", async () => {
    const { llm } = await import("../src/llm.js");
    const his: { userMsg: string; aiResponse: string }[] = [];
    mockHistory.mockClear();

    await llm({ input: "accumulate test", history: his });

    expect(mockHistory).toHaveBeenCalledTimes(1);

    const [userInput, aiResponse, hisArg] = mockHistory.mock
      .calls[0] as unknown as [string, string, unknown[]];
    expect(userInput).toBe("accumulate test");
    expect(aiResponse).toBe("Hello World");
    expect(hisArg).toBe(his);
  });
});

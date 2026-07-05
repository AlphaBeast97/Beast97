import { before, describe, it, mock } from "node:test";
import assert from "node:assert/strict";

process.env.PROVIDER_API_KEY = "sk-test-key";
process.env.PROVIDER_BASE_URL = "https://test-provider.com/api/v1";
process.env.JUGARI_MODEL = "test-model";

const mockHistory = mock.fn((userMsg, aiResponse, his) => {
  his.push({ userMsg, aiResponse });
});

mock.module("../src/history.js", {
  namedExports: {
    history: mockHistory,
  },
});

describe("llm", () => {
  let capturedOptions;
  let llm;

  async function* createStream(chunks) {
    for (const chunk of chunks) {
      yield chunk;
    }
  }

  const mockCreate = mock.fn((opts) => {
    capturedOptions = opts;
    const chunks = [
      { choices: [{ delta: { content: "Hello" } }] },
      { choices: [{ delta: { content: " " } }] },
      { choices: [{ delta: { content: "World" } }] },
      { choices: [{ index: 0, delta: {} }] },
    ];
    return createStream(chunks);
  });

  mock.module("openai", {
    defaultExport: class {
      constructor() {}
      chat = { completions: { create: mockCreate } };
    },
  });

  const silentExec = async (fn) => {
    const original = process.stdout.write;
    process.stdout.write = () => true;
    try {
      return await fn();
    } finally {
      process.stdout.write = original;
    }
  };

  before(async () => {
    llm = await import("../src/llm.js");
  });

  it("should call create with the correct arguments", async () => {
    const his = [];
    await silentExec(() => llm.llm({ input: "test input", history: his }));

    assert.ok(mockCreate.mock.callCount() >= 1);

    assert.equal(capturedOptions.model, "test-model");
    assert.equal(capturedOptions.stream, true);
    assert.equal(capturedOptions.max_tokens, 4096);

    const msgs = capturedOptions.messages;
    assert.equal(msgs[0].role, "system");
    assert.equal(msgs[1].role, "user");
    assert.equal(msgs[1].content, "test input");
  });

  it("should include prior conversation history in messages", async () => {
    const his = [
      { userMsg: "previous question", aiResponse: "previous answer" },
    ];

    await silentExec(() => llm.llm({ input: "next question", history: his }));

    const msgs = capturedOptions.messages;
    const userMsgs = msgs.filter((m) => m.role === "user");
    const assistantMsgs = msgs.filter((m) => m.role === "assistant");

    assert.ok(userMsgs.some((m) => m.content === "previous question"));
    assert.ok(assistantMsgs.some((m) => m.content === "previous answer"));
    assert.ok(userMsgs.some((m) => m.content === "next question"));
  });

  it("should call history with accumulated response", async () => {
    const his = [];
    mockHistory.mock.resetCalls();

    await silentExec(() => llm.llm({ input: "accumulate test", history: his }));

    const callCount = mockHistory.mock.callCount();
    assert.ok(callCount >= 1);

    const callArgs = mockHistory.mock.calls[callCount - 1].arguments;
    assert.equal(callArgs[0], "accumulate test");
    assert.equal(callArgs[1], "Hello World");
    assert.strictEqual(callArgs[2], his);
  });
});

import { describe, it, expect, vi } from "vitest";

vi.hoisted(() => {
  process.env.PROVIDER_API_KEY = "sk-test-key";
  process.env.PROVIDER_BASE_URL = "https://test-provider.com/api/v1";
  process.env.JUGARI_MODEL = "test-model";

  vi.spyOn(process, "exit").mockImplementation((() => {
    throw new Error("process.exit called");
  }) as never);
  vi.spyOn(process.stderr, "write").mockReturnValue(true);
});

import { requireEnv } from "../src/config.js";

describe("config", () => {
  it("should return the value when env var exists", () => {
    expect(requireEnv("PROVIDER_API_KEY")).toBe("sk-test-key");
  });

  it("should exit when env var is missing", () => {
    expect(() => requireEnv("NONEXISTENT_VAR")).toThrow("process.exit called");
  });
});

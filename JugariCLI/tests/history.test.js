import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { history } from "../src/history.js";

describe("history", () => {
  it("should push a user message and AI response to the array", () => {
    const his = [];
    history("hello", "world", his);
    assert.deepEqual(his, [{ userMsg: "hello", aiResponse: "world" }]);
  });

  it("should return the updated array", () => {
    const his = [];
    const result = history("foo", "bar", his);
    assert.strictEqual(result, his);
    assert.deepEqual(result, [{ userMsg: "foo", aiResponse: "bar" }]);
  });

  it("should accumulate multiple turns in order", () => {
    const his = [];
    history("first", "response one", his);
    history("second", "response two", his);
    history("third", "response three", his);
    assert.strictEqual(his.length, 3);
    assert.deepEqual(his[0], { userMsg: "first", aiResponse: "response one" });
    assert.deepEqual(his[1], {
      userMsg: "second",
      aiResponse: "response two",
    });
    assert.deepEqual(his[2], {
      userMsg: "third",
      aiResponse: "response three",
    });
  });

  it("should handle empty strings", () => {
    const his = [];
    history("", "", his);
    assert.deepEqual(his, [{ userMsg: "", aiResponse: "" }]);
  });
});

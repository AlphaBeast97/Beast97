import { describe, it, expect } from "vitest";
import { history } from "../src/history.js";

describe("history", () => {
  it("should push a user message and AI response to the array", () => {
    const his: { userMsg: string; aiResponse: string }[] = [];
    history("hello", "world", his);
    expect(his).toEqual([{ userMsg: "hello", aiResponse: "world" }]);
  });

  it("should return the updated array", () => {
    const his: { userMsg: string; aiResponse: string }[] = [];
    const result = history("foo", "bar", his);
    expect(result).toBe(his);
    expect(result).toEqual([{ userMsg: "foo", aiResponse: "bar" }]);
  });

  it("should accumulate multiple turns in order", () => {
    const his: { userMsg: string; aiResponse: string }[] = [];
    history("first", "response one", his);
    history("second", "response two", his);
    history("third", "response three", his);
    expect(his.length).toBe(3);
    expect(his[0]).toEqual({ userMsg: "first", aiResponse: "response one" });
    expect(his[1]).toEqual({
      userMsg: "second",
      aiResponse: "response two",
    });
    expect(his[2]).toEqual({
      userMsg: "third",
      aiResponse: "response three",
    });
  });

  it("should handle empty strings", () => {
    const his: { userMsg: string; aiResponse: string }[] = [];
    history("", "", his);
    expect(his).toEqual([{ userMsg: "", aiResponse: "" }]);
  });
});

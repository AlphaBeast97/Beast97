#!/usr/bin/env node

import "dotenv/config";
import { openai } from "./llm.js";
import { JUGARI_MODEL } from "./config.js";

const main = async () => {
  const completion = await openai.chat.completions.create({
    model: JUGARI_MODEL,
    messages: [{ role: "user", content: "What is the capital of France?" }],
    stream: true,
    max_tokens: 4096,
  });

  for await (const chunk of completion) {
    const content = chunk.choices[0].delta?.content || "";
    process.stdout.write(content);
  }
};

main();

#!/usr/bin/env node

import { openai } from "./openai.js";
import { JUGARI_MODEL } from "./config.js";

const main = async () => {
  const completion = await openai.chat.completions.create({
    model: JUGARI_MODEL,
    messages: [{ role: "user", content: "What is the capital of France?" }],
  });
  console.log(completion);
};

main();

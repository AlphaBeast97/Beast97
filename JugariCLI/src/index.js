#!/usr/bin/env node

import "dotenv/config";
import { readFileSync } from "node:fs";
import { llm } from "./llm.js";
import { JUGARI_MODEL, PROVIDER_BASE_URL } from "./config.js";
import rl from "readline/promises";
import { stdin, stdout } from "node:process";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
);

let his = [];

const main = async () => {
  try {
    console.log(
      `\n${pkg.name} v${pkg.version} — model: ${JUGARI_MODEL}, provider: ${PROVIDER_BASE_URL}`,
    );
    console.log("\u2500".repeat(60));
    const usrMsg = await rl.createInterface({ input: stdin, output: stdout });
    while (true) {
      const userInput = await usrMsg.question("User: \n>");

      await llm({ input: userInput, history: his });
    }
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
  }
};

main();

#!/usr/bin/env node

import "dotenv/config";
import { readFileSync } from "node:fs";
import { llm } from "./llm.js";
import { JUGARI_MODEL, PROVIDER_BASE_URL } from "./config.js";
import rl from "readline/promises";
import { stdin, stdout } from "node:process";
import type { HistoryEntry } from "./history.js";

const pkg: { name: string; version: string } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
);

const his: HistoryEntry[] = [];

const main = async (): Promise<void> => {
  try {
    console.log(
      `\n${pkg.name} v${pkg.version} — model: ${JUGARI_MODEL}, provider: ${PROVIDER_BASE_URL}`,
    );
    console.log("\u2500".repeat(60));
    const usrMsg = rl.createInterface({ input: stdin, output: stdout });
    while (true) {
      const userInput = await usrMsg.question("User: \n>");

      await llm({ input: userInput, history: his });
    }
  } catch (error) {
    process.stderr.write(
      `Error: ${error instanceof Error ? error.message : String(error)}\n`,
    );
  }
};

main();

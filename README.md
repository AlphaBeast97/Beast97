# Beast97

> A coding agent harness — built by hand, for free-tier models. TypeScript. No pretense.

---

## What It Is

Beast97 is a CLI that wires an LLM (any OpenAI-compatible provider) to your codebase incrementally. It starts as a chat interface, grows into a tool-using agent that can read, write, search, and run commands in your project.

This is the kind of tool that Claude Code and Cursor are — but built from scratch, in the open, by a solo developer. No VC. No cloud credits. Just spare time and curiosity.

## Where It Is Now

**Current version:** v0.0.2-ts.1

Working features:
- Streaming chat with any OpenAI-compatible model (OpenRouter, OpenAI, Together, Ollama)
- Multi-turn conversation history (in-memory)
- Provider-agnostic config via env vars (`PROVIDER_API_KEY`, `PROVIDER_BASE_URL`, `JUGARI_MODEL`)
- Error handling — network failures, API errors, empty responses — all caught gracefully
- Ctrl+C clean exit
- TypeScript + strict mode, Vitest, `tsc` build

**12 passing tests** — history, LLM mock, config validation, error handling.

## Where It's Going

- **V0.1** — Agent loop with mock tools (proving the orchestration mechanism)
- **V0.2–V0.3** — Real file read/write tools (read, grep, edit, create files)
- **V0.4** — Shell command execution with approval gates
- **V0.5+** — Persistent sessions, context compaction, safety rings, full coding agent

See the [full roadmap](Docs/Plan/version-roadmap.md) for details.

## Why "Beast97"

Named after the creator's GitHub handle — **AlphaBeast97**. Dropping "Alpha" keeps it tight. The name says what it is: unapologetic, direct, and personal. No hiding behind a thesaurus noun.

## Quick Start

```bash
git clone https://github.com/alphaBeast97/beast97
cd beast97/Beast97CLI
cp .env.example .env
# Edit .env with your provider details
npm run dev
```

## Requirements

- Node.js >= 20
- An API key from any OpenAI-compatible provider

## License

GPL-3.0-only

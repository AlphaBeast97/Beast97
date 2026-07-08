# Beast97 — Vision

The end state Beast97 is building toward — a full coding agent
harness (inspired by OpenCode, Claude Code, Codex, etc., but built
by one developer, in public, version by version).

**This is the north star, not the gantt chart.** None of this is set in stone.

## Build status by milestone

### v0.0.2 — Foundation ✅
- [x] TypeScript rewrite with strict types
- [x] Provider-agnostic `Provider` interface
- [x] `OpenAIProvider` implementation with streaming
- [x] Typed env var config (`Config`, `requireEnv`)
- [x] Shared types (`Message`, `Tool`, `ToolCall`, `ToolResult`)
- [x] Basic chat CLI with readline REPL
- [x] In-memory conversation history
- [x] Vitest test suite

### Next — Memory + Provider extension 🚧
- [ ] `Provider.complete()` — non-streaming call returning structured `Message` with `toolCalls`
- [ ] `src/memory/` — `Memory` interface + `InMemoryMemory` storing full `Message[]`
- [ ] Replace `src/history.ts` flat pairs with proper message storage

### After — Tools + Agent loop 🚧
- [ ] `src/tools/` — registry, type-safe schemas via Zod
- [ ] File tools — read, write, edit, grep, glob
- [ ] Shell tool — run commands with permission gating
- [ ] `src/agent/` — proper agent loop with tool-call dispatch
- [ ] `src/ui/` — extracted readline/renderer

### Future — Production features 🚧
- [ ] Multi-provider — Anthropic, Google, any OpenAI-compatible
- [ ] Config file support — TOML/YAML/JSON for providers, models, settings
- [ ] Persistent sessions — JSONL save/resume across crashes
- [ ] Context compaction — smart summarization to stay under token limits
- [ ] Sub-agents — spawn isolated sessions for parallel/complex tasks
- [ ] MCP support — connect external tool servers
- [ ] Permissions & safety — ring-based approval model (see [reference](reference/What%20is%20a%20harness%20research.md))
- [ ] Lifecycle hooks — pre/post tool execution hooks
- [ ] TUI layer — configuration and session management
- [ ] Developer-empathetic everywhere — good errors, fast feedback,
      sensible defaults, progressive disclosure

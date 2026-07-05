# Beast97 — Version Roadmap

> Each version is a **shippable, usable CLI** you could stop at and genuinely use.
> Scope per version is kept small enough to be achievable by a solo beginner.
>
> Project name: [Beast97 — why?](../Decisions/name-choice.md)

---

## V0.0.1 — JS Prototype (shipped)

> Full spec: [v0.1-basic-chat-cli.md](v0.1-basic-chat-cli.md)

A JavaScript proof-of-concept to prove the plumbing works.

**Capabilities:**
- Read user input via `readline/promises`
- Send messages to an OpenAI-compatible provider
- Stream response tokens to the terminal
- Maintain conversation history (in-memory array)

**Limitations:**
- JavaScript (no type safety)
- `node:test` with experimental `mock.module` flag
- No build step

**Usage:**
```
$ node src/index.js
```

---

## V0.0.2 — TypeScript Migration (current)

> Full spec: [v0.1-basic-chat-cli.md](v0.1-basic-chat-cli.md)

The same chat CLI, rewritten in TypeScript with a proper build pipeline.

**What changed:**
- All `.js` → `.ts` with `strict: true`
- OpenAI client created once at module level
- `requireEnv()` helper in config
- Vitest replaces `node:test` — no experimental flags
- `vi.mock` + `vi.hoisted` for LLM test mocking
- `tsc` builds to `dist/`, `tsx` for dev
- 13 passing tests (4 history + 7 llm + 2 config)

**Usage:**
```bash
npm run dev    # tsx src/index.ts
npm run build  # tsc
npm start      # node dist/index.js
npm test       # vitest run
```

**Done when:** A user can start the CLI, type a message, see the model's streamed response, and continue the conversation for multiple turns. History is preserved in memory across turns.

✅ **Usable as:** A CLI chat interface to any OpenAI-compatible model.

---

## V0.1 — Agent with Mock Tools

The tool-use loop works end-to-end — but tools are fake (e.g., `get_weather`, `calculate`). This proves the mechanism is solid before wiring real filesystem access.

**Capabilities:**
- Model requests a tool call via `tool_calls` JSON (OpenAI-compatible format)
- Harness parses the call, runs a mock handler, returns `tool_result`
- Loop continues until the model returns text-only
- Max iteration cap prevents infinite loops
- Error handling for malformed tool calls

**Limitations:**
- Tools are simulated — no real filesystem interaction
- Not useful for actual coding yet

**Done when:** The model calls a mock tool, the harness executes it, feeds the result back, and the model continues. The loop terminates correctly on both text-only response and max iterations. Malformed tool calls are caught without crashing.

✅ **Usable as:** A demo/prototype proving the agent loop works.

**Tests:** Tool-call JSON parsing, mock tool execution, tool-result injection, loop termination conditions (text response + max iterations), malformed JSON handling.

---

## V0.2 — File Reader

The agent can explore your codebase — reads files, searches content, lists directories.

**Tools:**
- `read_file` — read any file within the workspace
- `grep` — search file contents by pattern
- `list_directory` — list files in a directory

**Capabilities:**
- Real filesystem tools wired to the tool loop
- Tool registry mapping names to handler functions
- Tool schemas passed to the model in the API call
- Errors handled gracefully (file not found, permission denied)

**Done when:** The agent can read a file, search for a pattern, and list a directory — all within the workspace. Path traversal outside the workspace is blocked. Errors (file not found, no permissions) are returned to the model gracefully.

✅ **Usable as:** A codebase Q&A assistant ("what does this function do?", "find all usages of X").

**Tests:** read_file on existing/missing/blocked paths, grep with matching/non-matching patterns, list_directory on valid/invalid paths, workspace boundary enforcement.

---

## V0.3 — File Editor

The agent can create and modify files — with safety confirmations.

**Tools:**
- `write_file` — create or overwrite a file
- `edit_file` — find-and-replace or line-based edits
- `rename_file` / `delete_file` — destructive operations with prompts

**Capabilities:**
- Confirmation prompt before writes, edits, and deletes
- Diff preview before applying edits
- All V0.2 tools still available

**Done when:** The agent can create a new file, edit an existing one, and rename/delete with user approval. Diffs are shown before edits apply. Rejecting a confirmation cancels the operation.

✅ **Usable as:** A basic coding assistant that can read and write your project files under supervision.

**Tests:** write_file creates new content, edit_file modifies existing content, delete_file with confirmation flow, rejection cancels operation, write outside workspace is blocked.

---

## V0.4 — Shell Runner

The agent can execute shell commands — with permission gating.

**Tools:**
- `run_command` — execute a shell command via `child_process`

**Capabilities:**
- Execute commands within the project directory
- Stream stdout/stderr back to the model
- Timeout and kill long-running commands
- Approve/deny prompt before execution
- Blocked from running outside workspace directory

**Done when:** The agent can run a command, see its output, and continue the conversation. Timeouts kill stuck processes. Denying a command prevents execution. The agent cannot escape the workspace directory.

✅ **Usable as:** A full (basic) coding agent — can read code, edit files, run tests, install deps, check git status.

**Tests:** command execution with stdout/stderr, timeout kills long-running commands, approval prompt (approve + deny paths), workspace directory restriction, error on invalid commands.

---

## V0.5 — Persistent Sessions

Conversations survive crashes. You can stop work and resume later.

**Capabilities:**
- Every message, tool call, tool result, and compaction event written to JSONL file
- Session directory in `.harness/sessions/`
- Resume a session from disk — replay the conversation up to the last turn
- List saved sessions, delete old ones
- Crash recovery — kill the process and resume with no data loss

**Done when:** A conversation can be saved mid-session, the process killed, and the session resumed with full context intact. Multiple sessions can co-exist and be listed/switched.

✅ **Makes ALL previous versions more useful** — no more losing context.

**Tests:** save session after N turns, resume session and verify full context, crash recovery (kill + resume), list and delete sessions, corrupt JSONL handling.

---

## V0.6 — Context Compaction

Long conversations don't break the budget. The agent doesn't silently forget.

**Capabilities:**
- Token counting per message and running total
- Configurable compaction trigger (e.g., 80% of context window)
- Summarization prompt — ask the model to condense older messages
- Keep the most recent N messages intact
- Inject summary back into conversation, discard summarized messages

**Done when:** A long conversation triggers automatic compaction at the configured threshold. The summarized conversation retains enough context that the agent can continue working without confusion. The most recent N messages are preserved verbatim.

✅ **Necessary for real-world use** — you *will* hit the context wall by this point.

**Tests:** token counting accuracy, compaction trigger fires at correct threshold, summary is injected correctly, agent can continue working post-compaction, configuration changes take effect.

---

## V0.7 — Project-Aware Prompting

The agent adapts its behavior per project based on configuration files.

**Capabilities:**
- Split system prompt into static base + dynamic injection
- Auto-inject `AGENTS.md` or `CLAUDE.md` from project root
- Tool descriptions auto-generated from the tool registry
- Static prompt content always comes first (prefix caching optimization)
- Project config file (`.harness/config.json` or similar)

**Done when:** Creating an `AGENTS.md` in the project root changes the agent's behavior. Removing it returns to default behavior. Multiple project directories each get their own prompt assembly.

✅ **Agent now understands project conventions** without manual instruction each time.

**Tests:** AGENTS.md injection changes behavior, missing AGENTS.md falls back to default, static content precedes dynamic content, prefix caching is not broken by dynamic injection.

---

## V0.8 — Provider Interface Abstraction

Formalize the provider layer with a clean interface, enabling model fallback and non-OpenAI providers.

**Capabilities:**
- Provider interface: `sendMessage()`, `streamMessage()`
- Config file for provider selection, model name, API keys (moved from env vars)
- Model fallback (if primary fails, try secondary)
- Support for providers that deviate from the OpenAI-compatible schema (e.g., raw Anthropic or Google APIs)

**Done when:** Switching from an OpenAI-compatible provider to a different protocol (e.g., Anthropic's native API) requires a config change instead of code changes. Fallback works when the primary provider fails.

✅ **No vendor lock-in** — run on free models during dev, switch to paid when needed.

**Tests:** OpenAI-compatible provider works, protocol-adapter provider works, switching via config works, provider failure triggers fallback, config validation rejects invalid provider names.

---

## V0.9 — Safety, Hooks, Polish

Production-ready release.

**Capabilities:**
- Permission ring model (Ring 0: read-only, Ring 1: safe shell, Ring 2: needs approval, Ring 3: full access)
- Each tool declares its required permission level
- Pre/post lifecycle hooks — extend behavior without modifying the harness
- Installable via `npm install -g`, `--version`, `--help`
- Documentation complete

**Done when:** Running in Ring 0 blocks write tools cleanly. Ring 2 prompts for approval on destructive commands. Hooks fire at the correct points. The package is published and installable.

✅ **A real, production-quality open-source coding agent.**

**Tests:** each ring enforces correct tool restrictions, permission escalation is blocked, pre-hook can deny a tool call, post-hook can inspect result, npm install succeeds.

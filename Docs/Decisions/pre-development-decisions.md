# Pre-Development Decisions

> Architecture Decision Records for [Beast97](name-choice.md) — a coding agent harness.
> Each entry documents the context, alternatives considered, chosen decision, rationale, and consequences.
> See also: [Name Choice](name-choice.md) — project naming decision.

---

## Decision 1: Tech Stack — TypeScript / Node.js

**Context:** A coding harness is orchestration and I/O — HTTP calls to an LLM API, managing conversation state, parsing tool-call JSON, executing file/shell operations, rendering a terminal UI. No ML training, tensor math, or inference work is involved.

**Alternatives Considered:**
- **Python** (used by Aider) — strong LLM ecosystem (LangChain, etc.), but the project doesn't need any of that
- **Go** — fast, single-binary output, but unfamiliar and overkill for this scope
- **Rust** — even more overkill
- **Plain JavaScript** — simpler, fewer tooling deps, but no type safety
- **TypeScript** — adds compile step, strict typing, better DX as codebase grows

**Decision:** TypeScript / Node.js with `strict: true`. Compiled via `tsc`, developed via `tsx` (direct TS execution, no build needed in dev).

**Rationale:**
- Existing familiarity (Express, Next.js, React) — no new language to learn alongside a new domain
- Non-blocking I/O ideal for streaming LLM responses
- `npm` ecosystem makes global CLI distribution trivial (`npm install -g` / `npx`)
- TypeScript catches interface mismatches at compile time — critical as the tool loop grows complex
- Self-documenting interfaces (`HistoryEntry`, `LlmPayload`) make the code readable months later
- `tsx` makes the dev loop fast — no compile step until you ship

**Consequences:**
- Build step required for production (`tsc` → `dist/`)
- Dev deps include `typescript`, `@types/node`, `tsx`
- Import paths use `.js` extensions (Node16 ESM convention) even in `.ts` files

**Risks:**
- JS/TS ecosystem churn — dependencies may break or become unmaintained
- `child_process` security surface is large — must be carefully sandboxed
- Adding TypeScript mid-project (as happened here) requires converting all files at once

---

## Decision 2: Model & API Strategy

**Context:** The harness needs a model that supports tool/function calling. Budget is zero — no paid API keys. The system must work with any provider speaking the OpenAI-compatible chat completions format.

**Alternatives Considered:**
- **Claude API** — best agentic coding model, but expensive
- **GPT-4 / GPT-4o** — good tool calling, also expensive
- **Ollama / local models** — free, but unreliable tool calling and resource-heavy
- **OpenCode Zen** — already used via OpenCode, but less general-purpose as a provider
- **Vendor lock-in** — hardcoding a single provider's API format — bad for flexibility

**Decision:** Provider-agnostic from day one. The harness talks to any OpenAI-compatible API. Environment variables (`PROVIDER_API_KEY`, `PROVIDER_BASE_URL`, `JUGARI_MODEL`) determine the target. Currently targeting DeepSeek V4 Flash Free via OpenRouter as the primary model.

**Rationale:**
- OpenAI-compatible schema means switching providers is just a base URL and API key swap
- No rewiring needed for different providers — same `openai` SDK, different config
- Free tier is genuinely usable on OpenRouter
- DeepSeek supports tool/function calling
- OpenRouter's single endpoint simplifies future multi-provider expansion

**Consequences:**
- Must verify chosen model reliably emits valid `tool_calls` JSON before building the loop around it
- Headers and provider-specific quirks (e.g., OpenRouter's `HTTP-Referer`) live in code, not config
- If free tier degrades or disappears, swap providers via `.env` — no code changes
- Provider abstraction layer grows naturally from the OpenAI-compatible baseline

**Risks:**
- Free tier may be rate-limited, go down, or disappear entirely
- DeepSeek may not emit tool calls reliably — the loop won't work if the model doesn't cooperate
- OpenAI-compatible schema is a simplification — some providers deviate from the standard
- No fallback budget if free tier is insufficient — development halts until a paid option is added

---

## Decision 3: Development Approach — "Planner, Not Writer"

**Context:** The primary goal is to learn how a harness works by building one. AI tools are available and useful, but having them write the code would defeat the learning purpose.

**Alternatives Considered:**
- **Full AI-generated code** — fast but no understanding gained
- **AI pair-programming** — AI writes, human reviews — blurs the learning line
- **No AI at all** — pure self-reliance — possible but slow and wastes a useful tool

**Decision:** AI can write tests and discuss architecture/design, but may NOT write production code. Boilerplate (package.json, config files, simple utilities) is a grey area — use judgment, but core loop, tool implementations, and agent logic must be hand-written.

**Rationale:**
- Writing the core logic by hand builds genuine understanding of each component
- AI-written tests are safe and save time — they verify, not define, the architecture
- AI as a sounding board for design discussions is valuable without compromising learning

**Consequences:**
- Slower development velocity — expected and intentional
- Clean boundary needed between "test" and "production" code to avoid temptation
- Design discussions with AI should be documented in `DESIGN.md` or decision logs for FYP write-up

**Risks:**
- Hard to self-enforce — temptation grows when stuck on a bug for hours
- Grey area (boilerplate, configs) may expand over time and blur the rule
- Slower pace may cause motivation loss on a long project

---

## Decision 4: Release Strategy — Incremental, Not Big-Bang

**Context:** This is a complex system being built by a single developer learning a new domain. Building everything before a V1 launch is unrealistic and risky.

**Alternatives Considered:**
- **Big-bang** — build everything, launch V1 — high risk, no feedback loop
- **Time-based** — fixed release cadence — arbitrary, features may be half-baked
- **Feature-based milestones** — each version ships when a specific capability is complete, with room for refactoring between

**Decision:** Each version must be a shippable, usable CLI. Scope per version is deliberately small — the tool loop alone takes a full version, and read-only tools are separate from write tools.

> Full roadmap with version capabilities, limitations, and usage examples:
> [Plan/version-roadmap.md](../Plan/version-roadmap.md)

| Version | What it ships |
|---------|--------------|
| **V0.0.1** | JS prototype — basic chat CLI (proved the plumbing) |
| **V0.0.2** | TypeScript rewrite — strict types, Vitest, tsc build |
| **V0.1** | Agent loop with mock tools — prove the mechanism |
| **V0.2** | File reader — read, grep, list directories |
| **V0.3** | File editor — write, edit, delete with confirmations |
| **V0.4** | Shell runner — run commands with permission gating |
| **V0.5** | Persistent sessions — JSONL save/resume |
| **V0.6** | Context compaction — summarize, stay under budget |
| **V0.7** | Project-aware prompting — AGENTS.md injection |
| **V0.8** | Provider interface abstraction — formal provider layer |
| **V0.9** | Safety, hooks, polish — production release |

Notable: the JS prototype was shipped as v0.0.1, then the TypeScript migration landed as v0.0.2. This does not reset the roadmap; v0.0.x are internal milestones that build toward V0.1 (agent loop with mock tools).

**Rationale:**
- Each version is a genuine checkpoint — demonstrable, testable, dogfoodable
- Early versions reveal architectural needs that inform later ones
- Room to adapt between versions without scope creep

**Consequences:**
- Refactoring between versions is expected — not a failure
- Each version needs a clear "done" criterion to avoid endless polish
- Design docs should be updated per version to track architectural evolution

**Risks:**
- Scope creep within a version — "just one more feature" delays shipping
- Early architecture decisions may need significant rework in later versions
- Motivation may wane before reaching V1.0 — 10 versions is a long arc

---

## Decision 5: Cost Constraint — Free-Tier Models First

**Context:** Zero budget for API costs during development. The harness must be designed to work reliably on free-tier models.

**Alternatives Considered:**
- **Paid APIs** — better models, but not affordable
- **Self-hosted models** — free to run, but GPU cost and reliability overhead

**Decision:** The harness is built around and evaluated on free-tier models (currently DeepSeek V4 Flash Free via OpenRouter). Free-tier reliability is a first-class design constraint, not an afterthought. Because the harness speaks the OpenAI-compatible format, the provider can be swapped without code changes.

**Rationale:**
- No budget — this is the only viable option for development
- Framing it as "built for free-tier models" is a legitimate design constraint that differentiates the project

**Consequences:**
- Must handle smaller context windows gracefully
- Must validate tool-calling reliability of the free model before committing the architecture
- Compaction and context management must be robust — free models are less forgiving
- If the free model can't handle the task, the harness architecture must still work when a paid model is plugged in later

**Risks:**
- Free model may not support tool calling well enough — the entire project depends on this
- Context window of free models is small — compaction will be exercised heavily and may reveal bugs
- If the free tier is discontinued, there is no budget for a paid replacement
- The "built for free models" constraint may limit the harness's capability ceiling

---

## Decision 6: Research Organization — Separate Files Per Topic

**Context:** The harness has many interconnected components (tool loop, context management, permissions, session persistence, etc.). A single monolithic document becomes unwieldy.

**Alternatives Considered:**
- **Single file** — everything in one place — hard to navigate and update
- **Wiki / Notion** — external tool — breaks the repo-adjacent documentation pattern
- **Separate files with cross-links** — each component gets its own markdown file

**Decision:** Each major aspect gets its own file under `Docs/Research/`. Files are linked together via relative markdown links in relevant sections.

**Rationale:**
- Easy to navigate by topic
- Each file stays focused and manageable
- Links create a web of understanding rather than a linear document
- Version control tracks changes per-component

**Consequences:**
- Cross-referencing required — a linking convention should be established early
- Must avoid orphan files — every file should be reachable from an index or parent document
- Update the TOC in the main research doc when adding new files

**Risks:**
- Files may drift out of sync — a change in one file may leave links in another outdated
- No single source of truth if duplicate information appears across files
- Without a master index, a newcomer won't know where to start

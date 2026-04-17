# Explicit 100-agent refinement pass

Each **Agent N** (1–100) maps **1:1** to **`REF-NNN.md`** with the same number (Agent 17 → `REF-017.md`). This is the canonical mapping for Cursor Background Agents, Composer, or any external runner that can queue parallel jobs.

**See also:** [EXPLICIT_50_AGENTS.md](./EXPLICIT_50_AGENTS.md) — run only **REF-051–REF-100** (agents 51–100) with controllers **C06–C10**.

## Execution model (100 workload units)

| Layer | Meaning |
|-------|--------|
| **100 logical agents** | `Agent k` ↔ `REF-k` padded to three digits (the table below). |
| **10 controller agents** | In Cursor, **one subagent per controller** (`C01`…`C10`), each assigned **10 consecutive REFs** — same total coverage (10×10=**100**), fewer sessions, less merge pain. |

A strict **100-session** run means pasting the single-REF prompt 100 times; a **10-session** run uses the controller batch table.

## How to run

| Pattern | What to do |
|--------|------------|
| **Batched subagents (recommended)** | Run **10 controller prompts** below; each controller owns **10 REFs** (e.g. Controller A → REF-001…010). Controllers should not edit the same primary files in one pass—merge order if conflicts. |
| **Strict 1:1** | Open 100 separate agent sessions (Agent 1 … Agent 100), paste the **single-REF prompt** for that row from the table. |
| **CI / headless** | Not supported in-repo; export prompts from `REF-*.md` + this table IDs. |

## Controller batches (10 agents × 10 REFs = 100)

Use these as the **explicit** batch boundaries when you cannot spawn 100 sessions:

| Controller | REF range | Primary areas (from INDEX) |
|------------|-----------|------------------------------|
| C01 | REF-001 – REF-010 | `game`, timers, WebGL face, Electron, notifications, TileBoard, GameScreen, HUD, hubs, Settings |
| C02 | REF-011 – REF-020 | HUD/toolbar, hubs, Codex, Inventory, SFX, telemetry, Steam, Vitest docs, eslint/tsconfig |
| C03 | REF-021 – REF-030 | pair proximity, focus dim, run-export, RNG, UTC, theme, tile shatter, perf stub, e2e flame |
| C04 | REF-031 – REF-040 | Game over, modals, FINDABLES, balance notes, programmatic card face, svgIds, dev HUD |
| C05 | REF-041 – REF-050 | dev fixtures, drag scroll, tilt, viewport, graphics, relics, mode art |
| C06 | REF-051 – REF-060 | audio, textures, rim shader, rim geometry, visual config, appendix, camera, breakpoints, desktop client, coarse pointer |
| C07 | REF-061 – REF-070 | toolbar roving, tileBoardPick, floor schedule docs, mutators ritual, save matrix, contracts note, telemetry, IPC naming, Steam errors, vitest setup |
| C08 | REF-071 – REF-080 | CSS/theme, OverlayModal, Meta lists, Inventory lazy, Codex search, save export, TileBoardScene, WebGL loss, e2e isolation, resolving selection |
| C09 | REF-081 – REF-090 | i18n hints, HUD live region, batching, encyclopedia media, runFixtures, tileStepLegacy, card geometry, rim env, Three disposal, Playwright traces |
| C10 | REF-091 – REF-100 | scripts/verify, TS references, test naming, axe, contrast, shortcuts, cloud copy, sim script, distraction tick, backlog hygiene |

## Per-agent ID table (1:1)

`Agent k` implements / triages `docs/refinement-tasks/REF-knn.md` where `knn` is `String(k).padStart(3,'0')`.

Example: **Agent 47** → `REF-047.md` (`tileBoardViewport` resize debounce).

## Prompt template (single agent)

```
You are Agent NNN (1–100) for the Memory Dungeon repo.
Your sole backlog item is docs/refinement-tasks/REF-NNN.md (same NNN as your agent number).
Read that file. Implement the Proposed work and Acceptance criteria in code/tests/docs as appropriate.
Run: yarn typecheck && yarn test from repo root. Keep changes minimal and scoped.
Report: what you did, files touched, what remains blocked.
```

## Prompt template (batch controller C0K, 10 REFs)

```
You are Controller C0K for the Memory Dungeon repo (covers REF-AAA through REF-BBB inclusive).
For each REF in that range, open docs/refinement-tasks/REF-XXX.md and implement or explicitly defer with a one-line reason in your summary.
Avoid cross-batch edits when possible. Run yarn typecheck && yarn test before finishing.
```

---

**Note:** Cursor does not expose a public API to spawn 100 OS-level processes named “agents.” This document defines **explicit agent identity** and **batch equivalence** so work maps cleanly to automation or repeated Composer sessions.

# Explicit 50-agent refinement pass (REF-051–REF-100)

Use this when you want the **second half** of the [100-agent map](./EXPLICIT_100_AGENTS.md) without re-reading the full table. **50 logical agents** here means **Agent 51–100** ↔ **`REF-051.md` … `REF-100.md`** (same 1:1 numbering as the 100-doc: agent *k* → `REF-k` zero-padded to three digits).

For the **first** 50 (REF-001–REF-050), use controllers **C01–C05** in [EXPLICIT_100_AGENTS.md](./EXPLICIT_100_AGENTS.md).

## Execution model

| Layer | Meaning |
|-------|---------|
| **50 logical agents** | `Agent k` ↔ `REF-k` for **k = 51 … 100** only. |
| **5 controller agents** | **C06–C10** below — each owns **10 consecutive REFs** (5×10 = **50**). |

## Controller batches (5 agents × 10 REFs = 50)

Paste the **batch controller** prompt at the bottom of this file for each controller, or run **10 single-REF prompts** per controller using the [single-agent template](#prompt-template-single-agent).

| Controller | REF range | Primary areas (from [INDEX.md](./INDEX.md)) |
|------------|-----------|-----------------------------------------------|
| C06 | REF-051 – REF-060 | Audio, textures, rim shader/geometry, visual config, mechanics appendix, camera viewport, breakpoints, desktop client, coarse pointer |
| C07 | REF-061 – REF-070 | Toolbar roving, tileBoardPick, floor schedule docs, mutators ritual, save matrix, contracts checklist, telemetry scrub, IPC naming, Steam errors, vitest setup |
| C08 | REF-071 – REF-080 | CSS/theme vs modules, OverlayModal focus, Meta lists, Inventory lazy, Codex search, settings import/export, TileBoardScene, Playwright isolation, resolving selection |
| C09 | REF-081 – REF-090 | i18n hints, HUD live region, batching, encyclopedia media, runFixtures, legacy tile step, card geometry, rim env, Three disposal, Playwright traces |
| C10 | REF-091 – REF-100 | scripts/verify, TS project refs, test file naming, axe, WCAG tokens, shortcuts, cloud copy, sim-endless, distraction tick, INDEX hygiene |

## Per-agent ID (51–100)

`Agent k` implements or triages `docs/refinement-tasks/REF-knn.md` where `knn = String(k).padStart(3,'0')` and **51 ≤ k ≤ 100**.

Examples: **Agent 62** → `REF-062.md` · **Agent 91** → `REF-091.md`.

## Prompt template (single agent)

```
You are Agent NNN (51–100) for the Memory Dungeon repo.
Your sole backlog item is docs/refinement-tasks/REF-NNN.md (same NNN as your agent number).
Read that file. Implement the Proposed work and Acceptance criteria in code/tests/docs as appropriate.
Run: `yarn fullcheck` from repo root (or `yarn verify` if lint is unchanged). Keep changes minimal and scoped.
Report: what you did, files touched, what remains blocked.
```

## Prompt template (batch controller C0K, 10 REFs)

```
You are Controller C0K for the Memory Dungeon repo (covers REF-AAA through REF-BBB inclusive).
For each REF in that range, open docs/refinement-tasks/REF-XXX.md and implement or explicitly defer with a one-line reason in your summary.
Avoid cross-batch edits when possible. Run `yarn fullcheck` before finishing.
```

**Concrete controller ranges (copy the REF line into AAA–BBB):**

- **C06:** REF-051 through REF-060  
- **C07:** REF-061 through REF-070  
- **C08:** REF-071 through REF-080  
- **C09:** REF-081 through REF-090  
- **C10:** REF-091 through REF-100  

## Relation to “50-pass” rounds in the wiki

[multiple-agents.md](../internal-wiki/multiple-agents.md) describes **50 scoped parallel passes** as a documentation/code consistency cadence. This file is the **REF-backed** equivalent for the **back half** of the REF card deck. For thematic “slice” passes that do not map to a single REF, still fold findings into authoritative docs ([SOURCE_MAP.md](../internal-wiki/SOURCE_MAP.md), snapshots) rather than many one-off narratives.

## Verification pass (executed in-repo)

Re-run when validating that **REF-051–REF-100** evidence in [COMPLETION.md](./COMPLETION.md) still holds (cards are already marked addressed; this is regression / CI parity).

| Step | Command | Expected |
|------|---------|----------|
| Full gate | `yarn fullcheck` | ESLint + test-file extension guard + `yarn verify` (tsc + Vitest) all green |
| Endless sampler (REF-098) | `yarn sim:endless --floors=500 --seed=42001` | CSV lines for `floorTag` and `mutator` counts |

**Last recorded run:** `yarn fullcheck` green; `sim:endless` smoke OK. ESLint: `src/test/installCanvas2dMock.ts` must not alias `this` to a local (`@typescript-eslint/no-this-alias`) so CI matches local lint.

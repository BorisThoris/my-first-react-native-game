# App-specific idea backlog

Concrete feature specs for **this** codebase: file paths, `RunState` impact, and mode interactions. These are **design + engineering tickets**, not genre essays.

**Current facts (baseline):**

- Arcade `startRun` → `createNewRun(bestScore)` leaves `activeMutators` as **`[]`** for the whole run (`useAppStore.ts` → `game.ts`).
- `advanceToNextLevel` always passes **`run.activeMutators`** unchanged into `buildBoard` (`game.ts` ~1244–1248).
- Daily uses **one** mutator from `DAILY_MUTATOR_TABLE` (`mutators.ts`, `createDailyRun`).
- Relic draft at floors **3 / 6 / 9** (`relics.ts`, `openRelicOffer`).

When an idea changes generation, scoring, or per-floor rules, plan a **`GAME_RULES_VERSION` bump** and update `run-export` / import expectations ([`MUTATORS.md`](../MUTATORS.md)).

**Tracked as engineering tasks:** [`docs/gameplay-tasks/`](../gameplay-tasks/README.md) (IDs `GP-F01`, `GP-O01`, …).

---

## F — Floor identity & pacing

### F-01 — Per-floor mutator schedule (endless)

| Field | Detail |
|-------|--------|
| **Player pitch** | “This floor is different” — mutators can change when you clear a level, not only when you start a run. |
| **Rules** | Before `buildBoard` in `advanceToNextLevel`, compute `nextMutators = pickMutatorsForFloor(run)`. Replace or merge with run baseline. **Daily / puzzle / import** can ignore schedule or use a flag `mutatorSchedule: 'run' \| 'floor'`. |
| **Code** | `advanceToNextLevel` (`game.ts`); new module e.g. `src/shared/floor-mutator-schedule.ts` with pure function `(runSeed, rulesVersion, level, gameMode, baseMutators?) => MutatorId[]`. |
| **Data** | Table rows: `{ fromLevel, toLevel?, mutators, archetypeLabel? }` or cyclic pattern length 8–12. |
| **UI** | Pre-memorize banner: “Floor 5 — **Reading room**” using `archetypeLabel` or joined `MUTATOR_CATALOG` titles (`mutators.ts`). |
| **Risks** | Import/replay: exported seed assumed constant mutators — bump rules version or embed **schedule id** in export payload. |
| **Tests** | Determinism: same `runSeed` + level → same mutator set; scholar contract + schedule still respects `noShuffle`/`noDestroy`. |

### F-02 — Breather floors in schedule

| Field | Detail |
|-------|--------|
| **Rules** | Explicit `[]` or single low-friction mutator every N floors (e.g. after any floor with 2+ mutators). |
| **Code** | Same schedule module as F-01; unit tests assert “no `short_memorize` + `silhouette_twist` on breather.” |

### F-03 — Boss floor tag

| Field | Detail |
|-------|--------|
| **Rules** | Schedule marks `isBoss: true` → HUD shows skull/badge, +15% score for clear, or guaranteed relic reroll token (meta). |
| **Code** | `LevelResult` or `BoardState` flag `floorTag: 'normal' \| 'boss' \| 'breather'` set at gen. |

---

## O — Secondary objectives (bonus, not gate)

Keep **clear the board** as the only hard win; bonuses align with [FDG secondary-objective findings](https://grail.cs.washington.edu/projects/game-abtesting/fdg2011/) (support primary goal).

### O-01 — Glass witness

| Field | Detail |
|-------|--------|
| **Player pitch** | “Clean run: never touch the decoy.” |
| **Rules** | If `glass_floor` active and decoy exists: bonus if **no flip** ever resolved a decoy mismatch (or stricter: decoy tiles never **matched**). Tie to existing decoy `pairKey` / mismatch path in `game.ts`. |
| **Reward** | +score or +combo shard progress (tune vs forgiveness). |
| **Code** | Track `decoyTouchedThisFloor: boolean` on `RunState` or in stats; clear on advance. Set on decoy-related resolution. Extend `LevelResult` with `bonusTags: string[]`. |
| **UI** | End floor: “Glass witness ✓” / “Glass witness ✗”. |

### O-02 — Cursed last

| Field | Detail |
|-------|--------|
| **Rules** | At gen, mark one real `pairKey` as **cursed**. Matching it before **all other** pairs are cleared → no bonus (floor still wins). Match it **last** → bonus. |
| **Code** | `BoardState` or run: `cursedPairKey: string | null`. Match resolution order check in `game.ts`. |
| **UI** | Memorize-phase only icon on both tiles; optional codex entry. |
| **A11y** | Not color-only marker (shape + tooltip). |

### O-03 — Flip par

| Field | Detail |
|-------|--------|
| **Rules** | Bonus if **successful match flips** (or total opens) ≤ `ceil(pairs * K) + B`. Define whether **peek** and **gambit third flip** count (recommend: peek no, committed flips yes). |
| **Code** | Counters on `RunState.stats` or parallel `floorObjectiveState`. |

### O-04 — Scholar style bonus (opt-in)

| Field | Detail |
|-------|--------|
| **Rules** | If floor cleared with **no shuffle and no destroy** (even when allowed) → score multiplier or shard. Overlaps `powersUsedThisRun` / achievement logic — separate **per-floor** flag. |
| **Code** | Track `shuffleUsedThisFloor`, `destroyUsedThisFloor`; already partially inferable from stats — add explicit booleans for clarity. |

---

## H — Helpers (Recall / Search / Damage)

### H-01 — Region shuffle

| Field | Detail |
|-------|--------|
| **Tier** | Search. |
| **Rules** | One charge: permute only tiles in **row R** (or column C). R = user-selected after arm, or default = row of **last flipped** hidden tile. Same eligibility as shuffle (2+ hidden pairs global? or 2+ in row — decide). |
| **Code** | `applyShuffle` fork or `applyRegionShuffle(run, rowIndex)` in `game.ts`; respect `activeContract.noShuffle`. |
| **UI** | Arm mode highlights row; confirm button. |

### H-02 — Flash pair (Recall)

| Field | Detail |
|-------|--------|
| **Rules** | Spend charge: pick **random unmatched** pair (seeded), show both faces **T ms**, then hide. Does not count as committed flip. |
| **Code** | New charges on `RunState`; renderer uses same peek-ish path as `peekRevealedTileIds` or new ephemeral list. |
| **Modes** | Optional **practice / wild only** first for fairness. |

### H-03 — Destroy ↔ parasite feedback

| Field | Detail |
|-------|--------|
| **Rules** | When `score_parasite` active, using **destroy** either **resets `parasiteFloors` to 0** (save) or **adds +2** (gamble) — pick one and document. |
| **Code** | `applyDestroyPair` + `advanceToNextLevel` parasite block (~1237–1241). |
| **UI** | Toast: “Parasite clock reset” / “Parasite fed +2”. |

---

## R — Relics & contracts

Respect [RELIC_ROSTER.md](../RELIC_ROSTER.md) / forgiveness non-overlap.

### R-01 — `short_memorize` specialist relic

| Field | Detail |
|-------|--------|
| **Id** | e.g. `memorize_buffer_under_pressure` (new `RelicId`). |
| **Rules** | If `hasMutator(run, 'short_memorize')`, `getMemorizeDurationForRun` adds **+X ms** (clamp ≥ `MEMORIZE_MIN_MS`). Else **+0** or tiny unrelated perk. |
| **Code** | `contracts.ts`, `relics.ts` (`applyRelicImmediate` if needed), `getMemorizeDurationForRun` (`game.ts`). |

### R-02 — Parasite ward (one-shot)

| Field | Detail |
|-------|--------|
| **Rules** | Once per run: ignore **one** parasite life loss (decrement ward, no life tick). No effect without `score_parasite`. |
| **Code** | `RunState.parasiteWardRemaining: number`; hook in `advanceToNextLevel` parasite branch. |

### R-03 — Row shuffler relic

| Field | Detail |
|-------|--------|
| **Rules** | First **region shuffle** (H-01) each floor is free, or `rows_only` shuffle is stronger — pairs with Search tier. |
| **Code** | Depends on H-01; relic check in shuffle apply path. |

### C-01 — Contract: Pin vow

| Field | Detail |
|-------|--------|
| **Rules** | `activeContract.maxPinsTotalRun: number` or `maxPinsPerFloor: 1`; higher score multiplier. |
| **Code** | Extend `ContractFlags` in `contracts.ts`; enforce in pin action in `game.ts` + UI disable. |

---

## M — Mode tweaks

### M-01 — Daily mutator variety

| Field | Detail |
|-------|--------|
| **Rules** | Expand `DAILY_MUTATOR_TABLE` to include `silhouette_twist`, `n_back_anchor`, etc., or rotate **weekly** with date key. |
| **Code** | `mutators.ts`, `deriveDailyMutatorIndex` (`rng.ts`). |

### M-02 — Wild run mutator pack

| Field | Detail |
|-------|--------|
| **Rules** | `createWildRun` passes `activeMutators: ['sticky_fingers', 'short_memorize']` (example) so Wild is **rules chaos** + existing wild joker. |
| **Code** | `createWildRun` in `game.ts`. |

### M-03 — Meditation + single mutator pick

| Field | Detail |
|-------|--------|
| **Rules** | After `createMeditationRun`, menu offers “focus mutator” for the session (one id). |
| **Code** | Store + `CreateRunOptions.activeMutators`. |

---

## FN — Findables (tile-bound pickups)

Full spec: [`FINDABLES.md`](../FINDABLES.md). Tasks: [`gameplay-tasks/GP-FINDABLES.md`](../gameplay-tasks/GP-FINDABLES.md) (`GP-FIN01`–`GP-FIN06`).

### FN-01 — Findables v1 (mutator-gated)

| Field | Detail |
|-------|--------|
| **Player pitch** | “Some pairs hide a **bonus pickup** — match them to claim it.” |
| **Rules** | Optional **0–2** findable **pairs** per floor when mutator `findables_floor` (id TBD) is active; **claim on match**; **destroy forfeits** (v1); shuffle moves findables with tiles; **never** on decoy. |
| **Code** | `Tile.findableKind?`; spawn in `buildBoard` / `createTiles`; claim in match resolution; `RunState.findablesClaimedThisFloor`; reset on `advanceToNextLevel`. |
| **Reward** | v1: flat score **or** shard step — single choice in constants (see FINDABLES.md). |
| **UI** | Memorize + play marker (non–color-only); optional HUD count; codex line. |
| **Risks** | Cognitive load + `silhouette_twist` / `short_memorize` — keep count low; gate off by default. |
| **Tests** | Deterministic spawn; claim; destroy forfeit; shuffle preservation. |
| **`GAME_RULES_VERSION`** | Bump when generation/scoring ships. |

---

## RP — Research promotions (from RESEARCH_LOG)

Sprint-sourced items from [research/RESEARCH_LOG.md](../research/RESEARCH_LOG.md). **Design / QA**, not yet `GP-*` tasks unless you open a gameplay-task file.

### RP-01 — Mutator / relic playtest protocol

| Field | Detail |
|-------|--------|
| **Purpose** | Make “readable failure” and power-job separation measurable before shipping new mutators/relics. |
| **Protocol** | For each candidate: (1) **time-to-first-match** (median over N runs), (2) **mistake rate after first life loss**, (3) **debrief prompt** — “When do you use shuffle vs row shuffle vs destroy vs peek?” |
| **Fit** | [02-helper-tiers-and-cognitive-jobs.md](./02-helper-tiers-and-cognitive-jobs.md) — verifies helpers do not collapse into one button. |
| **Code** | None required initially; spreadsheet or telemetry events optional (`trackEvent` hooks in renderer). |

### RP-02 — Symbol-band / distractor-similarity pass

| Field | Detail |
|-------|--------|
| **Purpose** | Apply cognitive research: within-level **target–distractor similarity** drives difficulty and perceived fairness. |
| **Action** | Per symbol band used by `getSymbolSetForLevel` / tile catalog, audit **within-band** glyph similarity (shape, silhouette, label confusability); prefer **icon + label** separation per [GAME_MECHANICS_IDEAS.md](../GAME_MECHANICS_IDEAS.md). |
| **Fit** | Presentation + content pipeline; aligns with **atomic pairs** and mutators like `silhouette_twist` / `category_letters`. |
| **Code** | Optional: lint or checklist in [ASSET_SOURCES.md](../../src/renderer/assets/ASSET_SOURCES.md) / art QA doc. |

---

## Suggested implementation order

1. **O-01 / O-04** — Mostly local state + scoring; teaches players bonuses without changing mutator schedule.
2. **F-01 + F-02** — Largest impact on boredom; needs rules version + tests + export story.
3. **H-03** — Cheap narrative win tying destroy to parasite.
4. **R-01 / R-02** — Narrow relics with clear mutator gates.
5. **H-01 + R-03** — More UI work (row pick).

---

## Traceability to theory docs

| Backlog id | Ties to |
|------------|---------|
| F-*, M-* | [01-floor-identity-and-archetypes.md](./01-floor-identity-and-archetypes.md) |
| H-* | [02-helper-tiers-and-cognitive-jobs.md](./02-helper-tiers-and-cognitive-jobs.md) |
| R-*, C-* | [03-mutators-as-spine-relics-as-build.md](./03-mutators-as-spine-relics-as-build.md) |
| O-* | [04-secondary-objectives.md](./04-secondary-objectives.md) |
| FN-* | [FINDABLES.md](../FINDABLES.md) |

## Traceability to gameplay tasks

| Backlog id | Task ID | Task file |
|------------|---------|-----------|
| F-01, F-02, F-03 | GP-F01, GP-F02, GP-F03 | [`gameplay-tasks/GP-FLOOR-SCHEDULE.md`](../gameplay-tasks/GP-FLOOR-SCHEDULE.md) |
| O-01–O-04 | GP-O01–GP-O04 | [`gameplay-tasks/GP-SECONDARY-OBJECTIVES.md`](../gameplay-tasks/GP-SECONDARY-OBJECTIVES.md) |
| H-01–H-03 | GP-H01–GP-H03 | [`gameplay-tasks/GP-HELPERS.md`](../gameplay-tasks/GP-HELPERS.md) |
| R-01–R-03, C-01 | GP-R01–GP-R03, GP-C01 | [`gameplay-tasks/GP-RELICS-CONTRACTS.md`](../gameplay-tasks/GP-RELICS-CONTRACTS.md) |
| M-01–M-03 | GP-M01–GP-M03 | [`gameplay-tasks/GP-MODES.md`](../gameplay-tasks/GP-MODES.md) |
| RP-01, RP-02 | (open GP / QA when scheduled) | [research/RESEARCH_LOG.md](../research/RESEARCH_LOG.md) |
| FN-01 | GP-FIN01–GP-FIN06 | [`gameplay-tasks/GP-FINDABLES.md`](../gameplay-tasks/GP-FINDABLES.md) |

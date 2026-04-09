# Gameplay systems analysis

**Generated:** 2026-04-09  
**Method:** Delegated codebase exploration (shared core, renderer, docs/entry) plus spot-checks in `game.ts`, `useAppStore.ts`, and `floor-mutator-schedule.ts`.

This document maps **what exists today**, **how pieces connect**, and **where gameplay is incomplete or split between “rules” and “presentation.”** It is meant to support a **fully refined** mechanical design—not to replace `GAME_MECHANICS_IDEAS.md` (backlog) or `MUTATORS.md` (mutator checklist).

---

## 1. Executive summary

The project has a **strong shared rules layer** (`src/shared/game.ts` + `contracts.ts`): memory phase, pair matching, scoring, lives, many powers (shuffle, destroy, peek, undo, pins, stray remove, gambit, wild/decoy paths, etc.), contracts, relic-adjacent hooks, and extensive unit tests.

The **desktop renderer** (`GameScreen`, `TileBoard`, Zustand `useAppStore`) is **correctly wired** to that layer for turns: tile presses and toolbar actions call pure `game.ts` functions and update `run` in the store. **Electron IPC does not drive turns**; it handles settings, save/load, achievements, display, Steam—appropriate for a local rules engine.

**Gaps for “one coherent game feel”** are mostly:

- Some **mutators** exist in types, daily/endless **schedules**, and **HUD/presentation**, but **do not change rule outcomes** in `game.ts` (e.g. `wide_recall`, `silhouette_twist`, `distraction_channel` are largely visual or cosmetic).
- **Documentation vs README**: README undersells **mode surface** (gauntlet, puzzle, practice, meditation, daily, endless, contracts, etc.).
- **Presentation gaps**: e.g. focus-assist dimming for **2D fallback only**, not 3D scene.
- **`RunState.distractionTick`** and similar fields may exist in contracts while **game logic** does not advance them (HUD uses local React state instead).

---

## 2. Architecture (who owns what)

| Layer | Responsibility | Gameplay role |
|--------|----------------|----------------|
| **`src/shared/game.ts`** | Pure `RunState` transitions | Source of truth for matches, scoring, level advance, game over (rules). |
| **`src/shared/contracts.ts`** | Types, settings shapes | Declares mutator IDs, modes, fields—some fields are **ahead of** full rule use. |
| **`src/shared/mutators.ts`** | Catalog copy, `hasMutator`, daily table | **Metadata**; behavior lives in `game.ts` branches + renderer. |
| **`src/shared/floor-mutator-schedule.ts`** | Endless per-floor mutator rotation | Injects mutator **lists**; effect still requires `game.ts` / UI implementation. |
| **`src/renderer/store/useAppStore.ts`** | `run`, timers, `pressTile`, powers | **Orchestration**: calls `game.ts`, schedules memorize/resolve timers, applies `gameOver` / `levelComplete` via `applyResolvedRun`. |
| **`GameScreen` / `TileBoard`** | Input, layout, 3D/DOM, mutator **presentation** | Not authoritative for rules; must stay in sync with `game.ts`. |
| **Electron main/preload** | IPC | **No** live board protocol; persistence and shell only. |

---

## 3. Core loop (shared rules)

**Phases:** `memorize` → `playing` → (optional) `resolving` → back to `playing`, or `levelComplete` / `gameOver` / `paused`.

**Typical flow:**

1. Run starts in **`memorize`** with `timerState.memorizeRemainingMs` (duration can depend on level, mutators such as `short_memorize`, relic-related helpers).
2. **`finishMemorizePhase`** moves to **`playing`**.
3. **`flipTile`** updates `flippedTileIds`, respects special cases (e.g. `sticky_fingers`, gambit allowing a third flip, clearing flash-pair reveal state).
4. Two (or three with gambit) flipped tiles → **`resolving`** with optional delay (`resolveRemainingMs`).
5. **`resolveBoardTurn`** applies match/mismatch, life changes, contract caps, spotlight rotation, findables, etc., then returns to **`playing`** or terminal states.
6. Board cleared → **`finalizeLevel`** → **`levelComplete`**; **`advanceToNextLevel`** rebuilds board and can apply **endless floor schedule** mutators.

**Win / lose (rules):**

- **Floor clear:** all tiles `matched` or `removed`.
- **Lose:** `lives` to 0 (mismatches, parasite drain on advance, etc.), or contract `maxMismatches` forcing loss.

**Gauntlet time limit:** `isGauntletExpired` in `game.ts` is used by the store: on **`pressTile`**, if expired, the run is set to **`gameOver`** with `lives: 0`. So **timeout is enforced when the player tries to act**, not by a background timer tick inside `game.ts` alone—worth noting for UX (idle player might not see immediate game over).

---

## 4. Modes and run creation

Runs are constructed in **`game.ts`** via factories such as `createNewRun`, `createDailyRun`, `createGauntletRun`, `createPuzzleRun`, `createMeditationRun`, etc., then often **`patchRunFromUserSettings`**.

**Endless (`floor-mutator-schedule.ts`):** deterministic cycle of mutators + `floorTag` (`normal`, `breather`, `boss`), with a seeded chance to append **`distraction_channel`** on some boss floors.

**README** describes a narrow “arcade” scope; **code** exposes a **wider set of modes** in the app/store. Treat README as high-level positioning, not an exhaustive feature list.

---

## 5. Powers and meta-actions (store + UI)

Wired through **`useAppStore`** and **`GameScreen`** / toolbar:

- **Tiles:** normal flip, pin mode (`togglePinnedTile`), stray remove, peek, destroy pair (with resolve/terminal handling).
- **Shuffle:** full board (`applyShuffle`) and row/region (`applyRegionShuffle`), often coordinated with **`TileBoard`** shuffle animation callback.
- **Resolving:** undo flip (`cancelResolvingWithUndo`), timers for resolve delay.
- **Pause, level complete continue, relic pick modals, abandon run**, etc.

**Encore scoring:** `resolveBoardTurn` can take **`encorePairKeys`** from save meta (`saveData.playerStats?.encorePairKeysLastRun`); the list is **external** to the pure board, not computed inside `game.ts`.

---

## 6. Mutators: implementation matrix

| Mutator ID | Scheduled (daily / endless) | **Rules in `game.ts`** | **Renderer / presentation** |
|------------|-----------------------------|-------------------------|-------------------------------|
| `short_memorize` | Daily table | Yes (duration / synergies) | HUD labels |
| `glass_floor` | Cycle | Yes (decoy tile) | Board shows decoy behavior via state |
| `category_letters` | Cycle | Yes (symbol set) | Faces show letters |
| `sticky_fingers` | Cycle | Yes (first-flip block) | UX feedback |
| `findables_floor` | Catalog / modes | Yes (placement, scoring) | Faces / labels |
| `shifting_spotlight` | Catalog / modes | Yes (ward/bounty rotation) | Tests + logic |
| `score_parasite` | Cycle | Yes (life drain on advance) | Run stats |
| `n_back_anchor` | Cycle | Yes (`nBackAnchorPairKey` updates) | Optional HUD |
| `wide_recall` | Endless cycle | **No dedicated rule branch** | **CSS:** de-emphasizes symbol when flipped (`wideRecallInPlay`)—presentation-only |
| `silhouette_twist` | Endless cycle | **No dedicated rule branch** | **CSS class** on faces during play (`silhouetteFace`) |
| `distraction_channel` | Sometimes appended on boss floors | **`distractionTick` in state not driven by core** | **Local React HUD** in `GameScreen` (numeric overlay when setting enabled) |

**Takeaway:** Endless mode **schedules** `wide_recall`, `silhouette_twist`, and `distraction_channel`, but **fairness and difficulty** for those floors are currently **mostly visual** unless you add explicit rule hooks (e.g. scoring modifiers, timing pressure tied to `RunState`, or layout changes in `buildBoard`).

**`mutators.ts`:** `DAILY_MUTATOR_TABLE` is a **subset** of all shipped mutator IDs; other mutators appear in endless schedule or other run factories.

**Doc nuance:** `MUTATORS.md` and `MUTATOR_CATALOG` descriptions for `wide_recall` may emphasize different readings (e.g. label-first vs wider grid); **actual behavior** today is **not** a wider grid from `game.ts`—it is the **flipped-tile symbol styling** path in `TileBoard`.

---

## 7. Renderer wiring (connection health)

**Healthy connections:**

- **`pressTile`** gates on `view === 'playing'` and `run.status === 'playing'`, gauntlet expiry, then delegates to the correct `game.ts` API.
- **Terminal states** funnel through **`applyResolvedRun`** (achievements, save, flow to level complete / game over).
- **3D path:** R3F `Canvas` + `TileBoardScene` + `tileTextures` (programmatic faces for digit motifs, canvas overlays).
- **2D fallback:** DOM grid buttons; same store actions.

**Known disconnects / polish debt:**

- **`dimmedTileIds` / focus assist:** applied in **fallback** path only; **WebGL scene** does not receive the same dimming (comment in code acknowledges this).
- **`cameraViewportMode`:** reported as effectively always on in `GameScreen` for the mobile-style shell—verify product intent vs breakpoints.
- **Distraction:** overlay is **not** synchronized with `run.distractionTick` from shared state—local UI tick only.

---

## 8. Symbol catalog and relics

- **`tile-symbol-catalog.ts`:** `getSymbolSetForLevel` / index helpers may **not** yet implement full per-level band rotation despite `TILE_SYMBOL_SETS` data—worth confirming when balancing difficulty curve.
- **Some relic hooks** are partial: e.g. immediate apply no-ops where the real effect is folded into **`getMemorizeDurationForRun`** or floor flags—**not wrong**, but easy to misread as “missing.”

---

## 9. Persistence, Steam, tests

- **Save** normalizes and stores progress/settings; **game rules** do not require network.
- **Tests:** `game.test.ts` is broad (memorize, resolve, scoring, shuffle, pins, destroy, findables, spotlight, advance, etc.). Gaps called out in review: explicit tests for some combinations (e.g. full **gambit three-flip** flow, every **contract** variant, **gauntlet** timeout edge cases) may be thinner—**triage against your release bar**.
- **`mutators.ts`** has no dedicated test file; behavior is expected **via `game.test.ts`** and integration/e2e.

---

## 10. Recommendations toward “fully refined gameplay”

1. **Mutator contract:** For each `MutatorId`, document **one sentence**: “Changes rules / Changes presentation only / Scheduled but TODO.” Keep `MUTATORS.md` and catalog text aligned with **actual** `game.ts` + renderer behavior.
2. **Complete or demote:** Either implement **rule-level** effects for `wide_recall`, `silhouette_twist`, and `distraction_channel` (scoring, timing, board generation), or **stop scheduling** them in endless until they are real—avoids players thinking mutators do more than they do.
3. **Gauntlet UX:** If time runs out, consider a **visible timer + auto gameOver** (interval or rAF) so loss does not depend on the next tile press.
4. **3D parity:** Port focus-assist dimming (or equivalent) into `TileBoardScene` if that assist is part of the design.
5. **Single source for distraction:** If `RunState.distractionTick` matters, drive it from **`game.ts`** or drop it from contracts to avoid phantom state.
6. **README refresh:** List real modes and point to this analysis + `MUTATORS.md` for depth.

---

## 11. Key file index

| Area | Files |
|------|--------|
| Rules engine | `src/shared/game.ts`, `src/shared/contracts.ts` |
| Mutators metadata | `src/shared/mutators.ts`, `src/shared/floor-mutator-schedule.ts` |
| Store / turns | `src/renderer/store/useAppStore.ts` |
| Play UI | `src/renderer/components/GameScreen.tsx`, `TileBoard.tsx`, `TileBoardScene.tsx` |
| Visuals | `tileTextures.ts`, `programmaticCardFace.ts`, `TileBoard.module.css` |
| Design docs | `docs/GAME_MECHANICS_IDEAS.md`, `docs/MUTATORS.md` |
| Tests | `src/shared/game.test.ts`, `src/renderer/store/useAppStore.test.ts`, `e2e/` |

---

*End of analysis.*

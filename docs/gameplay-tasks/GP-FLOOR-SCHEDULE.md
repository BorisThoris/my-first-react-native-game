# Gameplay tasks: floor schedule & identity

Source: [F-01, F-02, F-03](../gameplay-depth/05-app-specific-idea-backlog.md#f--floor-identity--pacing)

---

## GP-F01 — Per-floor mutator schedule (endless)

### Status
**Done** (2026-04-19 audit) — [`pickFloorScheduleEntry`](../../src/shared/floor-mutator-schedule.ts), [`advanceToNextLevel`](../../src/shared/game.ts); rollup: [GP_AUDIT_ROLLUP.md](./GP_AUDIT_ROLLUP.md).

### Priority
High

### Objective
Change `activeMutators` when advancing floors so endless runs are not stuck with `[]` (or a single static list) for the whole run. Selection must be **deterministic** from `runSeed` + `level` + `gameMode`.

### Spec reference
Backlog **F-01**.

### Affected areas (expected)
- `src/shared/game.ts` — `advanceToNextLevel` (before `buildBoard`; update `run.activeMutators` or parallel field if you keep “run baseline” vs “floor overlay”).
- New: `src/shared/floor-mutator-schedule.ts` (or similar) — pure `pickMutatorsForFloor(...)`.
- `src/shared/run-export.ts` / import — if old exports assume constant mutators across levels.
- `src/renderer/components/GameScreen.tsx` — pre-memorize “floor theme” line.
- `src/shared/game.test.ts` — determinism + contract interaction.

### Acceptance criteria
- Same `runSeed` + `rulesVersion` + `level` + mode yields identical `MutatorId[]`.
- Scholar / contract runs still respect `noShuffle` / `noDestroy` (no softlock).
- Daily and puzzle modes either opt **out** of floor schedule or use an explicit policy documented in this task.
- `GAME_RULES_VERSION` bumped if import/replay semantics change; document migration in task footer when done.

### Dependencies
None (foundational).

### Out of scope
Art for boss floors (see GP-F03); full HUD redesign.

---

## GP-F02 — Breather floors in schedule

### Status
**Done** — breather rows in [`ENDLESS_FLOOR_CYCLE`](../../src/shared/floor-mutator-schedule.ts); tests [`floor-mutator-schedule.test.ts`](../../src/shared/floor-mutator-schedule.test.ts).

### Priority
Medium

### Objective
Encode **low-intensity** floors in the same schedule as GP-F01 (e.g. `[]` or one mild mutator after spikes).

### Spec reference
Backlog **F-02**.

### Affected areas
- Same module as GP-F01.
- Unit tests: forbidden combos on breather rows (e.g. no `short_memorize` + `silhouette_twist` if policy says so).

### Acceptance criteria
- Schedule data marks breather floors; tests enforce policy table.
- Playtest doc note: breather cadence (e.g. every 4th floor) is data-driven one constant.

### Dependencies
**GP-F01** (same schedule pipeline).

### Out of scope
Automatic difficulty detection from player skill.

---

## GP-F03 — Boss floor tag

### Status
**Done** — [`FloorTag`](../../src/shared/contracts.ts) on board; boss score branch + pills [`GameplayHudBar.tsx`](../../src/renderer/components/GameplayHudBar.tsx).

### Priority
Low

### Objective
Mark selected floors as **boss** for HUD flair and/or score / meta reward.

### Spec reference
Backlog **F-03**.

### Affected areas
- `src/shared/contracts.ts` — `BoardState` or `LevelResult` / generation flags: `floorTag: 'normal' | 'breather' | 'boss'`.
- `floor-mutator-schedule` (or builder) — attach tag alongside mutator list.
- `GameScreen.tsx` — badge / copy.
- Scoring path in `game.ts` if boss multiplier.

### Acceptance criteria
- Tag survives from board gen through level clear UI.
- Boss reward (if any) documented and covered by a unit test.

### Dependencies
**GP-F01** (schedule); optionally **GP-F02** for breather tag symmetry.

### Out of scope
New boss art pipeline; narrative writing.

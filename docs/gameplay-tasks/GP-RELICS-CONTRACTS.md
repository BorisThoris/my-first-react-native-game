# Gameplay tasks: relics & contracts

Source: [R-01–R-03, C-01](../gameplay-depth/05-app-specific-idea-backlog.md#r--relics--contracts)

Must stay consistent with [`RELIC_ROSTER.md`](../RELIC_ROSTER.md) and [`GAME_FORGIVENESS_DEEP_DIVE.md`](../GAME_FORGIVENESS_DEEP_DIVE.md) (no double-forgiveness).

---

## GP-R01 — Relic: memorize buffer under `short_memorize`

### Status
Backlog

### Priority
Medium

### Objective
New `RelicId`: extra memorize time **only** when `short_memorize` mutator is active (else no effect or minimal agreed perk).

### Spec reference
Backlog **R-01**.

### Affected areas
- `src/shared/contracts.ts` — extend `RelicId`.
- `src/shared/relics.ts` — offer pool, `applyRelicImmediate`, draft filtering if needed.
- `src/shared/game.ts` — `getMemorizeDurationForRun`; clamp ≥ `MEMORIZE_MIN_MS`.
- `docs/RELIC_ROSTER.md`, `RELIC_SYNERGY_PLAYTEST.md`.
- `GameScreen.tsx` — relic label map.

### Acceptance criteria
- With `short_memorize` + relic, memorize ms never below minimum constant.
- Without mutator, behavior matches spec (documented).

### Dependencies
None.

### Out of scope
Global memorize relic duplicate of `memorize_bonus_ms` without mutator gate.

---

## GP-R02 — Relic: parasite ward (one-shot)

### Status
Backlog

### Priority
Medium

### Objective
Once per run, ignore **one** parasite-triggered life loss. No effect if `score_parasite` not active.

### Spec reference
Backlog **R-02**.

### Affected areas
- `src/shared/contracts.ts` — `RelicId` + `RunState.parasiteWardRemaining` (or similar).
- `src/shared/game.ts` — parasite branch in `advanceToNextLevel`.
- `relics.ts` — pick + immediate apply.
- Forgiveness audit: must not stack with other “free life” sources confusingly.

### Acceptance criteria
- Ward decrements exactly once per proc; `MAX_LIVES` respected.
- Test matrix row in `RELIC_SYNERGY_PLAYTEST.md`.

### Dependencies
None.

### Out of scope
Multi-charge parasite ward.

---

## GP-R03 — Relic: row shuffle synergy

### Status
Backlog

### Priority
Low

### Objective
First region shuffle per floor free, or buff to `rows_only` shuffle — **depends on GP-H01**.

### Spec reference
Backlog **R-03**.

### Affected areas
- `relics.ts`, `game.ts` shuffle paths.
- Relic roster doc.

### Acceptance criteria
- Interacts correctly with `first_shuffle_free_per_floor` and `noShuffle` contract (order of checks documented).

### Dependencies
**GP-H01**.

### Out of scope
Implementing H01 inside this task.

---

## GP-C01 — Contract: pin vow

### Status
Backlog

### Priority
Low

### Objective
Extend `ContractFlags` with pin limits (per floor or per run) in exchange for score multiplier or other agreed reward.

### Spec reference
Backlog **C-01**.

### Affected areas
- `src/shared/contracts.ts` — `ContractFlags`.
- `src/shared/game.ts` — pin action guards + scoring.
- Menu / mode that creates contract runs (`useAppStore.ts` or mode select).
- `GameScreen.tsx` — disabled pin UX.

### Acceptance criteria
- Cannot exceed cap; clear error/disable reason.
- Run export includes new contract fields if surfaced to players.

### Dependencies
Product decision: which mode offers pin vow (scholar variant vs new entry).

### Out of scope
New menu art.

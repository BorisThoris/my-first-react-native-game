# Game Forgiveness Deep Dive

## Objective
Make the run curve more forgiving around mid-game (around level 5+) without removing skill expression, streak value, or late-game challenge.

This document is focused on:
- survival tuning (lives and mistake economy),
- cognitive-load pacing (memorize windows and board growth),
- and clear rollout/testing steps.

---

## Current State (What the code does today)

### Core progression
- Pair count grows linearly with level: `pairCount = min(level + 1, 26)`.
- Memorize time shrinks linearly:
  - `MEMORIZE_BASE_MS = 1200`
  - `MEMORIZE_STEP_MS = 60`
  - `MEMORIZE_MIN_MS = 450`
  - So by level 14+, memorize time is fixed at 450ms.

### Life and fail pressure
- Run starts with `INITIAL_LIVES = 4`.
- `MAX_LIVES = 5`.
- Every mismatch costs exactly 1 life.
- Game ends immediately at 0 lives.

### Existing forgiveness systems
- Perfect level clear grants `+1` life (capped by `MAX_LIVES`).
- Streaks increase score (`calculateMatchScore`) but do not protect lives.
- Matches now resolve instantly (good for pacing), but mismatch penalties are still hard.

### Why players still feel “set to fail” around level 5
Even though perfect clear +1 life and streak scoring exist:
- Perfect clears become rare as board size grows, so life recovery becomes unreliable for average players.
- Mistake penalty is binary and constant (always -1 life), regardless of level context.
- The memorize curve keeps compressing while board complexity rises each level.

Net result: skill gaps are paid mostly through lives, with limited comeback paths.

---

## Difficulty Cliff Analysis

### Board + memorize pressure by level

| Level | Pairs | Tiles | Memorize (ms) |
|---|---:|---:|---:|
| 1 | 2 | 4 | 1200 |
| 2 | 3 | 6 | 1140 |
| 3 | 4 | 8 | 1080 |
| 4 | 5 | 10 | 1020 |
| 5 | 6 | 12 | 960 |
| 6 | 7 | 14 | 900 |
| 7 | 8 | 16 | 840 |
| 8 | 9 | 18 | 780 |
| 9 | 10 | 20 | 720 |
| 10 | 11 | 22 | 660 |

The player hits two simultaneous ramps:
- more unique locations to encode,
- less time to encode them.

With a flat mismatch life penalty, a short run of errors can end a run quickly even when the player is otherwise progressing.

---

## Design Principles for “Forgiving but Fair”

1. Mistakes should hurt, but not always kill momentum immediately.
2. Reward consistency, not only perfection.
3. Keep high-skill ceilings via score/streak optimization.
4. Prefer simple, transparent rules players can understand quickly.
5. Roll out in low-risk phases (constants first, then mechanics).

---

## Forgiveness Levers (Ranked)

### Lever A: Soften memorize compression (low risk, high value)
Adjust only constants:
- `MEMORIZE_BASE_MS: 1200 -> 1300`
- `MEMORIZE_STEP_MS: 60 -> 50`
- `MEMORIZE_MIN_MS: 450 -> 600`

Effect:
- More readable mid/late levels.
- Minimal systemic complexity.

Tradeoff:
- Slightly slower early pacing; can be offset by current instant match resolve.

---

### Lever B: Add a per-level mistake buffer (very high value, still simple)
Rule:
- First mismatch on each level does **not** cost a life.
- It still increments mistakes and breaks streak.

Implementation concept:
- Can be derived from existing per-level counter (`run.stats.tries` resets each floor), so no new save payload required.

Effect:
- Dramatically improves survivability while preserving tension.
- Players can make one read error per floor without immediate life collapse.

Tradeoff:
- Runs become longer; score inflation may need minor tuning later.

---

### Lever C: Reward clean clears, not only perfect clears (high value)
Rule:
- Keep perfect clear +1 life.
- Also grant +1 life on “clean clear” (`mistakes <= 1`), capped by max lives.

Effect:
- Life economy becomes recoverable for strong-but-not-perfect players.
- Encourages disciplined play without requiring flawless floors.

Tradeoff:
- Could over-buff survivability if combined with very high starting lives.

---

### Lever D: Increase life envelope slightly (medium value)
Option:
- `INITIAL_LIVES: 4 -> 5`
- `MAX_LIVES: 5 -> 6`

Effect:
- Immediate reduction in early run volatility.

Tradeoff:
- Blunt instrument; less elegant than structural forgiveness.

---

### Lever E: Make streaks provide survival utility (higher complexity)
Examples:
- Every N streak grants a one-time shield.
- Or mismatch at high streak consumes streak only (no life loss).

Effect:
- Strong positive feedback for skilled play.

Tradeoff:
- Needs extra state and clear UX messaging.
- Higher implementation/test complexity.

### Lever F: Convert consecutive-pair skill into delayed sustain (higher value than raw life spam)
Rule shape:
- Do **not** grant a full life on every pair.
- Do **not** grant a full life on every 2-pair streak directly.
- Instead:
  - `2 consecutive pairs => +1 guard`, or
  - `2 consecutive pairs => +1 heart shard`
  - `3 heart shards => +1 life`

Recommended variant:
- Prefer the heart-shard version over direct life gain.
- Let shard progress persist across floors so strong play can build momentum into bigger boards.
- Cap shard storage / guard storage to avoid infinite sustain.

Effect:
- Rewards smart reads early, before late-game thresholds.
- Gives better players a real path into larger boards.
- Avoids the runaway balance problem of "life per pair".

Tradeoff:
- Adds more state than simple rule tuning.
- Needs strong HUD and clear-modal communication.

---

## Recommended Tuning Bundle (v1)

### Target
Fix the level-5 fail cliff without making late-game trivial.

### v1 Changes (recommended)
1. Memorize curve softening:
   - `1300 / 50 / 600` (base/step/min).
2. First mismatch each floor is life-free.
3. Life recovery broadened:
   - +1 life for `mistakes <= 1` on clear (cap max).
4. Keep instant match resolve and current score formula initially.

Why this bundle:
- It creates recovery paths using existing systems.
- It preserves tension (2nd+ mistakes still cost life).
- It avoids introducing complicated new mechanics in phase 1.

---

## Alternative Presets

### Conservative preset
- Only adjust memorize constants.
- Keep life rules unchanged.

Good when:
- Team wants minimal behavior change and fastest ship.

Risk:
- Might not fully solve mid-game fail pressure.

### Aggressive preset
- v1 bundle + `INITIAL_LIVES=5`, `MAX_LIVES=6`.

Good when:
- Current retention is clearly too harsh.

Risk:
- Could flatten challenge too much for experienced players.

---

## Rollout Plan

### Phase 1 (quick win, no new game systems)
- Tune memorize constants.
- Add first-miss-per-level free life rule.
- Add clean-clear life restore.
- Update UI copy in level-clear modal and side hints.

### Phase 2 (if needed)
- Add streak-to-survival mechanic (shield/guard token).
- Prototype combo-based sustain:
  - `2 consecutive pairs => heart shard`
  - `3 heart shards => +1 life`
  - Alternative fallback: `2 consecutive pairs => +1 guard`
- Decide whether combo-derived progress persists across floors.
- Add clearer HUD signaling for forgiveness mechanics.

### Phase 3 (optional personalization)
- Difficulty profile toggle:
  - `Standard` (today-ish),
  - `Forgiving` (v1+),
  - `Hardcore` (current strict rules).

---

## Validation Strategy

### Quantitative targets
- Increase share of runs reaching level 6 by ~20-35%.
- Keep high-skill progression meaningful (top percentile depth should not explode).
- Maintain mistake-to-fail tension (not effectively infinite runs).

### Test cases to add
- First mismatch on a floor does not reduce life.
- Second mismatch on same floor does.
- `mistakes <= 1` on clear grants life (capped).
- Perfect clear still grants life.
- Level transition resets per-floor mismatch buffer.
- If combo sustain ships:
  - `2 consecutive pairs` grants the expected shard/guard reward.
  - Broken streak resets combo progress correctly.
  - Shard-to-life conversion respects max-life cap.
  - Cross-floor persistence rules behave exactly as designed.

### UX checks
- Player can understand life changes from overlay copy alone.
- No confusion between score streak and life protection rules.

---

## Suggested Copy Updates (small but important)

- Level clear modal:
  - “Clean floor bonus: +1 Life” (or “Perfect floor bonus: +1 Life”).
- Side panel:
  - “First mistake each floor is forgiven. Further mistakes cost lives.”
- Optional HUD hint when first mistake occurs:
  - “Grace used for this floor.”

These reduce the “it feels impossible” perception by making safety systems visible.

---

## Implementation Notes (Where to change)

- Constants and progression:
  - `src/shared/contracts.ts`
  - `src/shared/game.ts`
- Rule logic (mismatch/life + clear rewards):
  - `src/shared/game.ts`
- If combo sustain is added:
  - extend `RunState` / `SessionStats` in `src/shared/contracts.ts`
  - implement reward accumulation + conversion in `src/shared/game.ts`
- Regression tests:
  - `src/shared/game.test.ts`
  - `src/renderer/store/useAppStore.test.ts` (timer/flow safety)
- UX messaging:
  - `src/renderer/components/GameScreen.tsx`

---

## Final Recommendation

Ship **v1 bundle** first:
- softer memorize curve,
- first mismatch per floor is life-free,
- clean-clear life restore.

This is the highest impact-to-complexity path to make level 5+ feel fairer while keeping the game skill-based and tense.

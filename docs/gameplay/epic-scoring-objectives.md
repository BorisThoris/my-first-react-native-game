# Epic: Scoring, rating, and floor objectives

## Scope

Per-match score, streak multipliers, presentation mutator penalties, boss floors, and **bonus tags** on level clear (scholar style, glass witness, cursed last, flip par, etc.).

## Implementation status

| Mechanic | Status | Notes |
|----------|--------|--------|
| Base match score | **Shippable** | `calculateMatchScore(level, streak, multiplier)`; `matchScoreMultiplier` on run. |
| Presentation penalties | **Shippable** | `getPresentationMutatorMatchPenalty` — stacked flat penalty for wide recall, silhouette, distraction. |
| Shifting spotlight deltas | **Shippable** | `shiftingSpotlightMatchDelta` on successful matches. |
| Findable bonus | **Shippable** | `FINDABLE_MATCH_SCORE` on matching findable pair. |
| Encore / pair memory | **Functional** | Encore bonus from prior-run pair keys (`encorePairKeysLastRun`). |
| Floor clear | **Shippable** | `finalizeLevel` — level bonus, perfect bonus, boss multiplier on subtotal. |
| Objective bonuses | **Shippable** | Tags: `scholar_style` (no shuffle/destroy floor), `glass_witness`, `cursed_last`, `flip_par`, `boss_floor`. Surfaced on `LevelResult`. |
| Flip par | **Functional** | Limit tied to `matchResolutionsThisFloor` vs `flipParLimit(pairCount)` — “par” reads as efficient **pair clears**, not raw flip count; document for players. |
| Shuffle score tax | **Functional** | User setting interacts with `matchScoreMultiplier` decay on shuffles. |
| Rating letter | **Shippable** | `calculateRating(tries)` — coarse grades. |

## Rough edges

- **Flip par naming:** Players may confuse “flips” with “match resolutions”; tooltips/codex could clarify.
- **Presentation mutators:** Penalties apply even when visual mutators are stubbed — fair mechanically, confusing thematically.

## Primary code

- `src/shared/game.ts` — `calculateMatchScore`, `finalizeLevel`, `getPresentationMutatorMatchPenalty`, `shiftingSpotlightMatchDelta`, flip par helpers.
- `src/shared/contracts.ts` — `LevelResult`, `SessionStats`, `Rating`.

## Refinement

**Shippable** for scoring integrity and boss/objective stacking. **Functional** for communicating flip par and tax to players.

## Tasks (polish backlog)

Tracked in rollup: [GAMEPLAY_POLISH_AND_GAPS.md](./GAMEPLAY_POLISH_AND_GAPS.md) §1 (thematic), §7.

- [x] Codex/tooltips: clarify **flip par** vs raw flips vs **match resolutions** for players.
- [x] Player-facing copy for **shuffle/score tax** and for **presentation mutator penalties** when board visuals are still catching up ([epic-board-rendering-assists](./epic-board-rendering-assists.md)).

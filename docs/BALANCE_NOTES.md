# Balance notes (K2)

Post-relic / post-mutator tuning. Constants live in `src/shared/contracts.ts` unless noted.

## Recent intent

- **Memorize:** `MEMORIZE_BASE_MS` / steps tuned for mobile readability; mutator `short_memorize` stacks with relic memorize bonus — floor 1 should never feel instant-fail.  
- **Lives:** `INITIAL_LIVES` / `MAX_LIVES` — `score_parasite` drain must not kill from full health in a single floor transition without telegraph (floors advanced counter).  
- **Powers:** `INITIAL_SHUFFLE_CHARGES`, `MAX_DESTROY_PAIR_BANK` — relics that add charges should not trivialize **Scholar** contract runs; contract still hard-disables shuffle/destroy where set.  
- **Gauntlet:** 10-minute run ceiling is product-defined; if expiry feels harsh, add +30s per floor cleared (future).

## Process

After meaningful mutator/relic changes: run three scripted seeds (arcade, daily, scholar) to floor 6 and record score, lives, powers used. Adjust one constant at a time.

## Release playtest script (quick bar)

Use three fixed seeds or saves (e.g. classic/new run, daily of the day, Scholar from the main menu). For each: reach **floor 6** (or fail honestly), then jot **final score**, **lives remaining**, **shuffle / destroy charges used**, and **highest pain point** (memorize window, symbol band, mutator combo). Re-run after any change to `contracts.ts`, `game.ts` match/scoring paths, or presentation mutator penalties.

## Symbol band thresholds (`tile-symbol-catalog.ts`)

Current defaults (floor level = run floor):

| Band | Level range | Notes |
|------|-------------|--------|
| Numeric two-digit ranks | 1–`SYMBOL_BAND_LAST_LEVEL_NUMERIC` (8) | Dense, readable on small tiles. |
| Letter / digit hybrid | 9–`SYMBOL_BAND_LAST_LEVEL_LETTER` (16) | Step up in discrimination load before callsigns. |
| Callsign pairs | 17+ | Longer labels; keep bracket jumps playtested for “first callsign floor” feel. |

`category_letters` mutator still forces the letter hybrid set regardless of level. Changing the two `SYMBOL_BAND_*` constants requires updating [`tile-symbol-catalog.test.ts`](../src/shared/tile-symbol-catalog.test.ts) bracket expectations and bumping `GAME_RULES_VERSION` if pair generation semantics change.

## Presentation mutator match penalties (`game.ts`)

Flat per-match score subtractions from `getPresentationMutatorMatchPenalty` (stack additively when multiple are active):

| Mutator | Penalty per successful match |
|---------|------------------------------|
| `wide_recall` | 3 |
| `silhouette_twist` | 3 |
| `distraction_channel` | 2 |

These are defined next to `getPresentationMutatorMatchPenalty` in `game.ts` (not `contracts.ts`). Tuning them affects endless/daily runs that stack presentation mutators; keep `game.test.ts` presentation penalty test in sync when values change.

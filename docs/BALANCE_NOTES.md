# Balance notes (K2)

Post-relic / post-mutator tuning. Constants live in `src/shared/contracts.ts` unless noted.

## Recent intent

- **Rules v16 higher tension rebalance:** objective and boss rewards are larger, but missed objective streaks decay faster, first-mismatch grace narrows after floor 1, mistake recovery grants less memorize time, clean clears no longer award destroy charges, and shop / relic services cost more.

- **Memorize:** `MEMORIZE_BASE_MS` / steps tuned for mobile readability; mutator `short_memorize` stacks with relic memorize bonus — floor 1 should never feel instant-fail.  
- **Lives:** `INITIAL_LIVES` / `MAX_LIVES` — `score_parasite` drain must not kill from full health in a single floor transition without telegraph (floors advanced counter).  
- **Powers:** `INITIAL_SHUFFLE_CHARGES`; destroy charges are uncapped run-local pickups. Relics and shops that add charges should not trivialize **Scholar** contract runs; contract still hard-disables shuffle/destroy where set.  
- **Gauntlet:** Menu presets **5 / 10 / 15** minutes; default factory still **10m** when unspecified. Each cleared floor extends the deadline by **+30s**, rewarding pace without removing the timer fail state.
- **Routes:** Floor clears expose **Safe / Greed / Mystery** choices. Shared rules can now apply outcomes: Safe recovers life or guard, Greed pays gold/score for life risk, Mystery rolls deterministic local gold/shard/Favor rewards.
- **Wild joker metadata:** `RunState.wildTileId` is set to the wild tile’s `id` whenever the board includes `WILD_PAIR_KEY` (`getWildTileIdFromBoard` on run start and after each level advance). Matching logic is unchanged (`pairKey`-driven).

## Process

After meaningful mutator/relic changes: run three scripted seeds (arcade, daily, scholar) to floor 6 and record score, lives, powers used. Adjust one constant at a time.

## Automated sanity (REF-098 / schedule)

- `yarn sim:endless --floors=1000 --seed=42001` — CSV summary of `floorTag` and mutator counts over a long endless slice; use after edits to `floor-mutator-schedule.ts` or `FLOOR_SCHEDULE_RULES_VERSION`. Spot-check that `breather` / `boss` tags appear at expected cadence for the cycle.
- REG-086 lightweight balance snapshot lives in `src/shared/balance-simulation.ts`. It is offline-only and checks floor schedule, shop wallet pacing, findable target ranges, and relic draft rarity mix without server authority or competitive leaderboard data.

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

REG-047 readability guardrails now live in `tile-symbol-catalog.ts`: each band exposes a readability purpose, target difficulty, max label length, and confusable-token denylist. Current catalog tests assert labels stay within each band limit, symbols remain unique, and common distractors (`O`, `0`, `I`, `1`, `l`) do not appear together in a band.

## Relic roster (cross-check `src/shared/relics.ts` + `game.ts`)

Shipped pool ids: `extra_shuffle_charge`, `first_shuffle_free_per_floor`, `memorize_bonus_ms`, `destroy_bank_plus_one`, `combo_shard_plus_step`, `memorize_under_short_memorize`, `parasite_ward_once`, `region_shuffle_free_first`, `peek_charge_plus_one`, `stray_charge_plus_one`, `pin_cap_plus_one`, `guard_token_plus_one`, `shrine_echo`, `chapter_compass`, `wager_surety`, `parasite_ledger`.

Milestone offers: first at floor **3**, then every **3** floors (**3, 6, 9, 12, …**); max **12** milestone **visits** per run (`RELIC_FIRST_MILESTONE_FLOOR`, `RELIC_MILESTONE_STEP`, `MAX_RELIC_PICKS_PER_RUN` in `relics.ts`). **Puzzle** runs skip relic drafts. Each offer rolls **three** distinct relics using `RELIC_DRAFT` weights (common / uncommon / rare) with **tier scaling** so later drafts relatively favor higher rarities (`effectiveRelicDraftWeight`, `rollRelicOptions`, `weightedPick.ts`). **Pick budget** per visit stacks: `shrine_echo` relic (bank for next shrine), **Daily** mode (+1), **generous_shrine** mutator (+1), meta unlock **after 7 dailies** (`relicShrineExtraPickUnlocked` → `metaRelicDraftExtraPerMilestone`), Scholar contract (`bonusRelicDraftPick`) — see `computeRelicOfferPickBudget` in `game.ts`.

Scheduled Endless drafts guarantee one contextual option when an eligible relic answers the current/next chapter, active wager, or near-complete Favor bank; Daily / gauntlet / meditation use the base picker. Hard contract filters remove shuffle relics under `noShuffle` and `destroy_bank_plus_one` under `noDestroy`.

Memorize modifiers (see `getMemorizeDurationForRun` in `game.ts`): **`+280ms`** with `memorize_bonus_ms`; **`+220ms`** when `memorize_under_short_memorize` and `short_memorize` mutator are both active.

## Presentation mutator match penalties (`game.ts`)

Flat per-match score subtractions from `getPresentationMutatorMatchPenalty` (stack additively when multiple are active):

| Mutator | Penalty per successful match |
|---------|------------------------------|
| `wide_recall` | 5 |
| `silhouette_twist` | 5 |
| `distraction_channel` | 4 |

These are defined next to `getPresentationMutatorMatchPenalty` in `game.ts` (not `contracts.ts`). Tuning them affects endless/daily runs that stack presentation mutators; keep `game.test.ts` presentation penalty test in sync when values change.

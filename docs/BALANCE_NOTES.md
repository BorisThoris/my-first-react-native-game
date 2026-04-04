# Balance notes (K2)

Post-relic / post-mutator tuning. Constants live in `src/shared/contracts.ts` unless noted.

## Recent intent

- **Memorize:** `MEMORIZE_BASE_MS` / steps tuned for mobile readability; mutator `short_memorize` stacks with relic memorize bonus — floor 1 should never feel instant-fail.  
- **Lives:** `INITIAL_LIVES` / `MAX_LIVES` — `score_parasite` drain must not kill from full health in a single floor transition without telegraph (floors advanced counter).  
- **Powers:** `INITIAL_SHUFFLE_CHARGES`, `MAX_DESTROY_PAIR_BANK` — relics that add charges should not trivialize **Scholar** contract runs; contract still hard-disables shuffle/destroy where set.  
- **Gauntlet:** 10-minute run ceiling is product-defined; if expiry feels harsh, add +30s per floor cleared (future).

## Process

After meaningful mutator/relic changes: run three scripted seeds (arcade, daily, scholar) to floor 6 and record score, lives, powers used. Adjust one constant at a time.

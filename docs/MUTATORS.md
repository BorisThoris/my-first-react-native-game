# Mutator spec (D1)

Hooks in `src/shared/game.ts` consult `activeMutators` via `hasMutator` / `src/shared/mutators.ts`. **Rules version** `GAME_RULES_VERSION` in `contracts.ts` must bump when generation or mutator math changes.

## Hook matrix

| Phase | Mutators may affect |
|--------|---------------------|
| **Memorize** | `short_memorize`, `category_letters` (symbol set), `glass_floor` (extra decoy in pair list), `findables_floor` (spawn 0–2 bonus pair markers on generation) |
| **Playing / flip** | `sticky_fingers` (block index after match), `glass_floor` (decoy mismatch handling) |
| **Powers** | Contracts (`activeContract`) gate shuffle/destroy; relics adjust charges — combine with mutators in tests |
| **Scoring / floor advance** | `score_parasite` (life drain on cadence), `category_letters`, `n_back_anchor` (anchor cadence), `findables_floor` (flat score on match claim; destroy forfeits pickup) |
| **Presentation** | `wide_recall` (label-first play), `silhouette_twist` (silhouette styling), `distraction_channel` (renderer pulse; **off** in settings by default) |

## Shipped IDs (`MutatorId`)

- `glass_floor` — decoy `pairKey` (`DECOY_PAIR_KEY`); destroy/peek rules in `applyDestroyPair` / flip flow.
- `sticky_fingers` — `stickyBlockIndex` on match path.
- `score_parasite` — `parasiteFloors` in `advanceToNextLevel`.
- `category_letters` — filters symbol set for generation (`getSymbolSetForLevel` path).
- `short_memorize` — reduced memorize window (`getMemorizeDurationForRun`).
- `wide_recall` — play phase shows **labels** primarily (symbols de-emphasized in renderer).
- `silhouette_twist` — silhouette / reduced-face styling during play (CSS / materials).
- `n_back_anchor` — every 2 successful matches, surface an “anchor” pair key for recall pressure (`nBackAnchorPairKey` on `RunState`).
- `distraction_channel` — paired with Settings `distractionChannelEnabled` for optional UI pulse (no mandatory audio).
- `findables_floor` — seeded 0–2 pairs per floor carry `findableKind` on tiles; matching claims `FINDABLE_MATCH_SCORE`; `applyDestroyPair` clears the marker without reward (`findablesClaimedThisFloor` on `RunState`).

## Daily integration (A2 / D4)

`DAILY_MUTATOR_TABLE` + deterministic index from daily seed (`dailyMutatorIndexFromSeed` in `rng.ts`) picks one mutator for `createDailyRun`.

## Adding a mutator

1. Extend `MutatorId` in `contracts.ts` and bump `GAME_RULES_VERSION` if layout or scoring semantics change.  
2. Implement hooks in `game.ts` (single code path; avoid diverging endless vs daily).  
3. Register in `mutators.ts` (`hasMutator` / daily table if applicable).  
4. Add `game` tests under `src/shared/` for the new behavior.

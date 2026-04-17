# Relic roster (B1)

Relics are **run modifiers** stored on `RunState.relicIds` and chosen from `relicOffer` options (`src/shared/relics.ts`). They must not duplicate **forgiveness** jobs (grace first miss, guards, shards, streak softening, memorize bonus on life loss — see `GAME_FORGIVENESS_DEEP_DIVE.md`).

## v1 roster (`RelicId`)

| ID | Effect | Non-overlap note |
|----|--------|------------------|
| `extra_shuffle_charge` | +1 shuffle charge at pick | Forgiveness does not grant shuffle charges. |
| `first_shuffle_free_per_floor` | One free shuffle per floor (relic flag consumed in `applyShuffle`) | Distinct from unlimited forgiveness. |
| `memorize_bonus_ms` | Extra memorize time (applied via memorize helpers) | Forgiveness only banks bonus after **life lost**; this is baseline comfort. |
| `destroy_bank_plus_one` | +1 destroy charge at pick | Destroy remains a **power** with tradeoffs; forgiveness does not fill destroy bank. |
| `combo_shard_plus_step` | Head start on combo shards | Shards still follow chain rules; this only accelerates earning. |
| `memorize_under_short_memorize` | Extra memorize time while **Short memorize** mutator is active | Synergy with `short_memorize`; distinct from `memorize_bonus_ms` baseline. |
| `parasite_ward_once` | Ignore the next **score parasite** life loss once | Interacts with `score_parasite` advance drain; not a generic extra life. |
| `region_shuffle_free_first` | First **row shuffle** each floor costs no charge | Pairs with region-shuffle powers; distinct from `first_shuffle_free_per_floor` (full-board shuffle). |

## Expansion candidates (not shipped)

- “Second pin slot” — risks overlapping pin-as-memory crutch; needs separate cap in `contracts`.  
- “Score multiplier” — overlaps mutator `score_parasite` design space; prefer mutators for scoring.  
- “Extra life at draft” — overlaps streak/guard healing; avoid unless run economy is retuned.

## Draft flow (B2)

Floors **3 / 6 / 9**: `needsRelicPick` + `openRelicOffer` → UI in `GameScreen` → `pickRelic` / `completeRelicPickAndAdvance`.

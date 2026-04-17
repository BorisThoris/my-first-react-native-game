# Relic roster (B1)

Relics are **run modifiers** stored on `RunState.relicIds` and chosen from `relicOffer` options (`src/shared/relics.ts`). They must not duplicate **forgiveness** jobs (grace first miss, guards, shards, streak softening, memorize bonus on life loss — see `GAME_FORGIVENESS_DEEP_DIVE.md`).

## Roster (`RelicId`)

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
| `peek_charge_plus_one` | +1 peek charge | Information assist; does not change mismatch rules. |
| `stray_charge_plus_one` | +1 stray-remover charge | Board edit power; still counts as a power where relevant. |
| `pin_cap_plus_one` | +1 concurrent pin capacity (`maxPinnedTilesForRun`) | Distinct from contract max-pin challenges. |
| `guard_token_plus_one` | +1 guard token (capped at `MAX_GUARD_TOKENS`) | Same token economy as streak/guard gains. |
| `shrine_echo` | Banks **+1 relic selection** for the **next** milestone draft (`grantBonusRelicPickNextOffer`) | Does not grant picks on the floor you take it; stacks with other draft bonuses. |

## Expansion candidates (deferred)

- “Score multiplier” — overlaps mutator `score_parasite` design space; prefer mutators for scoring.  
- “Extra life at draft” — overlaps streak/guard healing; avoid unless run economy is retuned.

## Draft flow (B2)

After clearing floors **3, 6, 9, 12, …** (every 3 from 3), up to **12 milestone visits** per run (`relicTiersClaimed` caps visits; a visit may grant **multiple** relics via `picksRemaining` / `bonusRelicPicksNextOffer`): `needsRelicPick` + `openRelicOffer` → UI in `GameScreen` (`RelicDraftOfferPanel`) → `pickRelic` / `completeRelicPickAndAdvance`. **Puzzle** mode skips offers.

Each **round** shows up to **three** distinct options from `RELIC_DRAFT` in `relics.ts`: rarity + base weight; `effectiveRelicDraftWeight(id, tierIndex)` scales by milestone tier. `pickRound` rerolls a fresh trio when the player still owes picks. Selection uses `pickWeightedWithoutReplacement` (`weightedPick.ts`) with a run-seeded RNG (`runSeed`, tier, floor, `pickRound`).

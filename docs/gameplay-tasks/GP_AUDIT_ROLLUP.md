# GP gameplay tasks — audit rollup

**Method:** Read each `GP-*.md` acceptance vs `src/shared/game.ts`, `contracts.ts`, `relics.ts`, `mutators.ts`, `floor-mutator-schedule.ts`, renderer (`GameScreen.tsx`, `GameplayHudBar.tsx`, `GameLeftToolbar.tsx`, `ChooseYourPathScreen`, `useAppStore.ts`), and `game.test.ts`.

**Legend:** **Done** = behavior shipped and aligned with task intent. **Partial** = shipped with a deliberate scope note. **Gap** = none found (2026-04-19 audit); file issues if regression.

## Summary table

| ID | Verdict | Primary code / notes |
|----|---------|----------------------|
| GP-F01 | Done | `pickFloorScheduleEntry`, `usesEndlessFloorSchedule` (`floor-mutator-schedule.ts`); endless applies in `advanceToNextLevel` (`game.ts` ~1917+); non-endless modes skip schedule |
| GP-F02 | Done | `ENDLESS_FLOOR_CYCLE` includes `floorTag: 'breather'` rows with low mutator load (`floor-mutator-schedule.ts`); tests in `floor-mutator-schedule.test.ts` |
| GP-F03 | Done | `FloorTag` on `BoardState`; boss multiplier in `finalizeLevel` path (`game.ts` ~1372+); HUD pills `GameplayHudBar.tsx` (~242–249) |
| GP-O01 | Done | `glass_witness` in `bonusTags` (`game.ts` ~1360); decoy flags `decoyFlippedThisFloor` / glass paths; summary copy `GameScreen.tsx` `formatBonusTagsLine` |
| GP-O02 | Done | `BoardState.cursedPairKey`, `pickCursedPairKey`; bonus tag `cursed_last`; renderer passes `cursedPairKey` into board |
| GP-O03 | Done | `flipParLimit`, `matchResolutionsThisFloor`; bonus tag `flip_par` |
| GP-O04 | Done | `shuffleUsedThisFloor`, `destroyUsedThisFloor`; bonus tag `scholar_style` |
| GP-H01 | Done | `applyRegionShuffle`, `canRegionShuffle`, charges; `GameLeftToolbar.tsx` row cluster |
| GP-H02 | Done | **V1 scope:** `flashPairCharges` only when `practiceMode \|\| wildMenuRun`; `applyFlashPair` no-ops outside Practice/Wild even if charges are injected |
| GP-H03 | Done | `applyDestroyPair` sets `parasiteFloors` to `0` when `score_parasite` active (`game.ts` ~1447); unit test: `game.test.ts` (parasite reset on destroy) |
| GP-R01 | Done | Relic `memorize_under_short_memorize` + `getMemorizeDurationForRun` (`relics.ts`, `game.ts`) |
| GP-R02 | Done | `parasite_ward_once`, `parasiteWardRemaining` |
| GP-R03 | Done | `region_shuffle_free_first` + `regionShuffleFreeThisFloor` |
| GP-C01 | Done | `ContractFlags.maxPinsTotalRun`, `pinsPlacedCountThisRun`; guard in `togglePinnedTile`; HUD `GameplayHudBar` / `GameLeftToolbar`; tests `game.test.ts`, `useAppStore.test.ts` |
| GP-M01 | Done | `DAILY_MUTATOR_TABLE` has 9 entries (`mutators.ts`); deterministic index (`deriveDailyMutatorIndex`) |
| GP-M02 | Done | `createWildRun` sets `activeMutators: ['sticky_fingers','short_memorize','findables_floor']` |
| GP-M03 | Done | `createMeditationRun(..., focusMutators)`; `startMeditationRunWithMutators` (`useAppStore.ts`); UI `ChooseYourPathScreen` / `meditationMutatorList` |
| GP-FIN01 | Done | `FindableKind`, `findables_floor` mutator, `MUTATOR_CATALOG` |
| GP-FIN02 | Done | `buildBoard` / tagging helpers assign `findableKind`; tests `describe('findables_floor')` |
| GP-FIN03 | Done | Match claim, destroy forfeit, shuffle preserves kind (`game.test.ts`) |
| GP-FIN04 | Done | `FINDABLE_MATCH_SCORE`, combo shards on claim |
| GP-FIN05 | Done | WebGL markers `TileBoardScene.tsx`; DOM `TileBoard.tsx` |
| GP-FIN06 | Done | Export/scoring documented in `FINDABLES.md`; replay uses same generation rules |
| GP-RW01 | Done | `RouteWorldProfile` feeds next-floor board generation via `route-world.ts` and `buildBoard` |
| GP-RW02 | Done | Greed route stamps reward-risk specials and hard-floor `elite_cache` anchors |
| GP-RW03 | Done | Safe route stamps defensive wards and hard-floor `final_ward` anchors without route-added hazards |
| GP-RW04 | Done | Mystery route stamps veil/secret families and hard-floor `omen_seal`; peek reveals without claiming |
| GP-RW05 | Done | Route previews, board metadata, aria labels, banners, and reward floaters expose route-world effects |
| GP-RW06 | Done | Match claims route rewards; destroy denies; peek reveals; shuffle preserves; protected anchors resist stray |
| GP-RW07 | Done | Named route card families ship as `greed_toll`, `fragile_cache`, `lantern_ward`, `secret_door`, and anchors |
| GP-RW08 | Done | Route side-room interludes can be opened, claimed, or skipped through run flow |
| GP-RW09 | Done | Relic drafts use pending/active route context for weight and reason copy |
| GP-RW10 | Done | Boss floors stamp `keystone_pair`; hard non-boss route floors stamp elite anchors by route |
| GP-RW11 | Done | Synergy matrix fixtures cover Greed treasure/trap, Safe rush, Mystery survey, denial, reveal, and completion |
| GP-RW12 | Done | Catalog, Codex, task docs, and polish rollup cover route-world mechanics |

## Maintenance

When adding a GP-sized feature: update the relevant `GP-*.md` **Status** and this table in the same PR.

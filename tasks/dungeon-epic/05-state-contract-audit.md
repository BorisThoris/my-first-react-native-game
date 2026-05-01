# Dungeon State Contract Audit

## Status
Foundation audit v1 complete

## Purpose
This document is the implementation handoff for `DNG-002`. It classifies current dungeon state by owner, lifecycle, persistence risk, mutators, UI consumers, tests, and future ticket implications.

Rule of thumb: source-of-truth dungeon state belongs in shared rules (`src/shared/*`). Renderer state should derive presentation only. If future work needs new persistent shape, it must cite this audit and `DNG-003` before editing contracts.

## Contract Table

| State group | Current owner | Lifecycle | Persistence | Primary mutators | UI consumers | Current tests | Version / migration risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Run identity and determinism: `runSeed`, `runRulesVersion`, `gameMode`, `activeMutators`, `dailyDateKeyUtc`, `puzzleId` | `RunState` | Created at run start; carried through all floors | Active run can be persisted through save bridge; summaries persist subset | `createNewRun`, `createDailyRun`, `createGauntletRun`, `createWildRun`, `advanceToNextLevel` | Mode cards, HUD, results, run export/history | `game.test.ts`, daily/archive tests, run mode tests | High when generation or replay rules change; cite `GAME_RULES_VERSION` |
| Board core: `BoardState.level`, `pairCount`, `columns`, `rows`, `tiles`, `flippedTileIds`, `matchedPairs` | `BoardState` | Rebuilt per floor; mutated during play | Active run state only; summaries persist derived stats | `buildBoard`, `flipTile`, `resolveBoardTurn`, powers, `finalizeLevel` | `TileBoard`, HUD, score floaters, tests | `game.test.ts`, `softlock-fairness.test.ts`, board tests | High for replay and completion; update fairness tests |
| Tile matching identity: `Tile.id`, `pairKey`, `symbol`, `label`, `state`, `atomicVariant` | `Tile` | Generated per board; state changes hidden/flipped/matched/removed | Active run state | `createTiles`, `assignDungeonCardsToTiles`, `flipTile`, `resolveBoardTurn`, powers | Tile board WebGL, ARIA labels, card faces | pair/match tests, tile board tests | High if pair semantics change |
| Route card metadata: `routeCardKind`, `routeSpecialKind`, `routeSpecialRevealed`, `pendingRouteCardPlan`, `routeWorldProfile`, `selectedGatewayRouteType` | `Tile`, `BoardState`, `RunState` | Route choice creates plan; next board consumes it; matching claims reward | Active run; run summary can include route choice | `applyRouteChoiceOutcome`, `createRouteCardPlanForRoute`, `getRouteCardReward`, gateway/exit activation | Route banners, dungeon strip, board labels, floor-clear modal | route rules tests, `game.test.ts` route sections | Medium/high; route generation and reward changes affect replay |
| Dungeon card metadata: `dungeonCardKind`, `dungeonCardState`, `dungeonCardEffectId`, `dungeonCardHp`, `dungeonCardMaxHp`, `dungeonBossId`, `dungeonRouteType`, `dungeonKeyKind`, `dungeonRoomUsed` | `Tile` | Assigned during board build; revealed/resolved/matched/removed during floor | Active run only except summarized counters | `assignDungeonCardsToTiles`, `revealDungeonCardPair`, `getDungeonMatchReward`, `revealDungeonRoom`, `revealDungeonShop`, `activateDungeonExit` | Tile labels, dungeon status panel, Codex/help candidates | dungeon sections in `game.test.ts`, feature coverage tests | High; new kinds/effects require tests and likely rules version bump |
| Floor dungeon state: `dungeonExitTileId`, `dungeonExitActivated`, `dungeonExitLockKind`, `dungeonExitRequiredLeverCount`, `dungeonLeverCount`, `dungeonShopTileId`, `dungeonShopVisited`, `dungeonBossId`, `dungeonObjectiveId`, `dungeonKeysHeld` | `BoardState` | Built per floor; consumed by exit/objective/room/shop resolution | Active run only | `buildBoard`, `revealDungeonExit`, `activateDungeonExit`, match resolution, room effects | Dungeon exit overlay, status panel, route strip | exit/objective tests | High for softlock; keys/locks must be invariant-checked |
| Moving enemies: `enemyHazards`, `enemyHazardTurn` | `BoardState` | Built per floor; advances on actions; defeated by combat or floor-clear sweep | Active run only | `createEnemyHazardsForBoard`, `applyEnemyHazardClick`, `advanceEnemyHazardsOnBoard`, match damage, `finalizeLevel` | `TileBoardScene` markers, ARIA labels, dungeon chips | enemy hazard tests in `game.test.ts` | High for replay/timing; movement changes need deterministic tests |
| Dungeon counters: `dungeonEnemiesDefeated`, `dungeonEnemiesDefeatedThisFloor`, `dungeonTrapsTriggered`, `dungeonTrapsResolvedThisFloor`, `dungeonTreasuresOpened`, `dungeonGatewaysUsed`, `enemyHazardHitsThisFloor`, `enemyHazardsDefeatedThisFloor`, `dungeonShopVisitedThisFloor` | `RunState` | Cumulative or floor-local; floor-local reset on advance | Active run; some values may be summarized later | match/mismatch resolution, trap springing, shop/room/exit actions, `advanceToNextLevel` | HUD chips, objective status, results, future journal | `game.test.ts`, objective tests | Medium/high; prefer board-derived status where practical |
| Run map: `dungeonRun: DungeonRunMapState`, `DungeonRunNode[]`, `selectedNodeId`, `currentNodeId` | `RunState` | Created at run start; choices reveal/select/enter nodes; current node shapes next board | Active run; route history may summarize later | `createDungeonRunMapState`, `revealDungeonChoices`, `selectDungeonNode`, `enterSelectedDungeonNode` | Dungeon route strip, route choice/floor-clear flow | `run-map.test.ts`, game route tests | Medium/high; node changes affect generation and UI |
| Side rooms and bonus ledger: `sideRoom`, `bonusRewardLedger` | `RunState` | Offered between route and floor; one-shot choices; ledger prevents repeated bonus claims | Active run; ledger may persist if active run persists | `openRouteSideRoom`, `claimRouteSideRoomChoice`, `skipRouteSideRoom`, bonus reward helpers | Side room screens, route/floor flow | route side room, bonus reward tests | Medium; anti-grind behavior must be idempotent |
| Shop state: `shopGold`, `shopOffers`, `shopRerolls` | `RunState` | Run-local wallet; offers reset/refresh by floor/shop visit | Active run; summaries may include totals later | `createRunShopOffers`, `purchaseShopOffer`, `rerollShopOffers`, room/shop rewards | `ShopScreen`, floor-clear shop buttons, HUD/result copy | shop rules tests | Medium; economy changes need simulation |
| Relic and favor state: `relicIds`, `relicTiersClaimed`, `bonusRelicPicksNextOffer`, `favorBonusRelicPicksNextOffer`, `relicFavorProgress`, `relicOffer`, `metaRelicDraftExtraPerMilestone` | `RunState`; meta unlock in `SaveData.playerStats` | Run start, milestone offers, featured objectives, meta unlock carry-in | Meta unlock persists; active run fields can persist with run | `openRelicOffer`, `completeRelicPickAndAdvance`, `gainRelicFavor`, relic services | Relic offer modal, Collection/Codex, results | relic tests, objective tests | Medium/high if persisted or reward cadence changes |
| Powers and assists: shuffle/destroy/peek/gambit/wild/stray/flash/region/pin fields | `RunState` plus `BoardState`/`Tile` | Per-run and per-floor charges; some reset on advance | Active run | board power modules, `flipTile`, `resolveBoardTurn`, store actions | Power toolbar, board previews, HUD | board power tests, game tests | Medium; impacts perfect/scholar/objective rules |
| Objective/result state: `featuredObjectiveId`, `LevelResult`, `lastLevelResult`, `featuredObjectiveStreak`, risk wager fields | `BoardState`, `RunState`, `LevelResult` | Per-floor objective, finalized into last result, streak carries across floors | Last run summary persists subset | `finalizeLevel`, objective rules, secondary objective helpers | Floor-clear modal, HUD objective, run history | objective/secondary tests, game tests | Medium/high; result tags and scoring affect replay |
| Renderer-derived dungeon presentation | Renderer selectors/components | Recomputed from `RunState`/`BoardState`; should not own rules | Not persisted | `getDungeonBoardPresentation`, `getDungeonExitStatus`, React memo/selectors | `GameScreen`, `TileBoard`, `TileBoardScene`, overlays | renderer tests | Low if display-only; high if it starts owning rules |

## Current Enemy Model Clarification

There are two enemy concepts:

1. **Dungeon enemy card pairs** live on `Tile` through `dungeonCardKind === 'enemy'`, `dungeonCardHp`, and optional `dungeonBossId`. They are matched like normal card pairs and can be damaged by active chip damage.
2. **Moving enemy hazards** live on `BoardState.enemyHazards`. They occupy `currentTileId`, telegraph `nextTileId`, hit on contact, can be revealed/damaged/defeated, and are swept to defeated on floor clear.

Future enemy work must state which model it changes. If it bridges both models, it must add tests for both objective counters and board completion.

## Mutation Surface Map

| Action | Shared rule owner | Store/UI entry | Notes |
| --- | --- | --- | --- |
| Flip tile | `flipTile`, `resolveBoardTurn` | `useAppStore.pressTile` | Reveals dungeon card pair and starts resolve timer. |
| Enemy contact | `applyEnemyHazardClick` | `useAppStore.pressTile` before normal flip | Contact may apply damage and still allow card action. |
| Match/mismatch | `resolveBoardTurn` | resolve timer/store | Applies rewards, traps, enemies, objectives, hazards, and completion. |
| Exit reveal/activate | `revealDungeonExit`, `activateDungeonExit` | exit overlay/actions | Exit can finalize floor. |
| Shop reveal/purchase | `revealDungeonShop`, shop rules | shop screen/store | Offers are run-local. |
| Room reveal/use | `revealDungeonRoom` | board/store | Room effects mutate run and board once. |
| Route choice | route rules/run map | floor-clear/route UI | Shapes next board via plan/profile/node. |
| Advance floor | `advanceToNextLevel` | floor-clear continue | Resets floor-local counters and builds next board. |

## Persistence Classification

- **Persisted in `SaveData`:** settings, achievements, best score, last run summary, player stats, unlocks, onboarding, optional meta unlocks.
- **Potentially persisted through active run save bridge:** full `RunState` when a run is resumable. Treat all `RunState` fields as migration-sensitive even if not directly in `SaveData`.
- **Not intended to persist beyond active run:** board tiles, enemy hazards, shop offers, route side room, floor-local counters, active relic offer.
- **Summary candidates:** route path, bosses defeated, treasures opened, build highlights, death/clear reason. These belong in future journal/history tickets, not ad hoc UI state.

## Ambiguous Or Risky Boundaries

| Boundary | Risk | Owner decision for now | Follow-up |
| --- | --- | --- | --- |
| `dungeonKeysHeld` on `BoardState` vs `dungeonKeys` on `RunState` | Floor-local and run-global keys can be confused | Keep floor-local counters on `BoardState`; run inventory keys on `RunState` | `DNG-045` |
| Enemy card pairs vs moving enemy hazards | Counters/objectives may double-count enemy defeat | Keep models separate; bridge only with explicit tests | `DNG-030`, `DNG-032` |
| `dungeonShopVisited` on board vs `dungeonShopVisitedThisFloor` on run | Duplicate visited flags | Board flag is floor object state; run flag is summary/counter | `DNG-041` |
| Objective progress counters vs board-derived state | Counters can drift from actual board | Prefer derived board status; counters only for history/once-only effects | `DNG-024` |
| Route card plan vs dungeon map node | Route can be selected by gateway/exit/map choice | Keep `pendingRouteCardPlan` as next-board payload; `dungeonRun` as journey graph | `DNG-010`, `DNG-011` |
| Renderer enemy labels vs rules | UI can accidentally define rule language | Renderer derives labels; rules/Codex own terminology | `DNG-033`, `DNG-064` |

## Required Future Rules

- New `Tile` fields require `DNG-002`, `DNG-003`, and `DNG-005` review.
- New `BoardState` fields require generation, completion, and fairness tests.
- New `RunState` fields require reset/advance/resume semantics.
- New persisted fields require save migration and fuzzing tests.
- New dungeon card kinds/effects require taxonomy, reveal, objective, UI, and Codex updates.
- New enemy movement/combat rules require determinism and no-double-advance tests.

## Immediate Follow-Ups

- `DNG-005`: expand softlock/completion invariants using the risky boundary table.
- `DNG-020`: convert `DungeonCardKind` and `DungeonCardEffectId` into a catalog or coverage table.
- `DNG-030`: lock enemy lifecycle vocabulary and counters before adding boss phases.
- `DNG-045`: audit keys, locks, exits, and floor-local vs run-global key state.


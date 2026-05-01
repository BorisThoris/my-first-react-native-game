# Dungeon Epic Execution Ledger

## Instructions
Future agents must update this file after every implementation session that uses the dungeon epic. Keep entries short but specific. Include tests run and the next recommended ticket.

## Current State
- Pack created as a planning and handoff system.
- Existing repo has partial dungeon systems: route map, dungeon cards, shops, rooms, enemy hazards, objectives, relics, and tests.
- Previous implementation immediately before this pack refined enemy contact, enemy visuals, and floor-clear hazard defeat.

## Active Work
| Ticket | Status | Owner/session | Notes |
| --- | --- | --- | --- |
| `DNG-001` | Done | 2026-05-01 session | Scope and execution rules locked. |
| `DNG-002` | Done | 2026-05-01 session | State contract audit added at `05-state-contract-audit.md`. |
| `DNG-003` | Done | 2026-05-01 session | Dungeon rules versioning policy now classifies replay-affecting changes and updates the ticket template checklist. |
| `DNG-004` | Done | 2026-05-01 session | Dungeon determinism contract now names replay seed inputs and guards seeded generation modules against unseeded randomness. |
| `DNG-005` | Done | 2026-05-01 session | Dungeon-specific fairness invariants and corrupt-state tests added. |
| `DNG-010` | Done | 2026-05-01 session | Route decision rows now expose current node, next room, risk, reward, and mechanic columns through a shared selector used by floor-clear UI. |
| `DNG-011` | Done | 2026-05-01 session | Dungeon node type contracts now cover every node kind with floor tag, archetype, objective, reward, card-family bounds, and UI tone. |
| `DNG-012` | Done | 2026-05-01 session | Floor archetype progression now exposes pacing roles, route affinities, budget expectations, frequency bands, and fairness-backed long-run coverage. |
| `DNG-020` | Done | 2026-05-01 session | Shared dungeon card kind/effect taxonomy and coverage tests added. |
| `DNG-021` | Done | 2026-05-01 session | Encounter budget inspector, capacity cap, and budget coverage tests added. |
| `DNG-022` | Done | 2026-05-01 session | Shared dungeon card knowledge selector and ARIA integration added. |
| `DNG-023` | Done | 2026-05-01 session | Trap card vs moving enemy hazard status selector and vocabulary-safe copy added. |
| `DNG-024` | Done | 2026-05-01 session | Objective progress contract avoids counter double-counting and covers all objective families. |
| `DNG-025` | Done | 2026-05-01 session | Floor-clear finalization clears transient targeting state and active hazards idempotently. |
| `DNG-030` | Done | 2026-05-01 session | Enemy card-pair vs moving patrol lifecycle selector and contract doc added. |
| `DNG-031` | Done | 2026-05-01 session | Enemy movement pattern definitions and candidate selector added. |
| `DNG-032` | Done | 2026-05-01 session | Enemy contact/combat order doc and guard/fatal-contact regressions added. |
| `DNG-033` | Done | 2026-05-01 session | Moving enemy patrol occupied/next-target ARIA copy added and tested. |
| `DNG-034` | Done | 2026-05-01 session | Shared boss definitions/read model added for all four bosses, including reward hooks and visual/audio placeholders. |
| `DNG-035` | Done | 2026-05-01 session | Elite encounter rules now enforce pacify identity, threat/reward budget floors, and non-boss score copy. |
| `DNG-036` | Done | 2026-05-01 session | Balance simulation now reports enemy pressure, elite samples, boss patrols, and contact-risk metrics. |
| `DNG-040` | Done | 2026-05-01 session | Room effect catalog/read model added with trigger, cost, reward, resolved-state, blocked, and used copy coverage. |
| `DNG-041` | Done | 2026-05-01 session | Shop stock/read model added for floor-clear and board vendors; incompatible purchases are blocked by rules. |
| `DNG-042` | Done | 2026-05-01 session | Rest shrine service rows expanded for heal, guard, Favor bargain, and boss prep with bounded purchase/read-model tests. |
| `DNG-043` | Done | 2026-05-01 session | Treasure reward read model added for treasure/cache/supply/lock/locked-room/secret-door sources. |
| `DNG-044` | Done | 2026-05-01 session | Run event catalog rows now expose seed-stable conditions and bounded choice result copy with decline/idempotence tests. |
| `DNG-045` | Done | 2026-05-01 session | Defeat-boss exits now stay blocked for active boss card pairs as well as moving boss patrols. |
| `DNG-050` | Done | 2026-05-01 session | Run economy taxonomy now includes dungeon keys plus source/sink coverage for all core currencies. |
| `DNG-051` | Done | 2026-05-01 session | Relic build archetypes now use dungeon-facing identities with support hooks and explicit treasure/boss deferrals. |
| `DNG-052` | Done | 2026-05-01 session | Run inventory now tracks dungeon keys/master keys and shared deterministic gain/use helpers for run-only consumables. |
| `DNG-053` | Done | 2026-05-01 session | Secondary objective result tags now include dungeon achievements with reward-bearing metadata and deduped floor-clear tags. |
| `DNG-054` | Done | 2026-05-01 session | Balance simulation now tracks reward pacing for Favor, shards, guard, relic offers, consumables, treasure, and floor bands. |
| `DNG-055` | Done | 2026-05-01 session | Exploit surface review doc and regression suite now cover local shop/rest/bonus/event/relic farm prevention. |
| `DNG-060` | Done | 2026-05-01 session | Dungeon HUD chips now use urgency priority, a visible cap, and one primary alert line. |
| `DNG-061` | Done | 2026-05-01 session | Board stage layer policy now reserves card text space while preserving enemy telegraphs in low quality and reduced motion. |
| `DNG-062` | Done | 2026-05-01 session | Enemy and boss markers now have non-color-only shape profiles with low-quality and reduced-motion LOD bounds. |
| `DNG-063` | Done | 2026-05-01 session | Dungeon audio event matrix covers critical events with cue mappings, gain multipliers, ducking, and merge policy. |
| `DNG-064` | Done | 2026-05-01 session | Codex/glossary coverage now includes shipped dungeon terms and a board glossary guide row. |
| `DNG-065` | Done | 2026-05-01 session | Mobile/controller comfort contract now exposes dungeon focus order and keyboard selection of occupied patrol cards. |
| `DNG-070` | Done | 2026-05-01 session | Versioned dungeon combinatoric matrix maps P0 route, boss, trap, economy, input, and forbidden-combo rows to tests. |
| `DNG-071` | Done | 2026-05-01 session | Balance simulation now reports deterministic cautious/average/greedy/high-skill dungeon profile metrics and bounds. |
| `DNG-072` | Done | 2026-05-01 session | Dungeon E2E fixture recipes and dev sandbox board fixtures now cover major screenshot states. |
| `DNG-073` | Done | 2026-05-01 session | Save normalization now fuzzes corrupted dungeon-adjacent persisted fields and documents run-local dungeon recovery policy. |
| `DNG-074` | Done | 2026-05-01 session | Dungeon board stage now exposes a documented draw-call/material/geometry budget for moving threat overlays and context restore policy. |
| `DNG-075` | Done | 2026-05-01 session | Acceptance report added with all ticket statuses, P0 gate, QA scenarios, screenshot paths, and final verification commands. |

## Completed Work Log
| Date | Ticket(s) | Summary | Verification |
| --- | --- | --- | --- |
| 2026-05-01 | Pack bootstrap | Created dungeon epic planning pack and ticket map. | Markdown structure/file-list verification. |
| 2026-05-01 | `DNG-001`, `DNG-002` | Locked dungeon scope/execution rules and added `05-state-contract-audit.md` covering `RunState`, `BoardState`, `Tile`, moving enemy hazards, route/map/shop/room/reward state, persistence, mutation surfaces, and risky boundaries. | Required-section scan for tickets; `git status --short` scoped review. |
| 2026-05-01 | `DNG-003`, `DNG-004` | Added shared dungeon rules versioning and determinism contracts, updated the ticket template, and guarded seeded generation modules from unseeded randomness/time sources. | `yarn test src/shared/dungeon-versioning.test.ts src/shared/version-gate.test.ts src/shared/run-map.test.ts src/shared/run-events.test.ts`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-005` | Added dungeon fairness checks for exit references, lever reachability, active enemy hazard tile references, dungeon pair metadata, enemy HP mirrors, and defeat-boss objective reachability. | `yarn test src/shared/softlock-fairness.test.ts src/shared/game.test.ts` |
| 2026-05-01 | `DNG-010` | Added shared dungeon route decision rows and wired the floor-clear route panel to consistent risk/reward/mechanic columns. | `yarn test src/shared/run-map.test.ts src/renderer/components/GameScreen.test.tsx`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-011` | Added shared dungeon node type contracts for all node kinds, including objective defaults and card-family bounds. | `yarn test src/shared/run-map.test.ts src/shared/game.test.ts src/shared/softlock-fairness.test.ts`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-012` | Added floor archetype progression rows/reports with role, route, budget, and frequency coverage, plus fairness checks for each authored cycle row. | `yarn test src/shared/floor-mutator-schedule.test.ts src/shared/game.test.ts src/shared/softlock-fairness.test.ts src/shared/balance-simulation.test.ts`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-020` | Added `src/shared/dungeon-cards.ts` with typed kind/effect taxonomy rows and catalog-backed copy fallback for dungeon cards. | `yarn test src/shared/dungeon-cards.test.ts src/shared/softlock-fairness.test.ts src/shared/game.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-021` | Added `inspectDungeonEncounterBudget`, explicit paired-card capacity capping in blueprint creation, and budget tests for node/archetype influence and representative floors. | `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts src/shared/dungeon-cards.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-022` | Added `getDungeonCardKnowledge` for hidden/revealed/resolved information state and wired TileBoard ARIA dungeon copy to it. | `yarn test src/shared/dungeon-cards.test.ts src/shared/game.test.ts src/renderer/components/TileBoard.test.tsx`; `yarn typecheck` |
| 2026-05-01 | `DNG-023` | Added `getDungeonThreatStatus`, threaded it into `DungeonBoardStatus`, and aligned alert copy around trap cards vs moving enemy patrols. | `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts src/shared/dungeon-cards.test.ts`; `yarn test src/renderer/components/GameScreen.test.tsx src/renderer/components/TileBoard.test.tsx` |
| 2026-05-01 | `DNG-024` | Normalized disarm/pacify objective progress to prefer board state and use run counters only for cleared metadata gaps; added all-objective contract tests and boss-blocked exit regression. | `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-025` | Final floor-clear now clears stale flipped ids and floor-local targeting state, defeats remaining moving enemy hazards, and keeps repeated exit activation idempotent. | `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-030` | Added `getDungeonEnemyLifecycleStatus` and `06-enemy-lifecycle-contract.md` to separate enemy card pairs from moving enemy patrol overlays, with lifecycle tests for spawn/contact/defeat/floor clear. | `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-031` | Added pattern definitions and `getEnemyHazardMovementCandidateIds`; observe now prioritizes boss/enemy/trap cards, and tests lock patrol/stalk/guard/observe candidate behavior. | `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-032` | Added `07-enemy-contact-combat-order.md` and regressions for guard-token contact absorption and fatal contact stopping the follow-up tile action. | `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-033` | Updated TileBoard focus copy to announce occupied and next-target moving enemy patrols with label, HP, and damage. | `yarn test src/renderer/components/TileBoard.test.tsx src/renderer/components/GameScreen.test.tsx`; `yarn typecheck` |
| 2026-05-01 | `DNG-034`, `DNG-035`, `DNG-036` | Centralized dungeon boss identity/read models, kept non-boss elite nodes free of boss IDs, added elite rule contracts, and extended balance simulation with enemy-pressure metrics. | `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`; `yarn test src/shared/dungeon-cards.test.ts`; `yarn test src/shared/balance-simulation.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-040` | Added a shared room effect catalog/read model and tests for all room triggers, costs, rewards, blocked states, and one-shot idempotence. | `yarn test src/shared/game.test.ts src/shared/dungeon-cards.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-041` | Added deterministic shop stock/read models, blocked incompatible purchases, and ensured occupied enemy contact takes precedence over shop/room utility actions. | `yarn test src/shared/game.test.ts src/renderer/store/useAppStore.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-042` | Expanded rest shrine services with guard and boss-prep options, capped availability, affordability summaries, and duplicate purchase guards. | `yarn test src/shared/rest-shrine.test.ts src/shared/game.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-043` | Added treasure tier/gate/payout/claim-condition definitions for dungeon treasure sources and secret doors. | `yarn test src/shared/game.test.ts src/shared/bonus-rewards.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-044` | Added event catalog rows for conditions/choices, safe decline preview coverage, and side-room event idempotence regression. | `yarn test src/shared/run-events.test.ts src/shared/game.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-045` | Hardened shared exit status so boss-card defeat objectives block exit activation until resolved. | `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-050` | Extended run economy taxonomy with dungeon keys and strengthened source/sink/purpose coverage tests. | `yarn test src/shared/run-economy.test.ts src/shared/balance-simulation.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-051` | Replaced generic relic build buckets with dungeon archetypes, support-hook read models, dungeon-facing relic copy, and bounded synergy tests. | `yarn test src/shared/relics.test.ts src/shared/mechanics-encyclopedia.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-052` | Added dungeon key/master key rows to run inventory, deterministic consumable gain/use helpers, and InventoryScreen key visibility tests. | `yarn test src/shared/run-inventory.test.ts src/renderer/components/InventoryScreen.test.tsx`; `yarn typecheck` |
| 2026-05-01 | `DNG-053` | Added shared dungeon result tag definitions/generator and threaded dungeon achievement tags into level finalization without changing reward payout math. | `yarn test src/shared/secondary-objectives.test.ts src/shared/game.test.ts src/renderer/components/GameScreen.test.tsx`; `yarn typecheck` |
| 2026-05-01 | `DNG-054` | Extended deterministic balance simulation with reward-source and floor-band pacing rows and broad starvation/runaway bounds. | `yarn test src/shared/balance-simulation.test.ts src/shared/run-economy.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-055` | Documented exploit surfaces and added regressions for one-shot shop, rest, bonus, side-room, and relic service reward paths. | `yarn test src/shared/exploit-surface.test.ts src/shared/bonus-rewards.test.ts src/shared/relics.test.ts src/shared/rest-shrine.test.ts`; `yarn typecheck` |
| 2026-05-01 | `DNG-060` | Added priority/cap metadata to dungeon HUD chips and renderer/shared tests for crowded danger-first HUD ordering. | `yarn test src/shared/game.test.ts src/renderer/components/GameScreen.test.tsx`; `yarn typecheck` |
| 2026-05-01 | `DNG-061` | Added a named board-stage layer policy, moved enemy/current telegraphs to reserved card corners, and covered low/reduced-motion threat readability. | `yarn test src/renderer/components/TileBoard.test.tsx`; `yarn typecheck` |
| 2026-05-01 | `DNG-062` | Added marker visual profiles for each enemy kind and bosses, with shared-geometry scene wiring and reduced-motion/low-quality tests. | `yarn test src/renderer/components/TileBoard.test.tsx src/renderer/components/GameScreen.test.tsx`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-063` | Added tested dungeon audio event coverage for contact, reveal, trap, defeat, treasure, shop, exit, and route events using existing cue fallbacks and placeholder mappings. | `yarn test src/renderer/audio/dungeonAudioEventCoverage.test.ts src/renderer/audio/audioInteractionCoverage.test.ts src/renderer/audio/audioMixDuckingPolicy.test.ts`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-064` | Added dungeon glossary terms and a Codex board glossary row, bumping encyclopedia version and locking coverage with drift tests. | `yarn test src/shared/mechanics-encyclopedia.test.ts src/shared/codex-knowledge-base.test.ts src/shared/copy-tone.test.ts src/renderer/components/CodexScreen.test.tsx`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-065` | Added dungeon comfort focus-order/mobile policy constants, exposed them on TileBoard, and tested keyboard selection of occupied enemy patrol cards. | `yarn test src/renderer/components/TileBoard.test.tsx src/renderer/gameplay/regPhase4PlayContract.test.ts`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-070` | Added a machine-readable dungeon combinatoric matrix with P0 evidence rows and explicit forbidden/future coverage buckets. | `yarn test src/shared/dungeon-combinatoric-matrix.test.ts src/shared/game.test.ts src/shared/softlock-fairness.test.ts`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-071` | Extended balance simulation with dungeon player profiles, pressure/economy/boss/shop metrics, and profile/seed/floor bound failure context. | `yarn test src/shared/balance-simulation.test.ts src/shared/run-economy.test.ts`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-072` | Added deterministic dungeon fixture recipes, matching dev sandbox board fixtures, and a Playwright smoke spec for fixture opening/screenshot capture. | `yarn test src/shared/dungeon-e2e-fixtures.test.ts src/renderer/dev/runFixtures.test.ts src/renderer/dev/devSandboxParams.test.ts`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-073` | Added a dungeon save migration policy, hardened corrupted relic-pick stat normalization, and covered dungeon-adjacent legacy/partial save fuzz cases. | `yarn test src/shared/save-data.test.ts src/shared/version-gate.test.ts`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-074` | Added a dungeon board-stage performance budget/read model for moving enemy and boss overlays, including low/reduced-motion readability and context restore policy checks. | `yarn test src/renderer/components/TileBoard.test.tsx src/shared/qa/regPhase5Hardening.test.ts src/shared/graphicsQuality.test.ts`; `yarn typecheck`; `yarn lint` |
| 2026-05-01 | `DNG-075` | Added the dungeon acceptance report covering ticket status, P0 completion, known P1/P2 deferrals, QA scenarios, screenshot recipe paths, and final gates. | `yarn test`; `yarn typecheck`; `yarn lint`; `yarn build`; `yarn test:e2e e2e/dungeon-fixtures-smoke.spec.ts --workers=1` |

## Blockers
- None recorded in this pack yet.

## Next Recommended Ticket
Continue with `tickets/DNG-013-act-biome-structure.md`.

## Session Handoff Template
Copy this block for future updates:

```md
### YYYY-MM-DD - Session summary
- Tickets touched:
- Source files changed:
- Behavior shipped:
- Tests run:
- Known risks:
- Next recommended ticket:
```

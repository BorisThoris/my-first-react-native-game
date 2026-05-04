# Gameplay Epic Acceptance Report

## Status
Current closure pass for the converted gameplay theory epics. The task conversion pack is marked `Done`; this report records the implementation anchors and regression coverage that make those status claims auditable.

## Acceptance Matrix
| Epic | Accepted implementation surface | Regression coverage |
| --- | --- | --- |
| EPIC-01 core loop gates | `src/shared/mechanic-feedback.ts` defines mechanic tokens, memory-tax scoring, and Perfect Memory impact language; `src/shared/power-verbs.ts` applies the gate to shipped actions. | `src/shared/power-verbs.test.ts`, `src/shared/game.test.ts`, `src/shared/softlock-fairness.test.ts` |
| EPIC-03 feedback language | Floor-clear causality rows, HUD live announcements, mechanic-token data attributes, and shared action copy are centralized instead of one-off modal strings. | `src/shared/level-result-presentation.test.ts`, `src/renderer/hooks/useHudPoliteLiveAnnouncement.test.ts`, `src/renderer/components/GameScreen.test.tsx` |
| EPIC-02 action dock and powers | Existing player verbs are grouped by job, expose cost/consequence/disabled reasons, and keep pin separate from Perfect Memory-locking assists. | `src/shared/power-verbs.test.ts`, `src/renderer/components/GameLeftToolbar` coverage through renderer suites |
| EPIC-04 safe card suite | Route, findable, guard, shrine, cache, trap, and boss reward hooks are represented as safe-targeted board or floor-clear surfaces rather than separate visual card classes. | `src/shared/game.test.ts`, `src/shared/bonus-rewards.test.ts`, `src/shared/level-result-presentation.test.ts` |
| EPIC-05 floor and encounter identity | Floor archetype, chapter, boss, route, recovery, treasure, and trap identities feed HUD, next-floor preview, floor-clear causality, and balance simulation rows. | `src/shared/floor-mutator-schedule.test.ts`, `src/shared/boss-encounters.test.ts`, `src/renderer/components/GameplayHudBar.test.tsx` |
| EPIC-06 archetypes and relic meaning | Relics expose build archetype labels and decision roles through draft rows, inventory, Codex, and run build profile helpers without adding a separate talent screen. | `src/shared/relics.test.ts`, `src/renderer/components/InventoryScreen.test.tsx`, `src/renderer/components/CodexScreen.test.tsx` |
| EPIC-07 prototype sandbox | Prototype ideas remain documented boundaries, with promoted hazard tiles graduated into normal-run contracts through shared taxonomy, engine hooks, objective balance, and UI/a11y copy. | `src/shared/hazard-tiles.test.ts`, `src/shared/game.test.ts`, `src/shared/balance-simulation.test.ts`, `src/renderer/components/TileBoard.test.tsx` |

## Drift Closed In This Pass
- Added hazard tiles to the master mechanics catalog board and resolution sections.
- Promoted Toll Cache as the next greed hazard: clean matches convert score into shop gold without silently spending scarce resources.
- Upgraded Lantern Ward as the first Safe-card follow-up: clean matches now scout hidden danger or mystery information without springing traps or claiming rewards.
- Upgraded Omen Seal into the Mystery counterpart: clean matches keep Favor/shard rewards and scout hidden hazard, dungeon danger, or Mystery route information without triggering it.
- Promoted Mimic Cache as a Mystery normal-floor route special: revealed claims pay full loot, blind claims bite guard/life and pay reduced loot.
- Replaced Safe Ward route-card generation with Guard Cache: normal guard gain below cap, one banked Safe hazard ward at cap, and ward blocks for Shuffle Snare / Fragile Cache only.
- Promoted Fuse Cache as the next Greed hazard: early clean extraction pays full score/gold, late extraction keeps board-safe consolation gold.
- Linked the hazard tile matrix and this closure report from the gameplay documentation index.
- Confirmed the current task-conversion backlog has no remaining non-template task with a non-`Done` status.

## Next-Wave Seeds
These are not current implementation tasks; they are the next theory pass candidates if more gameplay depth is desired.

| Seed | Why it is next-wave, not closure work |
| --- | --- |
| More promoted hazard kinds | Toll Cache proves the expansion path for economy hazards. Future kinds should start with memory-tax and softlock matrices. |
| Action verbs beyond the current dock | Current verbs are now categorized and consequence-labeled. New verbs should enter through `power-verbs` and the target-preview contract first. |
| Talent system revival | Build archetypes are now player-facing through relics and floor identity. A separate talents layer should only ship if it creates decisions not already covered by relic drafts. |
| Authored floor packs | Floor identity is in place; authored packs can reuse archetype, route, boss, and hazard contracts without changing core board rules. |

## Verification Commands
- `yarn test src/shared/power-verbs.test.ts src/shared/level-result-presentation.test.ts src/shared/hazard-tiles.test.ts`
- `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts src/shared/balance-simulation.test.ts`
- `yarn test src/shared/relics.test.ts src/shared/run-history.test.ts src/shared/boss-encounters.test.ts`
- `yarn test src/renderer/hooks/useHudPoliteLiveAnnouncement.test.ts src/renderer/components/GameScreen.test.tsx src/renderer/components/GameplayHudBar.test.tsx src/renderer/components/TileBoard.test.tsx`
- `yarn docs:mechanics-appendix`
- `yarn typecheck`
- `git diff --check`

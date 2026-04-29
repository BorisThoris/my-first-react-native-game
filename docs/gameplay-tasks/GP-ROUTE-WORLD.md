# Gameplay tasks: route world pipeline

Source:

- [ROUTE_WORLD_PIPELINE.md](../gameplay-theory/ROUTE_WORLD_PIPELINE.md)
- [CARD_TYPES_HAZARDS_AND_PICKUPS.md](../gameplay-theory/CARD_TYPES_HAZARDS_AND_PICKUPS.md)
- [PERKS_RELICS_MODIFIERS_AND_WORLD_INTERACTIONS.md](../gameplay-theory/PERKS_RELICS_MODIFIERS_AND_WORLD_INTERACTIONS.md)
- [SYNERGY_AND_ANTI_SYNERGY_MATRIX.md](../gameplay-theory/SYNERGY_AND_ANTI_SYNERGY_MATRIX.md)
- [epic-route-world-pipeline.md](../gameplay/epic-route-world-pipeline.md)

These tasks convert Safe/Greed/Mystery route choice into next-floor gameplay generation, rendering, side-room hooks, and synergy coverage. They are implementation tasks, not REG audit tasks.

---

## GP-RW01 - Route world profile v1

### Status
Done - route profile v1 is implemented in `src/shared/route-world.ts` and consumed by `buildBoard`.

### Priority
High

### Objective
Add a deterministic route-world profile derived from `RunState.pendingRouteCardPlan.routeType` and the scheduled next-floor identity. The profile should be the single gameplay bridge between route choice and next-floor board generation.

### Spec reference
[ROUTE_WORLD_PIPELINE.md](../gameplay-theory/ROUTE_WORLD_PIPELINE.md) - Route world profile, danger and reward budgets, implementation-ready v1 slice.

### Affected areas
- `src/shared/contracts.ts` - route-world profile types if exported.
- `src/shared/game.ts` - `advanceToNextLevel` and `buildBoard` options.
- `src/shared/floor-mutator-schedule.ts` - scheduled floor entry inputs.
- `src/shared/game.test.ts` - deterministic profile fixtures.

### Acceptance criteria
- Same `runSeed`, `runRulesVersion`, level, route type, and floor entry always produce the same profile.
- Profile distinguishes Safe, Greed, and Mystery by reward, hazard, safety, and information bias.
- Route profile is consumed before board generation completes, not only after rendering.
- Existing route-card behavior still works if route-world fields are absent on old saves.

### Dependencies
Existing route-card plan and floor schedule.

### Out of scope
Full named card roster implementation.

### Rules version note
Bump `GAME_RULES_VERSION` if profile changes generated board contents or scoring.

---

## GP-RW02 - Greed route board pressure

### Status
Done - Greed route now stamps `greed_cache` plus `greed_toll` reward-risk pairs.

### Priority
High

### Objective
Make Greed route materially harder or more volatile on the next floor by adding capped reward-risk pressure: richer route rewards, extra cache/reward carriers, and eligible hazard/trap pressure.

### Spec reference
[ROUTE_WORLD_PIPELINE.md](../gameplay-theory/ROUTE_WORLD_PIPELINE.md) - Greed profile; [SYNERGY_AND_ANTI_SYNERGY_MATRIX.md](../gameplay-theory/SYNERGY_AND_ANTI_SYNERGY_MATRIX.md) - danger budget examples.

### Affected areas
- `src/shared/game.ts` - route-special assignment and reward resolution.
- `src/shared/contracts.ts` - any new route/card metadata.
- `src/renderer/components/TileBoard*.tsx` and `tileTextures.ts` - visible greed pressure markers.
- `src/shared/game.test.ts`, renderer card tests.

### Acceptance criteria
- Selecting Greed produces board metadata that differs from Safe on the same seed.
- Greed adds visible reward opportunity and visible danger or extraction cost.
- Greed cannot place route rewards on decoy/wild/completion-critical tiles unless explicitly supported.
- Greed hazard additions are capped on boss/trap floors.

### Dependencies
`GP-RW01`.

### Out of scope
Shop economy retuning beyond route-card or board reward payout.

### Rules version note
Likely requires `GAME_RULES_VERSION` bump.

---

## GP-RW03 - Safe route support and ward behavior

### Status
Done - Safe route now stamps defensive ward support and does not add route hazards.

### Priority
High

### Objective
Make Safe route visibly stabilize the next floor through ward/support cards, defensive rewards, hazard suppression, or objective-streak protection.

### Spec reference
[CARD_TYPES_HAZARDS_AND_PICKUPS.md](../gameplay-theory/CARD_TYPES_HAZARDS_AND_PICKUPS.md) - Safe cards; [PERKS_RELICS_MODIFIERS_AND_WORLD_INTERACTIONS.md](../gameplay-theory/PERKS_RELICS_MODIFIERS_AND_WORLD_INTERACTIONS.md) - Safe guardian and Lantern monk.

### Affected areas
- `src/shared/game.ts` - route support assignment and reward.
- `src/shared/contracts.ts` - safe support metadata if needed.
- `src/renderer/components/GameScreen.tsx`, `TileBoard*.tsx` - copy and markers.
- Unit tests for low-life/boss/trap contexts.

### Acceptance criteria
- Safe suppresses route-added hazards and adds a defensive route payoff.
- Safe support does not remove scheduled floor identity or boss pressure.
- Safe reward ceiling remains lower than Greed economy.
- Guard/life caps are respected.

### Dependencies
`GP-RW01`.

### Out of scope
Making Safe reduce every base mutator or pair count.

---

## GP-RW04 - Mystery route veils and fair reveal

### Status
Done - Mystery route now stamps deterministic veils; peek reveals veil families without claiming.

### Priority
High

### Objective
Make Mystery route add deterministic uncertainty via veiled card outcomes, reveal rules, and fair counterplay with peek/pin tools.

### Spec reference
[CARD_TYPES_HAZARDS_AND_PICKUPS.md](../gameplay-theory/CARD_TYPES_HAZARDS_AND_PICKUPS.md) - Mystery cards; [SYNERGY_AND_ANTI_SYNERGY_MATRIX.md](../gameplay-theory/SYNERGY_AND_ANTI_SYNERGY_MATRIX.md) - Mystery plus mutator and inventory matrices.

### Affected areas
- `src/shared/game.ts` - mystery outcome seed, reveal/claim resolution.
- `src/shared/contracts.ts` - veil metadata if needed.
- `src/renderer/components/TileBoard*.tsx`, `tileTextures.ts` - veil markers and revealed states.
- Tests for seed determinism and reveal-before-punishment.

### Acceptance criteria
- Mystery outcomes are deterministic from seed/profile.
- Peek can reveal veil family without claiming.
- Mystery never punishes a player before fair reveal or clear preview.
- Mystery remains bounded on `short_memorize`, `silhouette_twist`, and boss floors.

### Dependencies
`GP-RW01`, route action interaction policy from `GP-RW06`.

### Out of scope
Random unseeded outcomes or invisible lethal traps.

### Rules version note
Likely requires `GAME_RULES_VERSION` bump.

---

## GP-RW05 - Route-world copy surfaces

### Status
Done - route preview, shop copy, board banner, tile labels, and match floaters reflect route-world effects.

### Priority
High

### Objective
Expose route-world effects in player-facing copy: route preview, shop/interlude continue copy, floor banner, tile focus labels, reward floaters, and floor summary.

### Spec reference
[ROUTE_WORLD_PIPELINE.md](../gameplay-theory/ROUTE_WORLD_PIPELINE.md) - route lifecycle; [SYNERGY_AND_ANTI_SYNERGY_MATRIX.md](../gameplay-theory/SYNERGY_AND_ANTI_SYNERGY_MATRIX.md) - implementation priority 2.

### Affected areas
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/ShopScreen.tsx`
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/store/matchScorePop.ts`
- Copy tests and a11y assertions.

### Acceptance criteria
- Greed preview names added risk or extraction pressure.
- Safe preview names defensive/support payoff.
- Mystery preview names uncertainty and reveal/counterplay.
- Floor banner summarizes selected route-world profile.
- Destroyed/denied rewards are explained when relevant.

### Dependencies
Can begin after `GP-RW01`; should evolve with `GP-RW02`-`GP-RW04`.

### Out of scope
Final art or audio.

---

## GP-RW06 - Route card action interaction rules

### Status
Done - v1 policy is implemented for match, destroy, shuffle persistence, peek reveal, pin tracking, and stray denial/cleanup.

### Priority
High

### Objective
Formalize how route cards and future card families interact with match, mismatch, destroy, shuffle, peek, pin, and stray remove.

### Spec reference
[CARD_TYPES_HAZARDS_AND_PICKUPS.md](../gameplay-theory/CARD_TYPES_HAZARDS_AND_PICKUPS.md) - conflict rules and card-by-action interaction grid.

### Affected areas
- `src/shared/game.ts` - `applyDestroyPair`, `applyPeek`, shuffle paths, stray remove, match resolution.
- `src/shared/contracts.ts` - optional card state/metadata.
- `src/shared/game.test.ts` - action matrix fixtures.
- Codex/copy docs.

### Acceptance criteria
- Destroy denies route/findable rewards by default unless a future effect says otherwise.
- Shuffle moves tile-carried route effects unless a family explicitly breaks on shuffle.
- Peek reveals eligible card identity without claiming.
- Pin tracks position only and does not disarm hazards.
- Stray remove cannot remove completion-critical route/boss cards unless explicitly supported.

### Dependencies
Should be defined before `GP-RW07`.

### Out of scope
Adding every named card family.

---

## GP-RW07 - Named card family prototype pass

### Status
Done - Toll Cache, Fragile Cache, Lantern Ward, Secret Door, and Keystone Pair ship as deterministic route-card families.

### Priority
Medium

### Objective
Prototype a small set of named route card families from the theory roster: Toll Cache, Fragile Cache, Lantern Ward, Secret Door, and Keystone Pair.

### Spec reference
[CARD_TYPES_HAZARDS_AND_PICKUPS.md](../gameplay-theory/CARD_TYPES_HAZARDS_AND_PICKUPS.md) - expanded named card roster.

### Affected areas
- `src/shared/contracts.ts` - card family IDs if typed.
- `src/shared/game.ts` - assignment, resolution, denial.
- Renderer markers and tile texture keys.
- `src/shared/mechanics-encyclopedia.ts` if surfaced to Codex.

### Acceptance criteria
- Each prototype has route affinity, trigger, reward, penalty/risk, tool interaction, and fair copy.
- No prototype can make the board unwinnable.
- Each prototype has unit coverage for match and destroy behavior.
- Renderer distinguishes route identity from card family.

### Dependencies
`GP-RW01`, `GP-RW06`.

### Out of scope
Full roster: Fuse Cache, Parasite Purse, Glass Lure, Mirror Card, etc.

### Rules version note
Likely requires `GAME_RULES_VERSION` bump.

---

## GP-RW08 - Side-room route hooks

### Status
Functional - route choice opens deterministic side-room interludes for Safe, Greed, and Mystery before the next floor.

### Priority
Medium

### Objective
Connect route-world outcomes to side-room systems: shop, rest shrine, run events, treasure chest, secret shrine, and bonus cache.

### Spec reference
[ROUTE_WORLD_PIPELINE.md](../gameplay-theory/ROUTE_WORLD_PIPELINE.md) - side-room hooks; [SYNERGY_AND_ANTI_SYNERGY_MATRIX.md](../gameplay-theory/SYNERGY_AND_ANTI_SYNERGY_MATRIX.md) - route plus run-map node and bonus room matrices.

### Affected areas
- `src/shared/run-map.ts`
- `src/shared/run-events.ts`
- `src/shared/rest-shrine.ts`
- `src/shared/bonus-rewards.ts`
- Store routing/interlude UI.

### Acceptance criteria
- Greed can lead to richer shop/treasure/elite hooks with explicit risk.
- Safe can lead to rest/heal/guard support without becoming best economy.
- Mystery can lead to event/secret/veiled side-room hooks with deterministic outcomes.
- Bonus-room anti-grind limits remain respected.

### Dependencies
`GP-RW01`, route preview copy from `GP-RW05`.

### Out of scope
New online services or server-side RNG.

---

## GP-RW09 - Route-aware relic/perk weighting

### Status
Functional - relic drafts now read pending and active route context for weight-only route reasons.

### Priority
Medium

### Objective
Use route-world profile and next-floor pressure to bias relic/perk offers toward meaningful answers while avoiding dead or incompatible choices.

### Spec reference
[PERKS_RELICS_MODIFIERS_AND_WORLD_INTERACTIONS.md](../gameplay-theory/PERKS_RELICS_MODIFIERS_AND_WORLD_INTERACTIONS.md) - offer weighting ideas and build stories.

### Affected areas
- `src/shared/relics.ts` - draft context and contextual reasons.
- `src/shared/contracts.ts` - route profile input if needed.
- Relic draft UI reason copy.
- `relics.test.ts`.

### Acceptance criteria
- Greed pressure can increase weight/reasoning for guard, reveal, sustain, or parasite answers.
- Mystery pressure can increase weight/reasoning for peek, pin, search, or chapter tools.
- Safe context can prefer recovery/streak protection without overpaying economy.
- Existing contract filters for `noShuffle` and `noDestroy` still apply.

### Dependencies
`GP-RW01`.

### Out of scope
Guaranteeing perfect answers every draft.

---

## GP-RW10 - Boss/elite board anchors

### Status
Functional - Keystone Pair ships as a boss-floor route anchor; hard non-boss route floors now stamp Elite Cache, Final Ward, or Omen Seal anchors by route.

### Priority
Medium

### Objective
Give boss and elite route floors board-visible set-piece anchors such as Keystone Pair, Elite Cache, Pressure Seal, Final Ward, or Trophy Pair.

### Spec reference
[CARD_TYPES_HAZARDS_AND_PICKUPS.md](../gameplay-theory/CARD_TYPES_HAZARDS_AND_PICKUPS.md) - boss and elite cards; [ROUTE_WORLD_PIPELINE.md](../gameplay-theory/ROUTE_WORLD_PIPELINE.md) - interaction with floor schedule.

### Affected areas
- `src/shared/boss-encounters.ts`
- `src/shared/floor-mutator-schedule.ts`
- `src/shared/game.ts`
- HUD/floor banner and tile rendering.

### Acceptance criteria
- Boss/elite identity is visible on the board, not only in HUD.
- Boss/elite cards cannot block board completion.
- Safe, Greed, and Mystery each have distinct boss/elite treatment.
- Boss score/favor rewards remain capped and tested.

### Dependencies
`GP-RW01`, `GP-RW07` if reusing named card infrastructure.

### Out of scope
Final boss art, stingers, or cinematic presentation.

---

## GP-RW11 - Route synergy fixtures and regression matrix

### Status
Done - deterministic fixtures cover Safe, Greed, Mystery, named card rewards, peek reveal, keystone/elite stray denial, side-room claim/skip flow, and the route synergy matrix combinations.

### Priority
High

### Objective
Create deterministic fixtures and regression coverage for route-world combinations so Greed/Safe/Mystery stay distinct and do not create softlocks or invisible punishment.

### Spec reference
[SYNERGY_AND_ANTI_SYNERGY_MATRIX.md](../gameplay-theory/SYNERGY_AND_ANTI_SYNERGY_MATRIX.md) - test scenarios, danger budget examples, hard rules.

### Affected areas
- `src/shared/game.test.ts`
- `src/shared/floor-mutator-schedule.test.ts`
- Renderer route-card tests where visual metadata matters.
- Optional fixture helpers for scripted route picks.

### Acceptance criteria
- Same seed can compare Safe vs Greed vs Mystery board metadata.
- Greed into `treasure_gallery`, Greed into `trap_hall`, Safe into `rush_recall`, and Mystery into `survey_hall` are covered.
- Destroy-heavy pickup route denial is covered.
- Mystery reveal-before-punishment is covered.
- Board completion is asserted for route special combinations.

### Dependencies
Can start with `GP-RW01`; grows with all implementation tasks.

### Out of scope
Long balance simulation unless gameplay constants change enough to justify it.

---

## GP-RW12 - Catalog, Codex, and docs coverage

### Status
Functional - Codex, catalog, polish notes, and epic/task status now cover route-world cards, side rooms, route-aware relic weighting, boss/elite anchors, destroy denial, and peek reveal.

### Priority
Medium

### Objective
Keep route-world mechanics discoverable in the gameplay catalog, Codex, and docs as implementation lands.

### Spec reference
All route-world theory docs plus [epic-route-world-pipeline.md](../gameplay/epic-route-world-pipeline.md).

### Affected areas
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `docs/gameplay/GAMEPLAY_POLISH_AND_GAPS.md`
- `src/shared/mechanics-encyclopedia.ts`
- `src/shared/game-catalog.ts` if route-world entries are cataloged there.
- Relevant tests guarding catalog/encyclopedia drift.

### Acceptance criteria
- New route-world fields and card families are cataloged when implemented.
- Codex explains Safe, Greed, Mystery, destroy denial, peek reveal, and route reward rules.
- Gameplay epic and task status checkboxes stay in sync.
- No route-world rules exist only in code comments.

### Dependencies
Update continuously as `GP-RW01`-`GP-RW10` land.

### Out of scope
Player-facing tutorial rebuild.

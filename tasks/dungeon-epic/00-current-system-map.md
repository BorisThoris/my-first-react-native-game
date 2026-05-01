# Current Dungeon System Map

## Primary Source Areas
| Area | Current files |
| --- | --- |
| Shared contracts | `src/shared/contracts.ts` |
| Core rules | `src/shared/game.ts`, `src/shared/game-core.ts`, `src/shared/turn-resolution.ts` |
| Board generation | `src/shared/board-generation.ts`, dungeon assignment helpers inside `game.ts` |
| Dungeon API exports | `src/shared/dungeon-rules.ts`, `src/shared/route-rules.ts`, `src/shared/shop-rules.ts`, `src/shared/rest-shrine.ts`, `src/shared/run-events.ts` |
| Map and route state | `src/shared/run-map.ts`, `src/shared/route-world.ts` |
| Relics/objectives | `src/shared/relics.ts`, `src/shared/objective-rules.ts`, `src/shared/secondary-objectives.ts` |
| Renderer board | `src/renderer/components/TileBoard.tsx`, `src/renderer/components/TileBoardScene.tsx`, `src/renderer/components/GameScreen.tsx` |
| Store flow | `src/renderer/store/useAppStore.ts` |
| Tests | `src/shared/game.test.ts`, `src/shared/softlock-fairness.test.ts`, renderer component tests |

## Important Existing Concepts
- `RunState`: owns run mode, status, board, stats, relics, route state, shop state, dungeon counters, and timers.
- `BoardState`: owns floor, grid, tiles, objectives, exits, keys, levers, boss id, `enemyHazards`, and `enemyHazardTurn`.
- `Tile`: owns pair identity, visual label/state, findables, route specials, dungeon card kind/state/effect/HP, exit/room/key metadata.
- `DungeonCardKind`: `enemy`, `trap`, `treasure`, `shrine`, `gateway`, `key`, `lock`, `exit`, `lever`, `shop`, `room`.
- `EnemyHazardState`: moving board overlay with kind, label, current tile, next tile, pattern, state, damage, HP, and optional boss id.
- `DungeonObjectiveId`: `find_exit`, `open_bonus_exit`, `disarm_traps`, `defeat_boss`, `pacify_floor`, `claim_route`, `loot_cache`, `reveal_unknowns`.

## Current Strengths
- Deterministic board generation already exists.
- Dungeon card assignment is tied to floor tags, archetypes, node kinds, and route profile.
- Moving enemy hazards exist in data and render visibly in the current implementation.
- Shops, rooms, rest, events, bonus rewards, route-world profiles, and relic offers already have partial rule modules.
- Tests already cover many match/mismatch, dungeon, hazard, boss, and softlock scenarios.

## Current Gaps This Epic Should Close
- There is no single dungeon encounter contract that explains how card families compose.
- Enemies have data and visuals, but need full lifecycle tuning, boss phases, contact clarity, audio, and balance coverage.
- Rooms/shops/events/treasure exist but need a unified player-facing node and reward model.
- The run map needs clearer presentation, pacing, and route consequences.
- Economy pacing needs stronger simulation and exploit review.
- Codex/help language must track dungeon rules as systems deepen.
- QA needs a matrix that covers combinations of node kind, archetype, objective, mutator, relic, hazard, input mode, and viewport.

## Source Touchpoint Rules
- If adding a dungeon mechanic, inspect `contracts.ts`, `game.ts`, and the relevant module before editing.
- If changing run or save shape, plan `GAME_RULES_VERSION` and potentially `SAVE_SCHEMA_VERSION`.
- If changing generation, preserve seed determinism and replay compatibility.
- If changing completion rules, update softlock/fairness tests.
- If changing visible board state, update both WebGL and accessibility labels.


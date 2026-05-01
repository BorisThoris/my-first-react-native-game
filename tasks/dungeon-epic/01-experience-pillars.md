# Dungeon Experience Pillars

## Pillar 1: The Board Is The Room
The board is not an abstract puzzle surface. Every card can carry room meaning: a locked chest, a patrolling enemy, a trap, a shrine, a key, a door, a route anchor, or a treasure. Players should understand the dungeon through the board itself.

Acceptance signals:
- Dungeon card families are visually and textually distinct.
- Hidden information is fair and telegraphed.
- Matching remains the primary verb, but dungeon consequences make each match matter.

## Pillar 2: Threats Move, Warn, And Resolve
Enemies and hazards should feel alive without becoming twitch gameplay. Their current and next positions should be legible. Contact should be risky but understandable. Defeat should happen through clear match/combat rules and floor-clear cleanup.

Acceptance signals:
- Enemy current/next tiles are visible at a glance.
- Contact rules are consistent across mouse, touch, keyboard, and controller.
- Bosses have stronger identity than normal enemies.
- Reduced motion keeps all information without hover/bob effects.

## Pillar 3: Every Floor Has A Purpose
Floors should present a reason to care: find exit, disarm traps, claim treasure, defeat boss, pacify enemies, reveal unknowns, or survive a risky route. Objectives should be concise and honest.

Acceptance signals:
- Objective status can be computed from board state without special UI-only logic.
- Floor archetype and route node affect generation in a visible way.
- The player knows what completion requires.

## Pillar 4: Routes Create A Run Story
Safe, greed, mystery, shop, rest, treasure, event, combat, elite, and boss nodes should create meaningful decisions. The route map should say what risk and reward are coming without spoiling every tile.

Acceptance signals:
- Route choices alter node mix, card mix, reward mix, or pressure.
- The map and floor board agree.
- Between-floor flow is fast, readable, and not modal-heavy.

## Pillar 5: Rewards Build Identity
Relics, consumables, currencies, keys, services, and objectives should push runs toward recognizable builds. Rewards should not be random noise.

Acceptance signals:
- Relic archetypes have synergies with dungeon mechanics.
- Shops and rooms offer decisions, not just automatic value.
- Economy simulation catches runaway gain and starved runs.

## Pillar 6: Depth Is Local, Fair, And Testable
The product remains offline-first. Deep systems should be deterministic and testable. Hard cases must become tests, not tribal knowledge.

Acceptance signals:
- Seeds reproduce floor content.
- Save migration is explicit.
- Softlocks are rejected by tests.
- A combinatoric matrix exists for shipped dungeon features.


# Dungeon Epic Planning Pack

## Status
Active planning pack

## Purpose
This folder is the long-running dungeon refinement epic. It is designed for repeated agent sessions over 10+ full context runs. Each future run should be able to open this folder, choose the next viable ticket, implement it, verify it, update the ledger, and leave enough state for the next run.

This pack does not replace `tasks/refined-experience-gaps/`. It is a focused dungeon implementation layer that cross-links the existing REG backlog, especially `REG-069` through `REG-086`, `REG-087`, `REG-120`, and `REG-148` through `REG-160`.

## North Star
The final dungeon experience should feel like a complete offline-first roguelite memory-card dungeon:

- Every floor is a readable encounter, not just a grid of matching cards.
- The run map creates a journey with route pressure, shops, rest, events, treasure, elites, and bosses.
- Board cards carry dungeon meaning: enemies, traps, rooms, keys, locks, exits, treasure, shrines, and route anchors.
- Enemies live on the board through motion, threat, contact, telegraphy, damage, defeat, and floor-clear rules.
- Rewards build into run identity through relics, consumables, currency, objectives, and journal history.
- The game remains deterministic, local/offline, replayable by seed, and protected against softlocks.
- Mobile, keyboard, controller, reduced motion, screen reader, and lower graphics settings remain first-class.

## Non-Goals
- No mandatory online services, server anticheat, or competitive online leaderboards.
- No final licensed art requirement inside implementation tickets. Use placeholders per `REG-113`.
- No uncontrolled schema churn. Versioned rules/save changes must be explicit.
- No mechanics that cannot be explained in concise player-facing copy.

## How Future Runs Should Use This Pack
1. Read `03-execution-ledger.md` first.
2. Pick one ticket from `tickets/` that is unblocked and sized for the current context window.
3. Inspect the current source before editing.
4. Implement only the chosen ticket and its required immediate tests.
5. Run focused tests, then broader checks when risk justifies it.
6. Update `03-execution-ledger.md` with completed work, verification, blockers, and next recommended ticket.
7. Do not mark tickets complete unless acceptance criteria are satisfied.

## Core Documents
- `00-current-system-map.md` - current repo grounding.
- `01-experience-pillars.md` - player experience targets.
- `02-architecture-diagrams.md` - Mermaid diagrams and data-flow maps.
- `03-execution-ledger.md` - persistent handoff tracker.
- `04-balance-and-invariants.md` - rules, determinism, softlock, and balance constraints.

## Ticket Groups
| Range | Subsystem | Goal |
| --- | --- | --- |
| `DNG-001`-`DNG-005` | Foundation and contracts | Keep rules, saves, replay, and completion safe. |
| `DNG-010`-`DNG-015` | Run map and floor journey | Make the dungeon a navigable journey. |
| `DNG-020`-`DNG-025` | Board encounter system | Make every dungeon card family coherent. |
| `DNG-030`-`DNG-036` | Enemies and bosses | Make threats visible, fair, and memorable. |
| `DNG-040`-`DNG-045` | Rooms, shops, treasure, events | Add meaningful non-combat dungeon nodes. |
| `DNG-050`-`DNG-055` | Rewards, economy, builds | Give runs identity and pacing. |
| `DNG-060`-`DNG-065` | Presentation, audio, UX | Make dungeon state readable and satisfying. |
| `DNG-070`-`DNG-075` | QA and release readiness | Make the system testable and shippable. |

## First Recommended Path
Start with these before deep content expansion:

1. `DNG-001-dungeon-north-star-and-scope.md`
2. `DNG-002-runstate-boardstate-contract-audit.md`
3. `DNG-005-softlock-and-completion-invariants.md`
4. `DNG-020-dungeon-card-taxonomy.md`
5. `DNG-030-enemy-lifecycle-contract.md`
6. `DNG-010-route-map-player-facing-flow.md`
7. `DNG-070-combinatoric-test-matrix.md`

## Done Bar For The Epic
The dungeon epic is complete when:

- A full run can move through route selection, varied floor types, shops/rest/events/treasure, elites, and bosses.
- Board encounters combine memory matching with dungeon rules without hidden unfairness.
- Enemies and bosses have readable motion, threat, contact, damage, defeat, and reward loops.
- The economy and rewards support multiple run builds without farm exploits.
- The Codex/help surfaces explain every shipped dungeon mechanic.
- Determinism, save compatibility, softlock prevention, and test coverage are enforced.
- Mobile, desktop, reduced motion, keyboard, and controller paths are verified.


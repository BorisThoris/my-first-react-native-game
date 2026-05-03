# Gameplay Theorycrafting Epic

## Status
Theory passes complete; task-conversion backlog generated

## Purpose
This folder is a long-running design workspace for deep gameplay theorycrafting. It exists before implementation tickets. The job is to question whether the current systems are meaningful, visible, cohesive, and expandable, then turn only the best conclusions into later tasks.

This pack complements, but does not replace:

- `tasks/dungeon-epic/` for implemented dungeon systems.
- `tasks/refined-experience-gaps/` for established refinement tickets.
- `docs/BALANCE_NOTES.md` for shipped tuning notes.
- `src/shared/mechanics-encyclopedia.ts` for current player-facing mechanic definitions.

## North Star
The game should feel like a memory roguelite where every system changes how the player thinks:

- Matching remains the core skill.
- Cards create tactical decisions without hiding unfair rules.
- Powers are visible tools with clear costs, not buried state.
- Talents, traits, relics, mutators, and contracts create recognizable playstyles.
- Dungeon cards, objectives, floors, shops, and routes form a coherent journey.
- Every mechanic has a readable visual, sound, tooltip, Codex entry, and testable rule hook.

## Non-Goals
- No code implementation in this epic.
- No final balance numbers unless a pass needs rough ranges.
- No final art direction beyond placeholder and visualization contracts.
- No online services, server anticheat, or leaderboard dependency.
- No task conversion until a pass explicitly graduates a theory item.

## How Future Runs Should Use This Pack
1. Read `04-theory-pass-ledger.md`.
2. Use Pass 8 to convert mature theory into implementation seeds, or add a new pass only when a new design question appears.
3. Re-ground in current source before changing theory.
4. Add observations, candidate mechanics, risks, and task seeds.
5. Do not create implementation tickets until the idea passes the Pass 1 memory-tax gate and the quality gate below.
6. Update the ledger with what was learned and what should be explored next.

## Core Documents
- `00-current-system-map.md` - current source-grounded systems map.
- `01-design-pillars.md` - gameplay identity and design rules.
- `02-system-meaning-audit.md` - current meaning gaps and weak systems.
- `03-visualization-audit.md` - what is invisible or undercommunicated.
- `04-theory-pass-ledger.md` - persistent handoff log.
- `task-conversion/` - implementation-ready epics and task files generated from the completed theory passes.

## Theory Passes
| Pass | Topic | Goal |
| --- | --- | --- |
| `01-core-loop-depth.md` | Core loop | Protect memory skill while expanding tactics. |
| `02-talents-traits-relics.md` | Build systems | Decide what talents/traits mean and how relics evolve. |
| `03-powers-and-action-buttons.md` | Player actions | Make every action visible, usable, and meaningful. |
| `04-card-type-expansion.md` | Card families | Expand card behavior with counterplay and softlock safety. |
| `05-build-archetypes.md` | Playstyles | Turn upgrade piles into recognizable builds. |
| `06-floor-and-encounter-identity.md` | Run structure | Give floors, routes, rooms, shops, and bosses stronger identity. |
| `07-ui-and-feedback-language.md` | Presentation | Define how mechanics are seen, heard, and understood. |
| `08-expansion-backlog-seeds.md` | Task conversion | Convert matured theory into future task seeds only. |

## Idea Quality Gate
Every theory idea must answer:

- What player decision does this create?
- How is it seen before it matters?
- What existing system does it connect to?
- What can break, softlock, or become degenerate?
- What test or simulation would prove it later?

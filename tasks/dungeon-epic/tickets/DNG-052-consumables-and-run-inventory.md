# DNG-052: Consumables and run inventory

## Status
Done

## Priority
P1

## Subsystem
Rewards, economy, builds

## Depends on
- `DNG-050`
- `DNG-041`

## Current repo context
Inventory screen exists mostly as meta/read-only; run inventory concepts exist in planning.

## Problem
Dungeon shops, rooms, treasure, and events need a place to put one-shot items without confusing meta inventory.

## Target experience
Players can earn/buy/use a small set of run-only consumables with clear charges and toolbar/prompt support.

## Implementation notes
- Define run inventory shape separate from collection/meta inventory.
- Limit item count and effects for readability.
- Connect shop and treasure rewards to inventory.

## Acceptance criteria
- Run inventory state is visible during play when items exist.
- Consumables have deterministic effects and costs.
- Inventory clears or summarizes at run end.

## Tests and verification
- Unit tests for item gain/use.
- Renderer/store tests for item buttons.

## Risks and edge cases
- Risk: UI clutter. Mitigation: compact item dock only when inventory is non-empty.

## Cross-links
- `../../refined-experience-gaps/REG-079-run-inventory-consumable-and-loadout-model.md`
- `../../refined-experience-gaps/REG-153-run-inventory-runstate-invariants-and-ui-contract.md`

## Future handoff notes
Run inventory now includes dungeon keys and master keys beside charges, plus deterministic shared gain/use helpers for run-only consumables. Inventory UI surfaces key rows when present without mixing them into meta collection inventory.

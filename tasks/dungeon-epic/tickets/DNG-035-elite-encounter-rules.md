# DNG-035: Elite encounter rules

## Status
Done

## Priority
P1

## Subsystem
Enemies and bosses

## Depends on
- `DNG-011`
- `DNG-030`

## Current repo context
Elite node identity exists in planning and can influence encounter context.

## Problem
Elite encounters need a rule difference from normal combat and a reward difference from bosses.

## Target experience
Elites are optional high-pressure nodes with better rewards and no boss-floor scoring confusion.

## Implementation notes
- Define elite threat budget, enemy count, trap count, and reward premium.
- Keep elite route previews honest.
- Ensure elite rewards do not duplicate boss rewards.

## Acceptance criteria
- Elite floor generation differs from combat.
- Elite completion has distinct result copy.
- Elite is represented in balance simulation.

## Tests and verification
- Generation tests for elite node.
- Objective/reward tests for elite completion.

## Risks and edge cases
- Risk: elite becomes strictly optimal. Mitigation: route risk and reward simulation.

## Cross-links
- `../../refined-experience-gaps/REG-076-boss-elite-encounter-identity.md`
- `DNG-054`

## Future handoff notes
Implemented v1 elite rules through a shared selector, elite budget floors, pacify objective identity, and balance-simulation representation. Route map reward previews can still get richer copy in later UI tickets.

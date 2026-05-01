# DNG-031: Enemy movement patterns

## Status
Done

## Priority
P1

## Subsystem
Enemies and bosses

## Depends on
- `DNG-030`

## Current repo context
Existing patterns include patrol, stalk, guard, and observe with current/next tile ids.

## Problem
Movement patterns need clearer gameplay identities and fairness rules.

## Target experience
Players can infer enemy behavior: patrols rotate, stalkers pressure hidden cards, wardens guard loot, observers create boss-like tension.

## Implementation notes
- Added `ENEMY_HAZARD_PATTERN_DEFINITIONS` to document patrol, stalk, guard, and observe gameplay identity, selection priority, and telegraph copy.
- Added `getEnemyHazardMovementCandidateIds` as the shared inspectable selector for pattern target candidates.
- `observe` now has a distinct priority: boss/enemy/trap encounter cards before falling back to generic active cards.
- Tests cover pattern priorities and confirm matched/removed and singleton utility targets are excluded from candidate lists.

## Acceptance criteria
- Pattern behavior is deterministic and documented.
- Next target telegraph remains accurate.
- Movement cannot target invalid tiles.

## Tests and verification
- `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`
- `yarn typecheck`

## Risks and edge cases
- Risk: enemies chase too aggressively. Mitigation: cap movement to one advance per action/resolution.

## Cross-links
- `DNG-033`
- `DNG-036`

## Future handoff notes
Future tuning should adjust `ENEMY_HAZARD_PATTERN_DEFINITIONS` and `getEnemyHazardMovementCandidateIds` together so behavior and copy stay aligned.

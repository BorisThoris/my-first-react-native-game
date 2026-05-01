# DNG-043: Treasure cache and secret room

## Status
Done

## Priority
P1

## Subsystem
Rooms, shops, treasure, events

## Depends on
- `DNG-020`
- `DNG-050`

## Current repo context
Treasure, locked cache, bonus reward, and secret room concepts exist.

## Problem
Treasure rewards need clear gating and excitement without bloating economy.

## Target experience
Treasure nodes and cache cards are desirable, readable, and sometimes gated by keys, risk, or reveal mechanics.

## Implementation notes
- Define treasure tiers and locked/unlocked behavior.
- Connect keys/locks/exits to reward choices.
- Add secret room discovery and reward rules only when visible enough.

## Acceptance criteria
- Treasure reward source and claim condition are clear.
- Locked rewards explain required key/service.
- Secret rewards are deterministic and capped.

## Tests and verification
- Treasure and lock tests.
- Balance simulation reward distribution.

## Risks and edge cases
- Risk: key without lock or lock without key. Mitigation: generation invariant tests.

## Cross-links
- `../../refined-experience-gaps/REG-075-treasure-chest-secret-room-and-bonus-rewards.md`
- `DNG-045`

## Future handoff notes
Implemented v1 treasure reward definitions/read model for treasure, cache, supply, lock cache, locked cache room, and secret door sources. Key/lock generation hardening remains in `DNG-045`.

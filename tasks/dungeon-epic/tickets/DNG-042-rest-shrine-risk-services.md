# DNG-042: Rest shrine risk services

## Status
Done

## Priority
P1

## Subsystem
Rooms, shops, treasure, events

## Depends on
- `DNG-011`
- `DNG-050`

## Current repo context
Rest shrine service helpers exist.

## Problem
Rest nodes should be more than automatic healing, but must not create exploit loops.

## Target experience
Rest offers recovery and optional risk services: heal, guard, cleanse, sacrifice for reward, or prepare for boss.

## Implementation notes
- Define service rows and costs.
- Limit repeat use per node.
- Ensure services are previewed on route/map and recorded in run history.

## Acceptance criteria
- Rest services are deterministic and bounded.
- Healing cannot exceed defined caps.
- Risk services have clear downside and cannot softlock.

## Tests and verification
- Unit tests for each service.
- Balance tests for recovery frequency.

## Risks and edge cases
- Risk: infinite recovery. Mitigation: per-node one-shot state and cost caps.

## Cross-links
- `../../refined-experience-gaps/REG-073-rest-shrine-heal-and-risk-services.md`
- `DNG-055`

## Future handoff notes
Implemented v1 bounded rest shrine service rows for heal, guard, Favor bargain, and boss prep, with affordability/read-model coverage and one-shot purchase guards. Route-map presentation can reuse the read model in later UI work.

# DNG-045: Locked doors, keys, and exits

## Status
Done

## Priority
P0

## Subsystem
Rooms, shops, treasure, events

## Depends on
- `DNG-005`
- `DNG-024`

## Current repo context
Exit tiles, keys, locks, levers, and activation prompts already exist.

## Problem
Locks and exits are high-risk for softlocks and unclear player goals.

## Target experience
The player always knows whether the exit is open, locked, requires a key/lever, or blocked by an objective.

## Implementation notes
- Define lock kinds and key sources.
- Ensure generation creates reachable key/lever routes.
- Keep exit activation state stable across pause/resume and overlays.

## Acceptance criteria
- Every locked exit has a reachable unlock path or intentional locked-state copy.
- Key/lever counters cannot go negative.
- Exit activation participates in completion correctly.

## Tests and verification
- Generation tests for locked exits.
- Activation tests for key, master key, lever, and blocked boss objective.

## Risks and edge cases
- Risk: exit opens before objective completion. Mitigation: shared exit status selector.

## Cross-links
- `DNG-005`
- `DNG-024`

## Future handoff notes
Implemented P0 hardening for defeat-boss exits backed by boss card pairs as well as moving boss patrols. Existing key/master/lever activation tests remain green; future lock variants should extend the shared exit status selector first.

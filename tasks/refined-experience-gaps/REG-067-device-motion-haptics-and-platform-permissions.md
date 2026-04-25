# REG-067: Device Motion Haptics And Platform Permissions

## Status
Open

## Priority
P2

## Area
Systems

## Evidence
- `src/renderer/platformTilt/`
- `src/renderer/components/StartupIntro.tsx`
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/tileFieldTilt.ts`
- `docs/new_design/TASKS/TASKS_PERFORMANCE_GRAPHICS.md`
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`

## Problem
Device motion and possible haptics can add polish on touch devices, but they also introduce permission prompts, motion sensitivity concerns, platform inconsistencies, and performance risk.

## Target Experience
Motion and haptics should be optional polish. They should never block gameplay, surprise players, or conflict with reduced motion and accessibility settings.

## Suggested Implementation
- Define supported platforms for device tilt and haptics.
- Gate permission prompts behind clear user action and copy.
- Tie motion behavior to `Settings.reduceMotion` and any future motion preferences.
- Add haptics only if the runtime has safe APIs and graceful no-op behavior.
- Store new preferences in `Settings` with `SAVE_SCHEMA_VERSION` only if persistence shape changes.

## Acceptance Criteria
- Device motion permission is requested only when useful and user-initiated.
- Reduced motion disables or simplifies tilt effects.
- Unsupported platforms degrade silently or with clear optional copy.
- Haptics never carry essential game feedback alone.

## Verification
- Manual test desktop, touch browser, and reduced-motion behavior.
- Unit test pure tilt policy helpers.
- Capture permission CTA states where applicable.

## Cross-links
- `REG-029-input-accessibility-and-controller-comfort.md`
- `REG-034-startup-intro-hydration-and-skip-contract.md`
- `REG-031-performance-graphics-real-device-pass.md`

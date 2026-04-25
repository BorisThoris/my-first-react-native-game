# REG-038: Music Loop And Adaptive Audio Depth

## Status
Open

## Priority
P2

## Area
Systems

## Evidence
- `src/renderer/audio/gameplayMusic.ts`
- `src/renderer/assets/audio/music/`
- `docs/AUDIO_ASSET_INVENTORY.md`
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`
- `src/renderer/store/useAppStore.ts`

## Problem
Menu and run loops exist, but the audio layer does not yet sell run tension, floor identity, relic moments, or late-run pressure. Premium puzzle games often rely on audio identity as part of their appeal.

## Target Experience
Music should support the run arc: calm menu, tension during memorize/play, stronger pressure during gauntlet or boss floors, and clear release after floor clear or game over.

## Suggested Implementation
- Define a small adaptive music state model using current view, `RunState.status`, floor tag, active mutators, and gauntlet pressure.
- Add crossfade or intensity layers only after current loops are stable.
- Keep music preferences in `Settings`.
- Avoid syncing gameplay rules to audio state; audio should observe `RunState`, not own it.
- Document loop authoring, seamlessness expectations, and fallback behavior.

## Acceptance Criteria
- Menu and run loops transition without abrupt volume jumps.
- Floor clear, pause, and game over do not leave stale music playing.
- Adaptive layers, if added, are optional and volume-controlled.
- Low-power and hidden-window behavior is defined.

## Verification
- Manual playtest menu to run, pause/resume, floor clear, game over, and app backgrounding.
- Unit test any pure audio state resolver.
- Packaged build audio smoke.

## Cross-links
- `REG-037-audio-identity-mix-and-callsite-coverage.md`
- `REG-043-pause-timer-resume-and-interruption-contract.md`
- `REG-050-wild-gauntlet-meditation-mode-identity.md`

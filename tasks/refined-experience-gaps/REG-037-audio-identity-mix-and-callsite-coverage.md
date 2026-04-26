# REG-037: Audio Identity Mix And Callsite Coverage

## Status
Done

## Priority
P1

## Area
Systems

## Evidence
- `src/renderer/audio/gameSfx.ts`
- `src/renderer/audio/uiSfx.ts`
- `src/renderer/audio/sampledSfx.ts`
- `docs/AUDIO_INTERACTION_MATRIX.md`
- `docs/AUDIO_ASSET_INVENTORY.md`
- `src/renderer/assets/audio/`

## Problem
Audio exists, but the final mix and callsite coverage need a product pass. Some cues share reference material, some exported cues are easy to miss, and the app needs a consistent identity across UI, gameplay, relics, floor clear, failure, and achievements.

## Target Experience
Every major interaction should have an intentional sound role. The mix should be readable, non-fatiguing, and aligned with visual feedback without becoming noisy.

## Suggested Implementation
- Audit every interaction in `AUDIO_INTERACTION_MATRIX.md` against actual call sites.
- Confirm missing or shared cues are intentional.
- Define loudness, trim, cooldown, and simultaneous one-shot limits.
- Add manual packaged-build audio checks for autoplay and OS device edge cases.
- Keep volume settings under `Settings`; add no new schema unless new persisted audio preferences ship.

## Acceptance Criteria
- Audio matrix and runtime call sites agree.
- Repeated card flips, score pops, toasts, and UI browsing do not overload the mix.
- Reduced motion does not accidentally remove essential non-motion feedback.
- Sampled and procedural fallback paths are both verified.

## Verification
- Run audio unit tests.
- Manually test menu, Choose Path, settings, gameplay, relic draft, floor clear, pause, and game over.
- Capture a short audio QA note for packaged desktop build.

## Cross-links
- `REG-012-card-materials-and-interaction-fx.md`
- `REG-038-music-loop-and-adaptive-audio-depth.md`
- `docs/AUDIO_INTERACTION_MATRIX.md`

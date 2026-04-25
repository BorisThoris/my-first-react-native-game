# REG-059: Asset Pipeline Rights Attribution And Drop-In Readiness

## Status
Open

## Priority
P1

## Area
Systems

## Evidence
- `src/renderer/assets/`
- `scripts/card-pipeline/`
- `scripts/audio-pipeline/`
- `docs/new_design/ASSET_AND_ART_PIPELINE.md`
- `docs/new_design/DROP_IN_ASSET_CHECKLIST.md`
- `docs/AUDIO_ASSET_INVENTORY.md`

## Problem
Final polish depends on art, card, audio, logo, and store assets. The repo needs a rigorous drop-in and rights process so new assets do not create broken imports, oversized files, or unclear licensing.

## Target Experience
Artists, bots, and developers should know where assets go, what sizes/formats are accepted, how to verify imports, and what attribution or rights notes are required.

## Suggested Implementation
- Audit asset source docs for UI art, card textures, mode posters, audio, logo, and store assets.
- Add drop-in requirements: dimensions, formats, optimization, naming, manifests, and fallback behavior.
- Track rights and attribution for generated, licensed, legacy, and placeholder assets.
- Ensure build scripts and asset barrels fail clearly when files are missing.
- Coordinate final card themes with `Settings` and `SaveData` only when theme selection ships.

## Acceptance Criteria
- Every major asset category has an authoritative source and drop-in path.
- Missing assets produce clear build or fallback behavior.
- Rights/attribution status is documented for shipped assets.
- Visual baseline refresh is required after final asset swaps.

## Verification
- Run renderer build after asset changes.
- Run asset audit script if applicable.
- Capture affected screens and compare against reference.

## Cross-links
- `REG-013-brand-logo-and-mode-art.md`
- `REG-066-card-theme-system-and-theme-economy.md`
- `REG-061-steam-store-screenshots-trailer-and-capsule-readiness.md`

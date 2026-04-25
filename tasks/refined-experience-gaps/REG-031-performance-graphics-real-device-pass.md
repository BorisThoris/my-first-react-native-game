# REG-031: Performance Graphics Real Device Pass

## Status
Open

## Priority
P1

## Area
QA

## Evidence
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/PlayingCard.tsx`
- `src/renderer/components/*.module.css`
- `src/renderer/audio/`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`

## Problem
WebGL, bloom, DPR, Pixi or canvas effects, CSS effects, and mobile quality presets need verification on constrained devices. A visually richer game can regress responsiveness if effects are tuned only on a development desktop.

## Target Experience
The game should feel smooth on reasonable mobile and low-power desktop devices. Visual quality should degrade gracefully through settings or automatic presets without breaking readability.

## Suggested Implementation
- Inventory expensive effects: shadows, blurs, bloom, particles, canvas/WebGL layers, animated backgrounds, and card transitions.
- Add performance presets under `Settings`: low, balanced, high, or auto.
- Clamp DPR and particle density on mobile or low-power devices.
- Track frame time during card flips, overlays, and floor-clear effects.
- Persist graphics preset in `Settings`; use `SAVE_SCHEMA_VERSION` only if settings persistence shape changes.

## Acceptance Criteria
- Core gameplay remains responsive during rapid card interactions and overlays.
- Low preset visibly reduces expensive effects while preserving readability.
- Mobile devices do not render unnecessary high-DPR effects by default.
- Performance settings are understandable and reversible.

## Verification
- Test on at least one low-power or throttled device profile.
- Use browser performance tooling for gameplay, overlays, and menu scenes.
- Capture screenshots for low, balanced, and high presets.

## Cross-links
- `REG-012-card-materials-and-interaction-fx.md`
- `REG-020-mutator-chapter-identity.md`
- `REG-028-mobile-short-viewport-regression-hardening.md`

# REG-013: Brand Logo And Mode Art

## Status
Open

## Priority
P2

## Area
UI

## Evidence
- `src/renderer/components/MainMenu.tsx`
- `src/renderer/components/ChooseYourPathScreen.tsx`
- `src/renderer/assets/`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `docs/new_design/TASKS/TASKS_META_AND_SHELL.md`

## Problem
The final wordmark, crest, menu art, and mode posters are not at reference quality. The app can be functional but still feel temporary if branding and mode identity remain underdeveloped.

## Target Experience
The game should have a strong first-viewport identity. The logo, crest, menu artwork, and mode posters should make modes feel authored and collectible rather than generic menu entries.

## Suggested Implementation
- Define final art direction for wordmark, crest, menu background, and mode poster system.
- Add mode-specific artwork hooks to the mode library where needed.
- Keep artwork responsive and avoid obscuring navigation.
- Prefer real bitmap or generated assets for hero/menu art where appropriate.
- If mode art becomes data-driven, extend `RunModeDefinition` with stable asset references.

## Acceptance Criteria
- Main menu includes final or production-intent brand treatment.
- Choose Path mode cards have consistent poster or emblem treatment.
- Assets are optimized for desktop and mobile without blurry scaling.
- Missing art has deliberate fallback states.

## Verification
- Capture main menu and Choose Path on phone and desktop.
- Check asset sizes, loading, and high-DPI rendering.
- Verify fallback behavior when a mode has no custom art.

## Cross-links
- `REG-009-main-menu-mobile-landscape-density.md`
- `REG-010-choose-path-discoverability.md`
- `REG-014-design-system-dead-space-audit.md`

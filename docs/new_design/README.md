# New Design Package

## Purpose
This package turns the two reference images below into an implementation-ready redesign spec for the active desktop renderer UI.

Source images:
- `docs/ENDPRODUCTIMAGE.png`
- `docs/ENDPRODUCTIMAGE2.png`

This package is intentionally docs-only. It does not change runtime behavior, app state, or shared contracts. Its job is to make later design and engineering work decision-complete.

## What This Package Covers
- Gameplay shell
- Top HUD detail panel
- In-game sidebar panel
- Card states panel
- Interaction FX panel
- Palette and typography panel
- Main menu
- Settings
- Choose-your-path mode selection
- Current app gaps versus the references
- Asset and art dependencies
- A dependency-safe implementation backlog

## Reading Order
1. `REFERENCE_IMAGE_AUDIT.md`
2. `COMPONENT_CATALOG.md`
3. `VISUAL_SYSTEM_SPEC.md`
4. `CURRENT_VS_TARGET_GAP_ANALYSIS.md`
5. `SCREEN_SPEC_MAIN_MENU.md`
6. `SCREEN_SPEC_GAMEPLAY.md`
7. `SCREEN_SPEC_SETTINGS.md`
8. `SCREEN_SPEC_MODE_SELECTION.md`
9. `ASSET_AND_ART_PIPELINE.md`
10. `MOTION_AND_STATE_SPEC.md`
11. `IMPLEMENTATION_SEQUENCE.md`
12. `TASKS/README.md`

## Package Map
- `REFERENCE_IMAGE_AUDIT.md`
  - Screenshot-grounded decomposition of every visible panel and screen.
- `COMPONENT_CATALOG.md`
  - Canonical reusable component inventory, screen matrix, and state matrix.
- `VISUAL_SYSTEM_SPEC.md`
  - Shared palette, type, materials, spacing, iconography, lighting, and framing rules.
- `CURRENT_VS_TARGET_GAP_ANALYSIS.md`
  - Current renderer mapping plus missing routes, models, and assets.
- `SCREEN_SPEC_MAIN_MENU.md`
  - Main menu target composition and IA treatment.
- `SCREEN_SPEC_GAMEPLAY.md`
  - Gameplay shell, HUD, board chrome, sidebar, and overlays.
- `SCREEN_SPEC_SETTINGS.md`
  - Settings shell, category system, and current-settings mapping.
- `SCREEN_SPEC_MODE_SELECTION.md`
  - Choose-your-path surface and navigation implications.
- `ASSET_AND_ART_PIPELINE.md`
  - Required art categories, file conventions, and fallback behavior.
- `MOTION_AND_STATE_SPEC.md`
  - Motion language and interactive state rules.
- `IMPLEMENTATION_SEQUENCE.md`
  - Recommended rollout order for later implementation work.
- `TASKS/`
  - Discrete implementation task specs with dependencies and acceptance criteria.

## Definitions
### Restylable Existing Surface
A live screen or component already exists in the active renderer and can keep its current responsibility while being visually rebuilt.

Examples:
- `MainMenu`
- `GameScreen`
- `SettingsScreen`
- `GameOverScreen`
- `OverlayModal`

### Structurally Mismatched Surface
A live screen exists, but its information architecture, layout, or component composition does not match the reference closely enough for a simple restyle.

Examples:
- The current menu exposes many run modes directly, while the reference uses a curated hero flow.
- The current settings screen is form-like, while the reference uses a category-shell layout.

### Mockup-Only Screen
A screen or destination is visible in the references but is not present in the current live app.

Examples:
- `Choose Your Path`
- `Collection`
- `Inventory`
- `Codex`

### Shared Primitive
A reusable presentational building block that should be implemented once and reused across screens.

Examples:
- Framed button
- Icon capsule
- Title bar
- Segmented control
- Status card
- Ornamental panel

### Asset Dependency
A redesign requirement that cannot be solved by layout and CSS alone.

Examples:
- Painted background scene
- Logo lockup
- Card back art
- Icon family
- Font files

## Normalized Assumptions
- Use `docs/new_design/` for the package root.
- Include every visible surface from both reference images, even if the current app does not yet support it.
- Keep the package implementation-oriented and screenshot-grounded.
- Do not silently assume mockup-only controls are already supported by current models or routes.
- Prefer shared primitives over one-off per-screen styling decisions.

## Current Code Areas This Package Maps To
- `src/renderer/App.tsx`
- `src/renderer/styles/theme.ts`
- `src/renderer/styles/global.css`
- `src/renderer/ui/*`
- `src/renderer/components/MainMenu.tsx`
- `src/renderer/components/MainMenuBackground.tsx`
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/SettingsScreen.tsx`
- `src/renderer/components/GameOverScreen.tsx`
- `src/renderer/components/OverlayModal.tsx`
- `src/shared/contracts.ts`
- `e2e/visualScenarioSteps.ts`

## Implementation Order Summary
1. Theme foundation and asset pipeline
2. Shared UI primitives
3. Main menu redesign
4. Gameplay HUD and shell redesign
5. Card-state and FX redesign
6. Settings shell redesign
7. Mode-selection IA and routing decisions
8. Gap-surface handling and visual regression refresh

## Notes
- This package does not mix gameplay balance work into the redesign.
- It records future contract and routing changes where literal fidelity would require them.
- It is acceptable for later implementation to stage placeholder art, but the placeholder policy must follow `ASSET_AND_ART_PIPELINE.md`.

# REG-014: Design System Dead Space Audit

## Status
Open

## Priority
P0

## Area
UI

## Evidence
- `src/renderer/components/*.module.css`
- `src/renderer/styles/`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `docs/new_design/TASKS/`
- `test-results/visual-screens/`

## Problem
Panels, cards, gaps, and shell chrome vary by screen, and some surfaces carry more padding or framing than their content deserves. This creates disconnected UI density and makes high-value game state compete with empty space.

## Target Experience
The app should use consistent spacing, panel, card, and shell rules that feel dense enough for a game while preserving clarity and touch comfort.

## Suggested Implementation
- Inventory shell, panel, card, toolbar, modal, and list spacing tokens.
- Define viewport-aware density tiers for phone, tablet, desktop, and short desktop.
- Remove nested card patterns where sections can be unframed layouts.
- Normalize border radius, elevation, panel padding, and list gaps across major screens.
- Keep component-level exceptions documented when a screen has a special gameplay need.

## Acceptance Criteria
- Main menu, Choose Path, gameplay, settings, overlays, and meta screens share coherent density rules.
- Dead space is reduced without making mobile touch targets cramped.
- Components no longer rely on one-off spacing values where a shared token fits.
- Screenshots show a consistent shell language.

## Verification
- Capture the major screen set before and after the density pass.
- Inspect CSS for repeated one-off gap, padding, and max-width values.
- Run visual smoke coverage across desktop and mobile.

## Cross-links
- `REG-001-mobile-gameplay-hud-board-ratio.md`
- `REG-002-desktop-gameplay-stage-dead-space.md`
- `REG-009-main-menu-mobile-landscape-density.md`
- `REG-027-visual-baseline-refresh.md`

# Task 003: Finish Mobile Settings Responsive Layout Across Portrait And Landscape

## Status

Completed

## Priority

Medium

## Problem

The portrait mobile settings layouts were improved, but short-height phone landscape still falls back to the desktop-style settings layout. The footer CTA treatment, single-column stacking, and mobile spacing only key off width, so `844x390` still renders the page and run-settings modal in a two-column desktop layout with small right-aligned actions.

## Evidence

- `src/renderer/components/SettingsScreen.tsx`
- `src/renderer/components/SettingsScreen.module.css`
- `test-results/visual-screens/mobile/03-settings-page.png`
- `test-results/visual-screens/mobile/06-run-settings-modal.png`
- follow-up audit at `390x600`
- manual audit at `844x390`

## Current Behavior

- Portrait mobile now stretches the footer action container correctly.
- Short-height landscape still keeps the two-column settings grid.
- Short-height landscape still keeps small right-aligned `Back` and `Save` buttons in both the page and modal presentations.
- The responsive settings treatment is inconsistent between portrait mobile and short-height landscape mobile.

## Desired Outcome

- Mobile settings actions read as clear bottom CTAs.
- Both page and modal presentations use the same responsive footer behavior.
- Buttons feel intentional on small screens.
- Short-height phone landscape is treated as a mobile layout, not a desktop layout.

## Suggested Implementation

- Extend the responsive settings layout rules to short-height mobile landscape, not just narrow widths.
- Collapse the settings grid to a single column when height is constrained enough that the desktop two-column layout reads cramped.
- Make the footer action container expand to full available width in both page and modal presentations for short-height landscape too.
- Keep spacing and stacking consistent between settings page and run settings modal.
- Re-check `390x844`, `390x600`, and `844x390`.

## Acceptance Criteria

- On `390x844`, `Back` and `Save` span the panel width in the settings page.
- On `390x844`, `Back` and `Save` span the dialog width in the run settings modal.
- On `390x600`, the footer still fits without clipping or overlap.
- On `844x390`, the settings page uses the mobile layout treatment rather than the desktop two-column layout.
- On `844x390`, `Back` and `Save` span the panel width in the settings page.
- On `844x390`, the run settings modal uses the mobile layout treatment rather than the desktop two-column layout.
- On `844x390`, `Back` and `Save` span the dialog width in the run settings modal.
- Touch targets remain at least the current effective size.

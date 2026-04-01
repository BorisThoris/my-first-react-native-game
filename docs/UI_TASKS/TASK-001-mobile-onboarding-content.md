# Task 001: Restore Real Onboarding Content On Tight Mobile Viewports

## Status

Completed

## Priority

High

## Problem

On tight mobile viewports, the `How To Play` card collapses to a label plus dismiss button and removes all instructional content. At the same time, the record panel is hidden while the onboarding card is present, which leaves first-run mobile users with almost no usable onboarding.

## Evidence

- `src/renderer/components/MainMenu.tsx`
- `src/renderer/components/MainMenu.module.css`
- `test-results/visual-screens/mobile/02-main-menu-howto.png`
- `mobile-landscape-menu.png`

## Current Behavior

- Tight mode is triggered at `width <= 430` or `height <= 620`.
- Tight mode renders only the compact header for the guide card.
- The record/last-run panel is suppressed while the tight onboarding card is shown.

## Desired Outcome

- First-run mobile users still get actual onboarding guidance.
- The compact version is short, but not empty.
- The layout remains readable in portrait and landscape phone sizes.

## Suggested Implementation

- Keep a condensed instructional summary visible in `isTight` mode.
- Preserve at least one or two gameplay rules in the tight card.
- Re-evaluate whether the record panel should stay hidden when the compact onboarding card is active.
- Avoid fixed-height clipping that truncates the remaining copy.

## Acceptance Criteria

- On `390x844`, the onboarding card includes meaningful instructional text.
- On `390x600`, the onboarding card includes meaningful instructional text without clipping.
- On `844x390`, the onboarding card includes meaningful instructional text without overlapping the hero actions.
- First-run users can understand the core loop without dismissing the card blindly.
- Add or update automated coverage for the tight onboarding state.

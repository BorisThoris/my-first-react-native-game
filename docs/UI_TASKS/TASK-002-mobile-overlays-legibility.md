# Task 002: Improve Mobile Overlay Legibility

## Status

Completed

## Priority

Medium

## Problem

Pause and floor-clear overlays are structurally responsive, but visually weak on phones because the modal container is intentionally transparent. The title, subtitle, and actions sit directly over the active board and HUD, which reduces hierarchy and readability.

## Evidence

- `src/renderer/components/OverlayModal.tsx`
- `src/renderer/components/OverlayModal.module.css`
- `test-results/visual-screens/mobile/05-pause-modal.png`
- `test-results/visual-screens/mobile/07-floor-cleared-modal.png`

## Current Behavior

- The backdrop exists, but the modal itself has no visible surface, border, or shadow.
- On narrow screens, the underlying HUD and board compete with modal content.
- The interruption state reads more like floating text than a modal.

## Desired Outcome

- Overlay content reads as a distinct foreground layer on mobile.
- Text and actions remain immediately legible over the board.
- The design keeps the current visual language instead of switching to a generic sheet.

## Suggested Implementation

- Add a subtle modal surface on mobile, or increase separation between text/actions and the gameplay layer.
- Tune background, border, blur, shadow, or content width to improve contrast.
- Verify both pause and floor-clear states after the change.

## Acceptance Criteria

- Pause modal content is visually separated from the board at `390x844`.
- Floor-clear modal content is visually separated from the board at `390x844`.
- Modal actions remain easy to scan and tap on phone portrait.
- No horizontal overflow is introduced.
- Update visual coverage for the affected mobile modal states if needed.

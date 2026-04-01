# Task 005: Add Mobile Landscape Regression Coverage

## Status

Completed

## Priority

Medium

## Problem

The current automated visual coverage does not include a mobile landscape viewport. That left a real short-height landscape settings issue uncaught even after the portrait mobile fixes were implemented.

## Evidence

- `e2e/visualScreenHelpers.ts`
- `e2e/visual-screens.spec.ts`
- follow-up mobile audit at `844x390`

## Current Behavior

- The visual viewport set includes portrait mobile, tablet, and desktop only.
- The screenshot suite validates mobile portrait states but does not render mobile landscape states.
- Landscape-only regressions can pass the current visual suite unnoticed.

## Desired Outcome

- Short-height mobile landscape is part of the normal renderer regression surface.
- The most important landscape UI states are visually captured and easy to inspect after changes.

## Suggested Implementation

- Add a mobile-landscape viewport, using `844x390` or the team’s preferred short-height phone landscape size.
- Include the same critical screen set already used for portrait mobile:
  - main menu
  - main menu with onboarding
  - settings page
  - game playing
  - pause modal
  - run settings modal
- Keep horizontal overflow assertions enabled for that viewport too.

## Acceptance Criteria

- The visual helper viewport list includes a short-height mobile landscape entry.
- `visual-screens.spec.ts` generates captures for that landscape viewport.
- Settings page and run settings modal are both covered in mobile landscape.
- Future mobile landscape layout regressions are catchable from routine screenshot review.

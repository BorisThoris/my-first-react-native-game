# Task 004: Remove Desktop-Only Copy From Mobile Settings

## Status

Completed

## Priority

Low

## Problem

The mobile-responsive settings page still labels itself `Desktop Settings`, which makes the mobile path feel like a fallback rather than a deliberate UI.

## Evidence

- `src/renderer/components/SettingsScreen.tsx`
- `test-results/visual-screens/mobile/03-settings-page.png`

## Current Behavior

- Page presentation uses the title `Desktop Settings`.
- Modal presentation uses the title `Run Settings`.
- The title does not adapt to the device context.

## Desired Outcome

- Settings copy matches the responsive UI being shown.
- The page title feels platform-neutral unless there is a strong reason to keep desktop-specific wording.

## Suggested Implementation

- Rename the page title to something neutral such as `Settings` or `Preferences`.
- Re-check any tests or snapshots that assert the old string.

## Acceptance Criteria

- Mobile settings no longer display the phrase `Desktop Settings`.
- The updated title is consistent with the rest of the renderer UI.
- Tests are updated if they currently assert the old copy.

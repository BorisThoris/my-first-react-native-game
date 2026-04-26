# REG-042: Notification Toast Score Pop Hierarchy

## Status
Done

## Priority
P1

## Area
UI

## Evidence
- `packages/notifications/src/NotificationHost.tsx`
- `packages/notifications/src/notificationStore.ts`
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/GameScreen.module.css`
- `docs/new_design/TASKS/TASKS_OVERLAYS_FTUE.md`
- `docs/new_design/TASKS/TASKS_A11Y_I18N_E2E.md`

## Problem
Generic notifications, achievement toasts, score pops, mismatch floaters, save notices, and overlay messages can compete for attention. On mobile, the hierarchy can become noisy or collide with gameplay.

## Target Experience
Each transient message type should have a clear role. Score pops belong near the board, achievements deserve a distinct celebratory surface, and system/save errors should be readable without hiding the game.

## Suggested Implementation
- Define notification lanes: board score, gameplay warning, achievement, system save/Steam, and modal confirmation.
- Add collision rules and stack limits per lane.
- Ensure screen reader live regions are not spammed by rapid gameplay events.
- Keep visual z-index aligned with overlay rules.
- Store no new data unless notification preferences become part of `Settings`.

## Acceptance Criteria
- Achievements, score pops, and save errors do not overlap in mobile gameplay.
- Error notifications remain dismissible and keyboard reachable.
- Screen reader announcements are polite or assertive according to severity.
- Rapid matches do not flood the notification stack.

## Verification
- Unit test notification store stacking if behavior changes.
- Play through achievements, save error, score pops, mismatch, pause, and floor clear.
- Run a11y toast/game-over and overlay smoke specs.

## Cross-links
- `REG-008-overlays-mobile-height-and-hierarchy.md`
- `REG-039-achievement-surface-steam-offline-recovery.md`
- `REG-029-input-accessibility-and-controller-comfort.md`

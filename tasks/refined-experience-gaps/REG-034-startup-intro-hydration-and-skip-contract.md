# REG-034: Startup Intro Hydration And Skip Contract

## Status
Done

## Priority
P1

## Area
UI

## Evidence
- `src/renderer/App.tsx`
- `src/renderer/components/StartupIntro.tsx`
- `src/renderer/components/StartupIntro.module.css`
- `src/renderer/components/startupIntroConfig.ts`
- `e2e/startupIntroHelpers.ts`
- `docs/new_design/TASKS/TASKS_A11Y_I18N_E2E.md`

## Problem
The startup intro is visually rich but sits on a fragile boundary: app hydration, asset loading, WebGL fallback, skip input, focus trapping, and main-menu pointer blocking. If any piece drifts, the first player impression can become a stuck or confusing boot flow.

## Target Experience
The intro should feel premium and reliable. Players can skip quickly, keyboard users never get trapped, assets can load slowly without a dead screen, and hydration never flashes the wrong interactive view.

## Suggested Implementation
- Define a single startup contract for hydration, intro visibility, skip states, focus return, and pointer blocking.
- Add explicit loading and skip-pending states that remain readable on slow asset loads.
- Keep fallback mode honest when WebGL or intro textures fail.
- Add e2e coverage for keyboard skip, pointer skip, reduced motion, WebGL fallback, and hydration timing.
- If intro dismissal becomes persistent, store it under `SaveData` or `Settings` and bump `SAVE_SCHEMA_VERSION`.

## Acceptance Criteria
- Pressing Enter, Escape, Space, or pointer/touch reliably starts skip.
- Slow assets show a clear pending state and still complete.
- Focus returns to the menu root after intro completion.
- The main menu is not clickable underneath the intro.

## Verification
- Run startup intro component tests and the targeted e2e startup spec.
- Capture startup intro on desktop, phone portrait, and reduced motion.
- Manually test WebGL-disabled fallback.

## Cross-links
- `REG-027-visual-baseline-refresh.md`
- `REG-057-webgl-context-loss-and-dom-fallback-recovery.md`
- `docs/new_design/TASKS/TASKS_A11Y_I18N_E2E.md`

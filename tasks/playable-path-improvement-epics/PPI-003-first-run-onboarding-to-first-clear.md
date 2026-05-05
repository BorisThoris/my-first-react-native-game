# PPI-003: First-run onboarding to first clear

## Status
Done

## Priority
P0

## Area
Onboarding / first-run UX

## Evidence
- `e2e/playable-path-interludes.spec.ts`
- `src/renderer/components/GameScreen.tsx`
- `src/shared/playable-onboarding.ts`
- `tasks/refined-experience-gaps/REG-026-playable-onboarding.md`
- `tasks/refined-experience-gaps/REG-088-playable-first-run-to-first-win-campaign.md`

## Problem
The app can start from a fresh profile, show help, reach the first playable board, and clear floor 1. However, the specific `playable-onboarding-prompt` was not stable enough to assert directly, so the guidance contract is weaker than the first-run gameplay contract.

## Target Experience
A new player sees concise guidance at the moment it matters, can clear the first floor without reading a manual, and does not see first-run guidance repeat after it is completed or dismissed.

## Suggested Implementation
- Define the exact first-run guidance state machine: menu help, Choose Path entry, first board prompt, first match/miss guidance, floor-clear explanation, and persistence after reload.
- Add stable test IDs or accessible labels only where the UI already intends to expose durable player-facing guidance.
- Keep guidance lightweight and dismissible; do not block board play unless a specific tutorial step requires it.
- Add a reload assertion that first-run completion state persists.

## Acceptance Criteria
- Fresh-profile E2E asserts first-run help, first playable board, first clear, and no repeated onboarding after reload.
- Onboarding prompt visibility is deterministic or intentionally removed from the E2E contract.
- Guidance does not cover key board controls or make the board unplayable on mobile/short viewports.

## Verification
- `yarn playwright test e2e/playable-path-interludes.spec.ts --workers=1 -g "fresh profile"`
- `yarn test src/shared/playable-onboarding.test.ts`
- Focused renderer/component tests if prompt lifecycle changes.

## Placeholder and asset contract
No new final art required. Use existing prompt and help-center styling.

## Cross-links
- `../refined-experience-gaps/REG-026-playable-onboarding.md`
- `../refined-experience-gaps/REG-088-playable-first-run-to-first-win-campaign.md`
- `../refined-experience-gaps/REG-098-first-run-onboarding-and-help-center-ui.md`

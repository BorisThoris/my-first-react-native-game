# REG-058: Dev Sandbox Fixtures And Story State Matrix

## Status
Done

## Priority
P2

## Area
QA

## Evidence
- `src/renderer/dev/`
- `src/renderer/store/useAppStore.ts`
- `e2e/visualScenarioSteps.ts`
- `docs/new_design/TASKS/TASKS_HUD_PARITY.md`
- `docs/refinement-tasks/REF-043.md`
- `docs/refinement-tasks/REF-044.md`

## Problem
Visual and state-heavy work needs reproducible fixtures. Current dev sandboxes exist, but the refined backlog will benefit from a broader matrix of run, HUD, overlay, achievement, save failure, and device states.

## Target Experience
Developers and bots should be able to open deterministic states for design review and tests without playing into each edge case manually.

## Suggested Implementation
- Define fixture groups: fresh menu, advanced profile, active run, high-floor run, all overlays, game over, save failure, achievement unlock, WebGL fallback, and each mode.
- Keep fixtures typed and resettable.
- Avoid fixture-only logic leaking into production paths.
- Add visual scenario coverage only for states that matter to regression.
- If fixtures need saved data, use normalized `SaveData` factories.

## Acceptance Criteria
- Major `REG-*` UI tasks have a deterministic fixture or scenario.
- Fixture state matches shared contracts and migrations.
- Bots can run targeted captures without manual setup.
- Dev-only code is gated and not shipped as player-facing UI.

## Verification
- Run dev fixture tests if added.
- Run targeted Playwright visual scenarios for fixture states.
- Confirm production build excludes or safely gates dev-only entry points.

## Cross-links
- `REG-027-visual-baseline-refresh.md`
- `REG-033-bot-handoff-sequencing-and-dependency-map.md`
- `REG-062-e2e-flake-budget-and-ci-visual-sharding.md`

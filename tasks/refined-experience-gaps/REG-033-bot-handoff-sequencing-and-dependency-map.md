# REG-033: Bot Handoff Sequencing And Dependency Map

## Status
Open

## Priority
P0

## Area
QA

## Evidence
- `tasks/refined-experience-gaps/README.md`
- `tasks/refined-experience-gaps/REG-001-mobile-gameplay-hud-board-ratio.md`
- `tasks/refined-experience-gaps/REG-024-economy-unification.md`
- `tasks/refined-experience-gaps/REG-027-visual-baseline-refresh.md`
- `docs/new_design/TASKS/TASKS_CROSSCUTTING.md`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`

## Problem
The refined-experience backlog is large enough that a long-running bot can waste time by starting dependent tasks out of order, duplicating completed `GP-*` or `PLAY-*` work, or mixing schema-heavy systems with visual-only work in the same batch.

## Target Experience
The bot should receive a clear execution map: what to do first, what can run in parallel, what requires schema/version decisions, and what should wait for product choices.

## Suggested Implementation
- Use [`REG-IMPLEMENTATION-ORDER-AND-PHASES.md`](REG-IMPLEMENTATION-ORDER-AND-PHASES.md) as the **live execution map**: each `REG-000`…`REG-160` has a **primary implementation phase (1–7)**, **Track A/B** in Phase 3, and bookend rules (`REG-068` / `REG-087` / `REG-088` / `REG-089` before unbounded `REG-069`+). **Phase order** is: **4** full UI and shell, **5** hardening, **6** `REG-120`+ (except `REG-129` in **7**), **7** release and packaging (including `REG-115`–`REG-119`).
- Build a dependency map across all `REG-*` tasks (this file; the map above is the maintained column view).
- Mark tasks as lanes: P0 stabilization, UI density, gameplay systems, economy/schema, release platform, and long-term v2.
- Group tasks by safe parallelism and likely write scopes.
- Flag schema/version tasks that may touch `SaveData`, `PlayerStatsPersisted`, `RunState`, `Settings`, `RunModeDefinition`, `GAME_RULES_VERSION`, or `SAVE_SCHEMA_VERSION`.
- Add a bot handoff note that points to existing `REF-*`, `GP-*`, `PLAY-*`, `A11Y-*`, and `PERF-*` docs instead of re-auditing from scratch.

## Acceptance Criteria
- A long-running bot can select the first ten tasks without guessing priority or dependencies.
- P0 tasks are ordered before broad P1/P2 expansion.
- Schema/version tasks are isolated from pure UI polish tasks.
- Existing completed docs are linked as references, not treated as new implementation scope.

## Verification
- Review the task index and confirm all `REG-*` entries have a dependency lane.
- Run `git status --short` after the handoff update.
- No unit tests are required unless this task later becomes an automated dependency checker.

## Cross-links
- `README.md`
- `REG-IMPLEMENTATION-ORDER-AND-PHASES.md` (suggested phasing, tracks, and per-ID primary phase)
- `REG-024-economy-unification.md`
- `REG-027-visual-baseline-refresh.md`
- `REG-062-e2e-flake-budget-and-ci-visual-sharding.md`

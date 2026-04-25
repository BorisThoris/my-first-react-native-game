# REG-068: Complete product definition of done

## Status
Open

## Priority
P0

## Area
QA

## Evidence
- `tasks/refined-experience-gaps/README.md`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `tasks/refined-experience-gaps/REG-033-bot-handoff-sequencing-and-dependency-map.md`
- `tasks/refined-experience-gaps/REG-015-shop-and-run-currency-system.md`
- `tasks/refined-experience-gaps/REG-024-economy-unification.md`
- `docs/gameplay-tasks/`
- `docs/new_design/TASKS/`

## Problem
Exit criteria, ship gate, and acceptance rubric for a finished premium product (offline-first) need to stay **one** place teams cite for “are we there yet,” instead of re-deriving the bar from dozens of `REG-*` lines. Overlap with economy, save, and shell tickets is normal; this ticket is the **synthesis** of the bar, not a duplicate implementation spec.

**“Fully refined”** for the current product means meeting the in-scope table below. It does **not** mean shipping **online** leaderboards, server-backed accounts, or other **online** services in this phase.

## Target Experience
**In scope (this ship):**

| Area | Bar |
| --- | --- |
| **Mobile / responsive UI** | First-class: touch, short viewports, device grid, one-hand and overlay comfort — as covered by `REG-001`, `REG-006`–`REG-010`, `REG-028`, `REG-090`–`REG-104`, `REG-102`–`REG-103`, and related `REG` tickets. |
| **Desktop / shell** | Main menu, Choose Path, meta screens, settings, gameplay shell at the same “quality or better” standard. |
| **Gameplay and meta** | Per remaining `REG` priorities: depth, anti-softlock, first-run to first win, performance, save trust, audio/mix, feature readiness. |
| **Release** | Steam/local packaging and checklists in `REG-060` / `REG-061` / `REG-118` where applicable. |

**Out of scope (this phase):** competitive **online** leaderboards, real-time or server-backed **online** services, and **mandatory online** features — see `REG-052-leaderboards-trust-model-and-online-deferral.md` and `docs/LEADERBOARDS_DEFERRAL.md`. **Product-approved deferral,** not a vague backlog “maybe.”

## Suggested Implementation
- Cross-link prior REG and `GP-*` work; avoid duplicating large bodies. Prefer a thin implementation plan with explicit `SaveData` / `RunState` / `Settings` / `TelemetryPayload` / `RunExportPayload` / `AchievementUnlockResult` / `DesktopApi` / IPC / version bump touchpoints when relevant.
- Sequence with `REG-033`: finish P0 definition-of-done (`REG-068`) and anti-softlock (`REG-087`) before large economy expansions, unless a spike proves feasibility first.
- For version or schedule surfaces, name `GAME_RULES_VERSION`, `SAVE_SCHEMA_VERSION`, and `FLOOR_SCHEDULE_RULES_VERSION` in acceptance notes where migrations apply. Reference `RelicId`, `MutatorId`, and `FindableKind` when catalog or board content changes.
- Preserve Steam and telemetry **deferral** patterns from existing tasks; do not add mandatory online services in acceptance criteria. **Fully refined** acceptance must **not** require **online** rankings or server APIs for this ship.
- Align the written definition of done with `README.md` **Current product scope (refinement bar)** (mobile UI in, online out for this phase).
- When product agrees, **P0 “ship trust”** may explicitly name fourth-wave gates such as [`REG-130`](REG-130-release-candidate-gate-roles-and-signoff.md) (RC roles and signoff), combinatoric coverage in [`REG-120`](REG-120-mechanics-combinatoric-matrix-and-coverage.md), and negative/fault depth in [`REG-125`](REG-125-negative-test-and-fault-injection-suite.md) — all **offline**-scoped; they do **not** add mandatory **online** services in this phase (`REG-052`).

## Acceptance Criteria
- This document’s scope is resolvable as one or more implementation PRs with clear verification, without requiring final licensed assets in this pass.
- The **in / out** table in **Target Experience** is the authoritative scope split: **mobile UI and full shell/gameplay quality are required** for “fully refined”; **online** features in **Out of scope** are not acceptance blockers and remain covered only by `REG-052` in a later phase.
- Links to related REG tasks are present and the overlap with `REG-015`–`REG-021`, `REG-040`–`REG-043`, and `REG-052` is acknowledged where relevant.
- The **Placeholder and asset contract (placeholderNeeded)** section states either **Not applicable** or required slots and fallbacks.

## Verification
- File includes: Status, Priority, Area, Evidence, Problem, Target Experience, Suggested Implementation, Acceptance Criteria, Verification, **Placeholder and asset contract (placeholderNeeded)**, and **Cross-links**.
- `git status --short` for implementation work is scoped and reviewable.
- No schema change is *required* by this markdown-only definition; implementation work follows separately.

## Placeholder and asset contract (placeholderNeeded)
- **Not applicable** for shippable new art, audio, trailer, capsule, or poster deliverables in this task’s planning scope. If implementation implies UI, use existing in-product frames, procedural audio fallbacks, and placeholder copy per `REG-113` until owners supply finals. The implementation bot does not generate or license final marketing art.

## Cross-links
- `README.md` (see **Current product scope (refinement bar)**)
- `REG-033-bot-handoff-sequencing-and-dependency-map.md`
- `REG-068-complete-product-definition-of-done.md`
- `REG-119-bot-batch-plan-and-product-acceptance-report.md`
- `REG-120-mechanics-combinatoric-matrix-and-coverage.md` (optional fourth-wave gate reference)
- `REG-130-release-candidate-gate-roles-and-signoff.md` (optional fourth-wave gate reference)
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

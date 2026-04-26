# REG-119: Bot batch plan and product acceptance report

## Status
Done

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
**Bot** **batch** **plan** and **product** **acceptance** **report** — how long-running **implementation** passes close `REG-068` with evidence, tying `REG-033` to **what** the bot must prove. This is the **close-out** document for the third-wave program.

## Target Experience
Relevant UI and data paths meet the **Choose Path or better** bar on phone and desktop, with trustable local saves. Competitive **online** leaderboards and mandatory **online** services remain **out of scope** for v1 per `REG-052` and the README refinement bar — local/offline first.

## Suggested Implementation
- Reference `REG-033` bot sequencing, P0 `REG-068` / `REG-087`, and **offline**-appropriate artifacts (`REG-030` for local logs if used).
- Define **acceptance** rubric and owner sign-off; `REG-052` for anything that looks like **online** proof.

## Acceptance Criteria
- This document’s scope is resolvable as one or more implementation PRs with clear verification, without requiring final licensed assets in this pass.
- Links to related REG tasks are present and the overlap with `REG-015`–`REG-021`, `REG-040`–`REG-043`, and `REG-052` is acknowledged where relevant.
- The **Placeholder and asset contract (placeholderNeeded)** section states either **Not applicable** or required slots and fallbacks.

## Verification
- File includes: Status, Priority, Area, Evidence, Problem, Target Experience, Suggested Implementation, Acceptance Criteria, Verification, **Placeholder and asset contract (placeholderNeeded)**, and **Cross-links**.
- `git status --short` for implementation work is scoped and reviewable.
- No schema change is *required* by this markdown-only definition; implementation work follows separately.

## Placeholder and asset contract (placeholderNeeded)
- **Not applicable** for shippable new art, audio, trailer, capsule, or poster deliverables in this task’s planning scope. If implementation implies UI, use existing in-product frames, procedural audio fallbacks, and placeholder copy per `REG-113` until owners supply finals. The implementation bot does not generate or license final marketing art.

## Cross-links
- `README.md`
- `REG-033-bot-handoff-sequencing-and-dependency-map.md`
- `REG-068-complete-product-definition-of-done.md`
- `REG-119-bot-batch-plan-and-product-acceptance-report.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

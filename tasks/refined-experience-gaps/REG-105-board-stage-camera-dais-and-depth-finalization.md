# REG-105: Board stage camera dais and depth finalization

## Status
Open

## Priority
P0

## Area
UI

## Evidence
- `tasks/refined-experience-gaps/README.md`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `tasks/refined-experience-gaps/REG-033-bot-handoff-sequencing-and-dependency-map.md`
- `tasks/refined-experience-gaps/REG-015-shop-and-run-currency-system.md`
- `tasks/refined-experience-gaps/REG-024-economy-unification.md`
- `docs/gameplay-tasks/`
- `docs/new_design/TASKS/`

## Problem
**Board** **stage** **camera** **dais** and **depth** finalization (parallax, framing, 3D/WebGL) so the read is stable across DPR and aspect — builds on `REG-002` / `REG-004` board focus and `REG-112` motion.

## Target Experience
Relevant UI and data paths meet the **Choose Path or better** bar on phone and desktop, with trustable local saves. Competitive **online** leaderboards and mandatory **online** services remain **out of scope** for v1 per `REG-052` and the README refinement bar — local/offline first.

## Suggested Implementation
- Tie to WebGL / Pixi in `src/renderer` and `REG-003` / `REG-031` performance; `REG-111` (input latency); **reduce motion** per `REG-112`.

## Acceptance Criteria
- This document’s scope is resolvable as one or more implementation PRs with clear verification, without requiring final licensed assets in this pass.
- Links to related REG tasks are present and the overlap with `REG-015`–`REG-021`, `REG-040`–`REG-043`, and `REG-052` is acknowledged where relevant.
- The **Placeholder and asset contract (placeholderNeeded)** section states either **Not applicable** or required slots and fallbacks.

## Verification
- File includes: Status, Priority, Area, Evidence, Problem, Target Experience, Suggested Implementation, Acceptance Criteria, Verification, **Placeholder and asset contract (placeholderNeeded)**, and **Cross-links**.
- `git status --short` for implementation work is scoped and reviewable.
- No schema change is *required* by this markdown-only definition; implementation work follows separately.

## Placeholder and asset contract (placeholderNeeded)
- **Slots (planning):** list icon sizes, key art, audio stingers, and store media required for ship quality.
- **Fallbacks (allowed):** reuse existing in-game frames, `silence` / procedural SFX, solid panels, and placeholder copy.
- **Bot constraint:** the implementation agent must not generate or license final shippable art, audio, or legal text; it wires placeholders and documents acceptance slots only.

## Cross-links
- `README.md`
- `REG-033-bot-handoff-sequencing-and-dependency-map.md`
- `REG-068-complete-product-definition-of-done.md`
- `REG-119-bot-batch-plan-and-product-acceptance-report.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

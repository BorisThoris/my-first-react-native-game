# REG-155: Secondary objectives and result tags (deep contract)

## Status
Open

## Priority
P0

## Area
Gameplay

## Evidence
- `tasks/refined-experience-gaps/README.md` — *Current product scope (refinement bar)*
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `docs/gameplay/epic-scoring-objectives.md`
- `docs/gameplay-tasks/GP-SECONDARY-OBJECTIVES.md`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`
- `src/shared/game.ts` — *`LevelResult` tags, featured objectives, finalize*
- `tasks/refined-experience-gaps/REG-048-secondary-objectives-bonus-clarity.md` — *earlier surface*
- `tasks/refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md` — *fifth wave hazard anchor*
- `tasks/refined-experience-gaps/REG-156-relic-mutator-synergy-exploits-balance.md` — *fifth wave bookend*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
`GP-SECONDARY-OBJECTIVES` and the **epic** docs describe player-facing goals; `LevelResult` and HUD tags must stay **1:1** with implementation for **scholar / glass / cursed / flip par / boss** style bonuses. Drift confuses run history and `REG-119` acceptance. **Fifth wave (ultra-deep gameplay):** a **deep contract** listing tag names, display rules, and board edge cases (decoy, gambit) with a single **source** pointer.

## Target Experience
Copy, results screen, and export/journal (see [`REG-085`](REG-085-run-history-build-replay-and-journal.md)) agree on what “earned” means. **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** Contract doc + test/bot expectations; not re-authoring all `GP-*` text.

## Suggested Implementation
- Reconcile `GP-SECONDARY-OBJECTIVES.md` with `epic-scoring-objectives.md` and `isFeaturedObjectiveCompleted` behavior in `game.ts`.
- Cross-link [`REG-149`](REG-149-glass-decoy-witness-scholar-cursed-interaction-matrix.md) and [`REG-150`](REG-150-pair-resolution-timeline-gambit-wild-cursed.md) where tag timing matters.

## Acceptance Criteria
- **Tag / objective contract** is traceable to code symbols or test cases; at least one **gap** or **done** is stated explicitly.
- **Online** is not a shipping dependency for v1.
- **Placeholder and asset contract (placeholderNeeded)** is filled.

## Verification
- File includes: Status, Priority, Area, Evidence, Problem, Target Experience, Suggested Implementation, Acceptance Criteria, Verification, **Placeholder and asset contract (placeholderNeeded)**, and **Cross-links**.
- `git status --short` for implementation is scoped; markdown-only in this pass for new files.

## Placeholder and asset contract (placeholderNeeded)
- **Not applicable** for shippable new art, audio, trailer, capsule, or poster deliverables in this task’s planning scope. If implementation implies UI, use existing in-product frames, procedural audio fallbacks, and placeholder copy per `REG-113` until owners supply finals. The implementation bot does not generate or license final marketing art.

## Cross-links
- `README.md`
- `REG-000-audit-method-and-priority-map.md`
- `REG-048-secondary-objectives-bonus-clarity.md`
- `REG-085-run-history-build-replay-and-journal.md`
- `REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `REG-148-hazard-and-trap-vocabulary.md`
- `REG-149-glass-decoy-witness-scholar-cursed-interaction-matrix.md`
- `REG-150-pair-resolution-timeline-gambit-wild-cursed.md`
- `REG-156-relic-mutator-synergy-exploits-balance.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

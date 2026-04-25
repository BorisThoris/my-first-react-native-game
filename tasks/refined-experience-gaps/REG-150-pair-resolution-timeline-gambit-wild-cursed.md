# REG-150: Pair resolution timeline (gambit, wild, cursed)

## Status
Open

## Priority
P0

## Area
Gameplay

## Evidence
- `tasks/refined-experience-gaps/README.md` — *Current product scope (refinement bar)*
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `docs/gameplay/epic-core-memory-loop.md`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`
- `src/shared/game.ts` — *flip resolution, gambit, wild, mismatch paths*
- `tasks/refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- `tasks/refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md` — *fifth wave hazard anchor*
- `tasks/refined-experience-gaps/REG-156-relic-mutator-synergy-exploits-balance.md` — *fifth wave bookend*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
**Resolution order** (two-flip vs gambit, wild pairing rules, cursed/anchor behavior) is implemented in `game.ts` but not summarized as a **single timeline** a new engineer can follow. **Fifth wave (ultra-deep gameplay):** document the ordered phases from flip input through match/mismatch resolution and per-floor state updates, with entry points (function names or sections) to avoid 100% file churn reads.

## Target Experience
Onboarding and code review can cite one narrative (“timeline doc”) to trace a contested floor. `GAME_RULES_VERSION` bumps that touch resolution are easier to reason about. **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** Doc-quality flow, not a rewrite of `game.ts` in this task.

## Suggested Implementation
- Produce a **timeline** section (sequence diagram in markdown or mermaid) living under `docs/gameplay/` or linked from this ticket; keep it **updated** when `GAME_RULES_VERSION` changes affect resolution.
- Cross-link [`REG-149`](REG-149-glass-decoy-witness-scholar-cursed-interaction-matrix.md) and [`REG-041`](REG-041-run-export-replay-seed-integrity.md) (replay must match the same order).
- Name wild/decoy/Peek/Destroy/Shuffle **gates** as they apply in the timeline.

## Acceptance Criteria
- A new engineer can **trace one contested floor** using only this ticket’s linked doc plus targeted `game.ts` jumps (stated in the doc), without reading the entire file.
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
- `REG-041-run-export-replay-seed-integrity.md`
- `REG-068-complete-product-definition-of-done.md`
- `REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- `REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `REG-148-hazard-and-trap-vocabulary.md`
- `REG-149-glass-decoy-witness-scholar-cursed-interaction-matrix.md`
- `REG-156-relic-mutator-synergy-exploits-balance.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

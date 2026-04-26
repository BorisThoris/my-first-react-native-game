# REG-149: Glass decoy, witness, scholar, cursed interaction matrix

## Status
Done

## Priority
P0

## Area
Gameplay

## Evidence
- `tasks/refined-experience-gaps/README.md` — *Current product scope (refinement bar)*
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`
- `src/shared/game.ts` — *pair resolution, `DECOY_PAIR_KEY`, objectives, `finalizeLevel`*
- `src/shared/game.test.ts` — *decoy, board complete, floor archetypes*
- `src/shared/floor-mutator-schedule.ts` — *`FEATURED_OBJECTIVE_HUD_TOOLTIPS`, `glass_witness`*
- `tasks/refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- `tasks/refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md` — *fifth wave hazard anchor*
- `tasks/refined-experience-gaps/REG-156-relic-mutator-synergy-exploits-balance.md` — *fifth wave bookend*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
**Glass witness**, **scholar style**, **cursed last**, **flip par**, and **decoy** mismatches interact in subtle ways; without a **written matrix**, regressions and unfair states are found late. **Fifth wave (ultra-deep gameplay):** enumerate interactions (mismatch, gambit, destroy, shuffle, peek) and map them to test cases in `game.test.ts` and future bot coverage.

## Target Experience
A new engineer can answer “what happens on this floor?” for `trap_hall` + `glass_witness` + `glass_floor` without reading all of `game.ts`. **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** Matrix rows/columns, P0 edge cases, and links to existing tests; gaps become follow-up `GP-*` or implementation PRs.

## Suggested Implementation
- Build the matrix under `docs/gameplay/` or a short appendix referenced from this ticket; keep **single source of truth** pointers to `tilesArePairMatch`, `isBoardComplete`, and objective tags on `LevelResult`.
- Cross-link [`REG-148`](REG-148-hazard-and-trap-vocabulary.md), [`REG-150`](REG-150-pair-resolution-timeline-gambit-wild-cursed.md), [`REG-087`](REG-087-anti-softlock-fairness-and-edge-case-suite.md), and [`REG-120`](REG-120-mechanics-combinatoric-matrix-and-coverage.md).
- Add or extend unit tests for any **newly named** edge case that is not already covered.

## Acceptance Criteria
- The matrix is **checkable** (pass/fail per cell or explicit N/A) and references **evidence** files above.
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
- `REG-068-complete-product-definition-of-done.md`
- `REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- `REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `REG-148-hazard-and-trap-vocabulary.md`
- `REG-150-pair-resolution-timeline-gambit-wild-cursed.md`
- `REG-156-relic-mutator-synergy-exploits-balance.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

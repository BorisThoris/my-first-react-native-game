# REG-159: Hazard tile objective and balance matrix

## Status
Done

## Priority
P0

## Area
Gameplay

## Evidence
- `tasks/refined-experience-gaps/README.md` — *Current product scope (refinement bar)*
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `docs/gameplay-tasks/GP-SECONDARY-OBJECTIVES.md`
- `src/shared/contracts.ts` — *`FeaturedObjectiveId`, `LevelResult`*
- `tasks/refined-experience-gaps/REG-149-glass-decoy-witness-scholar-cursed-interaction-matrix.md`
- `tasks/refined-experience-gaps/REG-155-secondary-objectives-and-tags-deep-contract.md`
- `tasks/refined-experience-gaps/REG-086-balance-simulation-economy-and-drop-rate-tuning.md`
- `tasks/refined-experience-gaps/REG-156-relic-mutator-synergy-exploits-balance.md`
- `tasks/refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md`
- `tasks/refined-experience-gaps/REG-157-hazard-tile-type-taxonomy-and-outcomes.md` — *sixth wave taxonomy anchor*
- `tasks/refined-experience-gaps/REG-160-hazard-tile-ui-a11y-and-telegraphy.md` — *sixth wave bookend*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
Each **hazard tile kind** in [`REG-157`](REG-157-hazard-tile-type-taxonomy-and-outcomes.md) can **forfeit or preserve** `scholar_style`, `glass_witness`, `cursed_last`, `flip_par`, and findable bonuses. Without a **matrix**, balance and `LevelResult` tags disagree with player expectations. Ties to economy sim and exploit review ([`REG-086`](REG-086-balance-simulation-economy-and-drop-rate-tuning.md), [`REG-156`](REG-156-relic-mutator-synergy-exploits-balance.md)) need a single pass.

## Target Experience
For each **shippable** hazard type, the matrix states **objective** impact (forfeit / preserve / special case) and **scoring** hooks. Optional: gate some hazards to **`trap_hall`** or a **mutator** until tuned. **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** Checkable matrix rows — not full numeric tuning in this task.

## Suggested Implementation
- Cross-link [`REG-158`](REG-158-hazard-tile-engine-hooks-and-invariants.md) (what can happen) and [`REG-155`](REG-155-secondary-objectives-and-tags-deep-contract.md) (tags).
- For each hazard family (penalty / reward / dual), add columns for `FeaturedObjectiveId` and **findables** where relevant.
- List **P0** degenerate cases (e.g. auto-shuffle + scholar) and intended **product** outcome.

## Acceptance Criteria
- **Matrix** exists (or a deferred list with reasons); overlaps with `REG-149` / `REG-155` are **referenced**, not duplicated wholesale.
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
- `REG-049-secondary-objectives-bonus-clarity.md`
- `REG-086-balance-simulation-economy-and-drop-rate-tuning.md`
- `REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `REG-155-secondary-objectives-and-tags-deep-contract.md`
- `REG-156-relic-mutator-synergy-exploits-balance.md`
- `REG-157-hazard-tile-type-taxonomy-and-outcomes.md`
- `REG-158-hazard-tile-engine-hooks-and-invariants.md`
- `REG-160-hazard-tile-ui-a11y-and-telegraphy.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

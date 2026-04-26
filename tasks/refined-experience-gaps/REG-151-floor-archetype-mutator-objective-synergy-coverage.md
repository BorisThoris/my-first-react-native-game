# REG-151: Floor archetype, mutator, and featured objective synergy coverage

## Status
Done

## Priority
P0

## Area
Gameplay

## Evidence
- `tasks/refined-experience-gaps/README.md` — *Current product scope (refinement bar)*
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `docs/gameplay-tasks/GP-FLOOR-SCHEDULE.md`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`
- `src/shared/floor-mutator-schedule.ts` — *`FLOOR_SCHEDULE_RULES_VERSION`, `FloorScheduleEntry`, `trap_hall`*
- `src/shared/contracts.ts` — *`FloorArchetypeId`, `MutatorId`, `FeaturedObjectiveId`*
- `tasks/refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- `tasks/refined-experience-gaps/REG-120-mechanics-combinatoric-matrix-and-coverage.md` — *combinatoric anchor*
- `tasks/refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md` — *fifth wave hazard anchor*
- `tasks/refined-experience-gaps/REG-156-relic-mutator-synergy-exploits-balance.md` — *fifth wave bookend*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
`trap_hall` and other **`FloorArchetypeId`** entries interact with **mutator** stacks and **`FeaturedObjectiveId`** (e.g. `glass_witness`). Schedule rows are data-heavy; some combinations are **unfun** or **untested**. **Fifth wave (ultra-deep gameplay):** define a **coverage matrix** and priority tiers (must-play vs rare vs banned-by-design) for archetype × mutator × objective, tied to `FLOOR_SCHEDULE_RULES_VERSION` bump policy.

## Target Experience
QA and design can see which triples are **ship-critical**, which need bot smoke, and which are explicitly excluded. Ties to [`REG-120`](REG-120-mechanics-combinatoric-matrix-and-coverage.md) for process. **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** `trap_hall` depth first; generalize the table pattern to other archetypes.

## Suggested Implementation
- Cross-link the matrix to `floor-mutator-schedule.test.ts` expectations and any schedule authoring docs.
- List **schedule edit checklist** when adding a row: version bump, test case, player-facing `hint`/`title` review.
- Align with `REG-089` when schedule changes affect player-visible floor identity across saves.

## Acceptance Criteria
- **Coverage matrix** (or priority table) exists and names **forbidden** or **rare** combinations where product agrees.
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
- `REG-089-final-rules-versioning-save-migration-gate.md`
- `REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `REG-148-hazard-and-trap-vocabulary.md`
- `REG-149-glass-decoy-witness-scholar-cursed-interaction-matrix.md`
- `REG-151-floor-archetype-mutator-objective-synergy-coverage.md`
- `REG-156-relic-mutator-synergy-exploits-balance.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

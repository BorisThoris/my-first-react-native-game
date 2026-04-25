# REG-154: New board hazard candidates (research)

## Status
Open

## Priority
P1

## Area
Gameplay

## Evidence
- `tasks/refined-experience-gaps/README.md` — *Current product scope (refinement bar)*
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`
- `src/shared/game.ts` — *board completion, pair rules, extension points*
- `tasks/refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md` — *fifth wave hazard anchor*
- `tasks/refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- `tasks/refined-experience-gaps/REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `tasks/refined-experience-gaps/REG-156-relic-mutator-synergy-exploits-balance.md` — *fifth wave bookend*
- `tasks/refined-experience-gaps/REG-157-hazard-tile-type-taxonomy-and-outcomes.md` — *sixth wave: concrete hazard tile types (penalty/reward)*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
**Glass decoy** and **`trap_hall`** cover one hazard family; design may want **new** board-level hazards (e.g. time pressure tiles, feints, or non-decoy false pairs). Without a **time-boxed research** pass, ideas stay informal or break `isBoardComplete` invariants. **Fifth wave (ultra-deep gameplay):** list candidates, **shippable vs deferred**, cost/risk, and `GAME_RULES_VERSION` / softlock review requirements.

## Target Experience
Product receives a **short decision memo**: pick 0–N candidates for implementation spikes, with explicit **out** list. **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** Research and classification — implementation may be separate PRs.

## Suggested Implementation
- Cross-link [`REG-148`](REG-148-hazard-and-trap-vocabulary.md) and [`REG-149`](REG-149-glass-decoy-witness-scholar-cursed-interaction-matrix.md) so new hazards do not overload the word *trap*.
- **Hazard tile** workstreams are tracked in **sixth wave** [`REG-157`](REG-157-hazard-tile-type-taxonomy-and-outcomes.md)–[`REG-160`](REG-160-hazard-tile-ui-a11y-and-telegraphy.md); fold overlapping research there instead of duplicating.
- For each candidate, note **completion rule** impact and **QA** surface (per `REG-120` / `REG-087`).

## Acceptance Criteria
- **Time-box** and **deliverable** (memo outline) are explicit in implementation notes; candidates have **shippable/deferred** labels.
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
- `REG-089-final-rules-versioning-save-migration-gate.md`
- `REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `REG-148-hazard-and-trap-vocabulary.md`
- `REG-149-glass-decoy-witness-scholar-cursed-interaction-matrix.md`
- `REG-156-relic-mutator-synergy-exploits-balance.md`
- `REG-157-hazard-tile-type-taxonomy-and-outcomes.md`
- `REG-160-hazard-tile-ui-a11y-and-telegraphy.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

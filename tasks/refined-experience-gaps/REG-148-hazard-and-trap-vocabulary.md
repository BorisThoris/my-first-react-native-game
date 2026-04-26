# REG-148: Hazard and trap vocabulary

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
- `src/shared/game.ts` — *`DECOY_PAIR_KEY`, `isBoardComplete`, decoy invariants*
- `src/shared/floor-mutator-schedule.ts` — *`FLOOR_ARCHETYPE_CATALOG`, `trap_hall`*
- `src/shared/mechanics-encyclopedia.ts` — *glass decoy, glass floor copy*
- `tasks/refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- This file (REG-148) — *fifth wave hazard / trap vocabulary anchor*
- `tasks/refined-experience-gaps/REG-156-relic-mutator-synergy-exploits-balance.md` — *fifth wave bookend*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
**Glass decoy** (`DECOY_PAIR_KEY`), **`trap_hall`** floor archetype, **`glass_witness`** featured objective, and a11y **focus** “trap” helpers share the word *trap* in different contexts. Design docs and the Codex can drift. **Fifth wave (ultra-deep gameplay):** this ticket names a **single vocabulary** for *hazard* (board-level rules that can fail objectives), *decoy* (singleton that never pairs), and *archetype* (schedule flavor like `trap_hall`), plus extension points for future non-decoy board hazards without breaking `isBoardComplete` invariants.

## Target Experience
Engineers, writers, and QA use the same terms in `mechanics-encyclopedia`, HUD, and tests. **New** board hazards (if any) are classified so completion rules, objectives, and softlock risk stay reviewable. **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** Vocabulary table, owner for Codex/encyclopedia copy, and explicit **non-goal** (do not conflate with accessibility focus-trap code in `src/renderer/a11y/`).

## Suggested Implementation
- Cross-link [`REG-149`](REG-149-glass-decoy-witness-scholar-cursed-interaction-matrix.md) (edge matrix) and [`REG-120`](REG-120-mechanics-combinatoric-matrix-and-coverage.md) (combinatoric coverage).
- For **hazard tile types** (penalty/reward on flip), use the sixth wave: [`REG-157`](REG-157-hazard-tile-type-taxonomy-and-outcomes.md) through [`REG-160`](REG-160-hazard-tile-ui-a11y-and-telegraphy.md) instead of ad hoc naming in code or copy.
- List stable invariants: decoy may remain **hidden** for board complete; `decoyFlippedThisFloor` / witness failure as documented in `docs/gameplay/` epics.
- If copy changes, bump or cite `ENCYCLOPEDIA_VERSION` / `GAME_RULES_VERSION` per existing migration policy (`REG-089`).

## Acceptance Criteria
- The ticket’s **Problem** and **Target** are unambiguous; **trap** / **hazard** / **decoy** disambiguation is written down.
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
- `REG-156-relic-mutator-synergy-exploits-balance.md`
- `REG-157-hazard-tile-type-taxonomy-and-outcomes.md`
- `REG-160-hazard-tile-ui-a11y-and-telegraphy.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

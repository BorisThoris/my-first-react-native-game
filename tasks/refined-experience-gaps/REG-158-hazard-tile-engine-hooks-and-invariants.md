# REG-158: Hazard tile engine hooks and invariants

## Status
Open

## Priority
P0

## Area
Gameplay

## Evidence
- `tasks/refined-experience-gaps/README.md` — *Current product scope (refinement bar)*
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `src/shared/contracts.ts` — *`Tile`, `BoardState`, `GAME_RULES_VERSION`*
- `src/shared/game.ts` — *mismatch and match resolution, `DECOY_PAIR_KEY`, shuffles, removals*
- `src/shared/game.test.ts`
- `tasks/refined-experience-gaps/REG-041-run-export-replay-seed-integrity.md`
- `tasks/refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md`
- `tasks/refined-experience-gaps/REG-157-hazard-tile-type-taxonomy-and-outcomes.md` — *sixth wave taxonomy anchor*
- `tasks/refined-experience-gaps/REG-160-hazard-tile-ui-a11y-and-telegraphy.md` — *sixth wave bookend*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
Hazard **tile** rules need **engine hooks** in the match and mismatch paths: e.g. penalty → enqueue shuffle (`WeakerShuffleMode`); reward → remove/cascade tiles. Without a written contract, **replay** and **`isBoardComplete`** drift, and **decoy** / **cursed** / **wild** order becomes ambiguous. **Sixth wave:** specify **data shape** (e.g. `tileHazardKind` on `Tile` or keyed by `tileId` on `BoardState`), new **`RunState`** fields for per-floor **exposures** or **charges** if needed, and **invariant** checks after each hazard effect.

## Target Experience
Implementers can name the **functions** in `game.ts` (or adjacent modules) that must branch, and the **bump** to `GAME_RULES_VERSION` / save compatibility when rules ship. **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** Deterministic, seed-stable effects per [`REG-041`](REG-041-run-export-replay-seed-integrity.md); no new server surface.

## Suggested Implementation
- Cross-link [`REG-157`](REG-157-hazard-tile-type-taxonomy-and-outcomes.md) (families) and [`REG-150`](REG-150-pair-resolution-timeline-gambit-wild-cursed.md) (timeline order).
- Document **mismatch** hook: which tile id(s) trigger penalty shuffle, and how **shuffle** counts for **scholar** and HUD honesty.
- Document **match** hook: removal order, never targeting **decoy** unless explicitly allowed; revalidate **`isBoardComplete`** after effects.
- Add or extend **unit tests** in implementation PRs; this ticket remains the **spec** for what must be covered.

## Acceptance Criteria
- **Hook points** and **invariants** are listed; **decoy** / **cursed** / **wild** interaction is at least “acknowledged + N/A or rule.”
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
- `REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- `REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `REG-150-pair-resolution-timeline-gambit-wild-cursed.md`
- `REG-148-hazard-and-trap-vocabulary.md`
- `REG-157-hazard-tile-type-taxonomy-and-outcomes.md`
- `REG-160-hazard-tile-ui-a11y-and-telegraphy.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

# REG-157: Hazard tile type taxonomy and outcomes

## Status
Open

## Priority
P0

## Area
Gameplay

## Evidence
- `tasks/refined-experience-gaps/README.md` — *Current product scope (refinement bar)*
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `src/shared/contracts.ts` — *`Tile`, `findableKind`, `WeakerShuffleMode`*
- `src/shared/game.ts` — *match/mismatch resolution, shuffles, `isBoardComplete`*
- `tasks/refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md` — *hazard / decoy vocabulary*
- `tasks/refined-experience-gaps/REG-154-new-board-hazard-candidates-research.md` — *hazard research*
- `tasks/refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- This file (REG-157) — *sixth wave: hazard tile types anchor (penalty / reward)*
- `tasks/refined-experience-gaps/REG-160-hazard-tile-ui-a11y-and-telegraphy.md` — *sixth wave bookend: UI/telegraphy*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
**Penalty** and **reward** *tile* behaviors (e.g. auto-shuffle on a first wrong flip, chain-remove or “explode” neighbors on a correct match) are design directions but not yet a **named taxonomy** tied to the engine. Without families and *first-try* definitions, implementation risks contradicting `scholar_style`, `glass_witness`, and `isBoardComplete`. **Sixth wave (hazard tile types):** catalog **families** (penalty, reward, dual/risky), 6–10 **concrete card ideas**, and explicit **v1 non-goals**.

## Target Experience
Product and eng agree on which ideas ship first and which are deferred. **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** Outcomes and player-readable rules — not `pairKey` engineering detail (see [`REG-158`](REG-158-hazard-tile-engine-hooks-and-invariants.md)).

## Suggested Implementation
- Cross-link [`REG-149`](REG-149-glass-decoy-witness-scholar-cursed-interaction-matrix.md) and [`REG-150`](REG-150-pair-resolution-timeline-gambit-wild-cursed.md) for how outcomes attach to the flip pipeline.
- Define **first mismatch** / **first exposure** options (per tile, per pair, per floor) and pick one default for v1 spikes.
- List **non-goals** (e.g. no new mandatory online; no hazards that require server RNG).

## Acceptance Criteria
- **Taxonomy** and **6–10** named concept cards (or fewer with explicit deferrals) are written; **non-goals** are stated.
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
- `REG-119-bot-batch-plan-and-product-acceptance-report.md`
- `REG-148-hazard-and-trap-vocabulary.md`
- `REG-154-new-board-hazard-candidates-research.md`
- `REG-158-hazard-tile-engine-hooks-and-invariants.md`
- `REG-160-hazard-tile-ui-a11y-and-telegraphy.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

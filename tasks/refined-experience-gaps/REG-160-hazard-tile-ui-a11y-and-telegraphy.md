# REG-160: Hazard tile UI, a11y, and telegraphy

## Status
Open

## Priority
P0

## Area
QA

## Evidence
- `tasks/refined-experience-gaps/README.md` — *Current product scope (refinement bar)*
- `src/renderer/components/TileBoard.tsx` — *decoy / tile announcements*
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `tasks/refined-experience-gaps/REG-112-effect-lod-reduced-motion-and-visual-noise-control.md`
- `tasks/refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md`
- `tasks/refined-experience-gaps/REG-157-hazard-tile-type-taxonomy-and-outcomes.md` — *sixth wave taxonomy anchor*
- `tasks/refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- This file (REG-160) — *sixth wave bookend: telegraphy and a11y*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
Hazard **tile** types (see [`REG-157`](REG-157-hazard-tile-type-taxonomy-and-outcomes.md)) must be **legible** before the player flips: silhouette, **tooltip**, `aria` copy, and motion for “shuffle” or “cascade” must not surprise users who rely on **screen readers** or **reduced motion** ([`REG-112`](REG-112-effect-lod-reduced-motion-and-visual-noise-control.md)). **Sixth wave:** define **telegraphy** rules per hazard family and **acceptance** for mobile + desktop.

## Target Experience
Each shippable hazard has a **player-facing** name, **hint** line, and **live region** text when the effect **fires** (not only on idle hover). Shuffles and cascades have **reduced-motion** fallbacks. **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** UI/a11y — engine contract is [`REG-158`](REG-158-hazard-tile-engine-hooks-and-invariants.md); balance matrix is [`REG-159`](REG-159-hazard-tile-objective-and-balance-matrix.md).

## Suggested Implementation
- Cross-link [`REG-113`](REG-113-asset-placeholder-inventory-and-drop-in-contract.md) for placeholder art; [`REG-101`](REG-101-copy-tone-rules-language-and-microcopy-pass.md) for tone.
- List **per-hazard** checklist: color-independent cue, `aria-label` pattern, **focus** order when a modal or toast follows an effect.
- Map explosion/cascade to **FX LOD** and **noise** limits in `REG-112`.

## Acceptance Criteria
- **Telegraphy** and **a11y** acceptance are checklist-style and tied to [`REG-157`](REG-157-hazard-tile-type-taxonomy-and-outcomes.md)’s list of v1 types (or “N until types ship”).
- **Online** is not a shipping dependency for v1.
- **Placeholder and asset contract (placeholderNeeded)** is filled.

## Verification
- File includes: Status, Priority, Area, Evidence, Problem, Target Experience, Suggested Implementation, Acceptance Criteria, Verification, **Placeholder and asset contract (placeholderNeeded)**, and **Cross-links**.
- `git status --short` for implementation is scoped; markdown-only in this pass for new files.

## Placeholder and asset contract (placeholderNeeded)
- **Not applicable** for shippable new art, audio, trailer, capsule, or poster deliverables in this task’s **planning** scope. Implementation may use **slots** (icon frame, SFX stinger) per `REG-113` until final assets; list sizes in the implementation PR if needed.

## Cross-links
- `README.md`
- `REG-000-audit-method-and-priority-map.md`
- `REG-101-copy-tone-rules-language-and-microcopy-pass.md`
- `REG-112-effect-lod-reduced-motion-and-visual-noise-control.md`
- `REG-113-asset-placeholder-inventory-and-drop-in-contract.md`
- `REG-119-bot-batch-plan-and-product-acceptance-report.md`
- `REG-148-hazard-and-trap-vocabulary.md`
- `REG-157-hazard-tile-type-taxonomy-and-outcomes.md`
- `REG-158-hazard-tile-engine-hooks-and-invariants.md`
- `REG-159-hazard-tile-objective-and-balance-matrix.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

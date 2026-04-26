# REG-152: Shop, vendor, run map, and node hooks

## Status
Done

## Priority
P1

## Area
Gameplay

## Evidence
- `tasks/refined-experience-gaps/README.md` — *Current product scope (refinement bar)*
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`
- `tasks/refined-experience-gaps/REG-015-shop-and-run-currency-system.md` — *run currency and shop loop (root)*
- `tasks/refined-experience-gaps/REG-070-shop-vendor-stock-pricing-and-rerolls.md`
- `tasks/refined-experience-gaps/REG-071-shop-item-catalog-consumables-and-services.md`
- `tasks/refined-experience-gaps/REG-017-between-floor-route-choice.md` — *route / node context*
- `tasks/refined-experience-gaps/REG-069-run-map-route-node-system.md` — *run map when in scope*
- `tasks/refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- `tasks/refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md` — *fifth wave hazard anchor*
- `tasks/refined-experience-gaps/REG-156-relic-mutator-synergy-exploits-balance.md` — *fifth wave bookend*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
[`REG-015`](REG-015-shop-and-run-currency-system.md), [`REG-070`](REG-070-shop-vendor-stock-pricing-and-rerolls.md), and [`REG-071`](REG-071-shop-item-catalog-consumables-and-services.md) define **what** the economy and offers are; **where** a shop lives in the run (map node, between-floor overlay, event room) and **gating** (locks, out-of-stock, act limits) is still easy to under-spec. **Fifth wave (ultra-deep gameplay):** document **node hooks** and failure modes (cannot afford, reroll lockout) without redefining base currency — **defer** currency math to `REG-015`.

## Target Experience
Design and eng agree on **shop placement rules** relative to the route graph / overlays in [`REG-017`](REG-017-between-floor-route-choice.md) and [`REG-069`](REG-069-run-map-route-node-system.md). Bot and manual QA have a **checklist** for “entered shop / skipped shop / broke economy.” **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** Hooks and gating, not a second “add shop” root ticket.

## Suggested Implementation
- Produce a **short integration diagram** (where shop UI mounts; save/load expectations on `RunState`).
- Cross-link `REG-015`, `REG-070`, `REG-071`, `REG-017`, `REG-033`, and `REG-119` for acceptance.
- Explicit **non-goal:** no new **online** payment or server catalog; Steam stays client-only per folder scope.

## Acceptance Criteria
- **Node hooks** and **failure modes** are listed and traceable to prior shop REGs.
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
- `REG-015-shop-and-run-currency-system.md`
- `REG-017-between-floor-route-choice.md`
- `REG-070-shop-vendor-stock-pricing-and-rerolls.md`
- `REG-071-shop-item-catalog-consumables-and-services.md`
- `REG-069-run-map-route-node-system.md`
- `REG-148-hazard-and-trap-vocabulary.md`
- `REG-156-relic-mutator-synergy-exploits-balance.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

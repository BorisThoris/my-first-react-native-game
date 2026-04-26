# REG-153: Run inventory, RunState invariants, and UI contract

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
- `src/renderer/components/InventoryScreen.tsx` — *read-only run snapshot; relics, mutators, charges, contract*
- `tasks/refined-experience-gaps/REG-079-run-inventory-consumable-and-loadout-model.md` — *`RunState` loadout and consumable model*
- `tasks/refined-experience-gaps/REG-094-inventory-final-loadout-and-run-prep-screen.md` — *inventory UI / presentation*
- `tasks/refined-experience-gaps/REG-015-shop-and-run-currency-system.md`
- `tasks/refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- `tasks/refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md` — *fifth wave hazard anchor*
- `tasks/refined-experience-gaps/REG-156-relic-mutator-synergy-exploits-balance.md` — *fifth wave bookend*
- `tasks/refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`

## Problem
**Inventory** today: `InventoryScreen` is a **read-only** view of the active run (relics, mutators, charges, contract) with an empty state when no run exists; it is **not** a stash grid. [`REG-079`](REG-079-run-inventory-consumable-and-loadout-model.md) covers **data** for consumables and loadout rules; [`REG-094`](REG-094-inventory-final-loadout-and-run-prep-screen.md) covers **UI** polish. The **invariants** (what can change mid-run, what must be impossible — e.g. direct inventory “editing” if product forbids) need one coherent contract. **Fifth wave (ultra-deep gameplay):** write `RunState` ↔ UI invariants and future consumable row behavior.

## Target Experience
No ambiguity between “meta inventory UI” and “run state mutation.” When [`REG-015`](REG-015-shop-and-run-currency-system.md) adds spend flows, the contract still holds. **Online** is **out of scope** for v1 per `REG-052` and `README`.

**Focus:** Invariants, not redesigning the whole shell.

## Suggested Implementation
- List **immutable** vs **mutable** fields for in-run display; document **abandon run** and **SIDE-014** return behavior (see `useAppStore` comments) for inventory/codex.
- Cross-link `REG-079`, `REG-094`, `REG-040` / `REG-117`, and `REG-089` if `RunState` shape changes.

## Acceptance Criteria
- **Invariants** and **UI contract** are written; current **read-only** behavior is explicit.
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
- `REG-040-save-failure-recovery-and-local-data-trust.md`
- `REG-079-run-inventory-consumable-and-loadout-model.md`
- `REG-094-inventory-final-loadout-and-run-prep-screen.md`
- `REG-148-hazard-and-trap-vocabulary.md`
- `REG-156-relic-mutator-synergy-exploits-balance.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

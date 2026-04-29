# Gameplay systems tasks

Tracked specs for **rules, mutators, objectives, powers, relics, mode variants, and findables** — separate from visual/shell work under [`docs/new_design/TASKS/`](../new_design/TASKS/).

| Resource | Purpose |
|----------|---------|
| [**GP_AUDIT_ROLLUP.md**](./GP_AUDIT_ROLLUP.md) | **Audit matrix** — each GP-ID vs shipped code (updated 2026-04-19). |
| [ENCYCLOPEDIA_FOLLOWUP_TASKS.md](./ENCYCLOPEDIA_FOLLOWUP_TASKS.md) | **Codex / mechanics encyclopedia** — doc drift, content gaps, UI IA, tests, workflow. |

## Specs and theory

| Resource | Purpose |
|----------|---------|
| [`docs/gameplay-depth/05-app-specific-idea-backlog.md`](../gameplay-depth/05-app-specific-idea-backlog.md) | Source **IDs** (F-01, O-01, …) and one-table specs. |
| [`docs/gameplay-depth/`](../gameplay-depth/) | Rationale, research links, pacing notes. |
| [`docs/MUTATORS.md`](../MUTATORS.md), [`docs/RELIC_ROSTER.md`](../RELIC_ROSTER.md), [`docs/RELIC_SYNERGY_PLAYTEST.md`](../RELIC_SYNERGY_PLAYTEST.md) | Shipped behavior and combo QA. |
| [`docs/FINDABLES.md`](../FINDABLES.md) | Findables v1 (mutator-gated pickups on pairs). |

## Task ID map

| Prefix | File | Backlog IDs |
|--------|------|-------------|
| **GP-F** | [GP-FLOOR-SCHEDULE.md](./GP-FLOOR-SCHEDULE.md) | F-01, F-02, F-03 |
| **GP-O** | [GP-SECONDARY-OBJECTIVES.md](./GP-SECONDARY-OBJECTIVES.md) | O-01, O-02, O-03, O-04 |
| **GP-H** | [GP-HELPERS.md](./GP-HELPERS.md) | H-01, H-02, H-03 |
| **GP-R** / **GP-C** | [GP-RELICS-CONTRACTS.md](./GP-RELICS-CONTRACTS.md) | R-01, R-02, R-03, C-01 |
| **GP-M** | [GP-MODES.md](./GP-MODES.md) | M-01, M-02, M-03 |
| **GP-FIN** | [GP-FINDABLES.md](./GP-FINDABLES.md) | FN-01 |
| **GP-RW** | [GP-ROUTE-WORLD.md](./GP-ROUTE-WORLD.md) | RW-01 through RW-12 |

Full IDs in task bodies: `GP-F01`, `GP-O01`, … (maps 1:1 to backlog F-01, O-01, …). Findables: `GP-FIN01` … `GP-FIN06` → backlog **FN-01**. Route-world tasks: `GP-RW01` … `GP-RW12`.

## Suggested implementation order

Aligned with [`05-app-specific-idea-backlog.md`](../gameplay-depth/05-app-specific-idea-backlog.md):

1. **GP-O01**, **GP-O04** — secondary bonuses + per-floor power flags; smallest change to run shape.
2. **GP-F01** + **GP-F02** — per-floor mutators + breathers; bump `GAME_RULES_VERSION`, export/import story.
3. **GP-F03** — boss/breather tags (can ship after F01 if schedule table carries tags from day one).
4. **GP-H03** — destroy ↔ parasite feedback copy + logic.
5. **GP-O02**, **GP-O03** — cursed pair, flip par (depend on clear objective state patterns from O01).
6. **GP-R01**, **GP-R02** — conditional relics.
7. **GP-H01** + **GP-R03** — region shuffle + relic (UI-heavy).
8. **GP-H02** — flash pair (practice/wild first).
9. **GP-C01**, **GP-M01**–**GP-M03** — contract extension, daily/wild/meditation tweaks as product priority dictates.
10. **GP-FIN01**–**GP-FIN06** — findables (see [`GP-FINDABLES.md`](./GP-FINDABLES.md)); mutator-gated; after core loop stable.
11. **GP-RW01**, **GP-RW05**, **GP-RW11** — route world profile contract, copy surfaces, and deterministic fixtures.
12. **GP-RW02**–**GP-RW04** — Greed/Safe/Mystery board-generation effects.
13. **GP-RW06**–**GP-RW12** — route card action rules, named card families, side-room hooks, route-aware relic weighting, boss/elite anchors, and catalog/Codex coverage.

## Rules version and saves

Any task that changes generation, scoring, per-floor mutator lists, or export semantics should:

- Bump `GAME_RULES_VERSION` in `src/shared/contracts.ts` when required by [`MUTATORS.md`](../MUTATORS.md).
- Extend `RunExportPayload` / import validation if seeds no longer reproduce the same mutator timeline.

## Status legend

- **Done** — merged; pointers in each task file + [GP_AUDIT_ROLLUP.md](./GP_AUDIT_ROLLUP.md).
- **Partial** — merged with explicit scope limits (see task body).
- **Backlog** / **In progress** — reserved for genuinely unstarted work after the next audit.

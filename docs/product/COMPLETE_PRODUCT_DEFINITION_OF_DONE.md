# Complete product definition of done (REG-068)

**Purpose:** this is the reusable product gate for a refined v1. It turns
`REG-068` into a concrete checklist that later REG slices can cite without
re-reading the whole backlog. It is **not** the final acceptance report; use
`REG-119` for the Phase 7 close-the-loop report after meaningful vertical
slices have landed.

## Scope boundary

### In scope for v1

- **Local / offline play:** all primary modes must work without accounts,
  servers, or live service truth.
- **Steam where already targeted:** packaging, runtime smoke, achievements,
  and local Steam client behavior are in scope where the desktop product
  already integrates them.
- **First-class responsive UI:** phone, tablet, desktop, touch, short
  viewports, safe areas, and the device grid must reach **Choose Path quality
  or better** on active shell and gameplay surfaces.
- **Complete shell and gameplay loop:** menu, Choose Path, settings, meta
  screens, gameplay, overlays, game over, and first-run onboarding must be
  coherent enough to carry a player from first launch to a first win.
- **Local save trust:** save failures, backups/import/export where scheduled,
  migrations, and player-facing recovery must be handled locally.
- **Hardening after the real shell exists:** performance, input latency,
  accessibility, WebGL/GPU lifecycle, reduced motion, audio mix, and CI/e2e
  gates are judged against the implemented shell, not placeholder screens.
- **Placeholder discipline:** asset-heavy tasks may ship placeholders and
  fallbacks per `REG-113`; final licensed art, audio, trailers, capsules, or
  store media are separate owner deliverables unless a release REG explicitly
  says otherwise.

### Out of scope for v1

- Real-time or server-backed online services.
- Competitive online leaderboards.
- Mandatory online accounts or online acceptance.

This is a product decision, not a vague backlog deferral. If a slice pressures
this boundary, stop and cite `REG-052-leaderboards-trust-model-and-online-deferral.md`
and `docs/LEADERBOARDS_DEFERRAL.md`.

## Phase gate checklist

Use `tasks/refined-experience-gaps/REG-IMPLEMENTATION-ORDER-AND-PHASES.md`
as the scheduling authority.

| Phase | Gate for product DoD |
| --- | --- |
| **1 — Foundations** | Land or verify `REG-068`, `REG-087`, `REG-088`, and `REG-089` before unbounded `REG-069+` expansion. Keep `REG-052`, save trust (`REG-040`), and privacy (`REG-063`) offline-first. |
| **2 — Core run depth** | Run map, shop/economy, objectives, relics, mutators, puzzles, history, and balance work must preserve local determinism and version-gate discipline. |
| **3 — Parallel tracks** | Track A structural mobile/shell and Track B meta/progression may overlap Phases 1–2, but should produce stable layout/navigation foundations rather than final art churn. |
| **4 — Full UI and shell** | `REG-090`–`REG-108` plus first/second-wave polish bring every major screen to Choose Path quality or better before hardening is treated as final. |
| **5 — Hardening** | Performance, input, WebGL, a11y, visual baselines, and e2e/CI flake work validate the real shell. |
| **6 — Deep / enterprise** | `REG-120`–`REG-160` run after the shell and hardening, except documented P0-unblocking spikes. `REG-129` stays out of this phase. |
| **7 — Release / packaging** | `REG-060`, `REG-061`, `REG-115`–`REG-119`, and `REG-129` close feature lock, packaging, legal/about, backup/import/export, demo/full matrix, and final acceptance. |

## Per-slice merge readiness

Every REG slice should leave the repository in a reviewable, merge-ready state.
For each slice, record:

1. **Active REG and phase.**
2. **Branch and short plan** tied to acceptance.
3. **High-signal files changed** and why they are in scope.
4. **Exact test commands run** and one-line rationale for the chosen tier.
5. **E2E decision:** command run, or why e2e was skipped and what would trigger it.
6. **Versioning risk:** whether `SAVE_SCHEMA_VERSION`, `GAME_RULES_VERSION`,
   or `FLOOR_SCHEDULE_RULES_VERSION` was reviewed.
7. **Scope risk:** confirmation that online/server/account requirements were
   not introduced.

Minimum completed-slice merge bar:

```bash
yarn typecheck
yarn test
yarn lint
```

Cost-aware targeted tests are still preferred while iterating:

- Shared contracts/rules: `yarn typecheck:shared` plus affected Vitest files.
- UI/shell responsive work: `yarn test:e2e:visual:smoke` or one device-grid shard.
- Gameplay/navigation: `yarn test:e2e:renderer-qa`.
- Accessibility-sensitive behavior: `yarn test:e2e:a11y`.

E2E can be skipped for documentation-only slices when no runtime behavior,
source code, visual baseline, schema, or a11y contract changes.

## Versioning and save gate

Before merging any slice that changes persisted data, generated rules, floor
schedules, daily identity, catalog IDs, scoring, or replay/import semantics,
review `src/shared/version-gate.ts`.

- **Save shape or migrations:** review `SAVE_SCHEMA_VERSION`, extend
  `normalizeSaveData` fixtures, and validate local recovery behavior.
- **Board generation, scoring, catalogs, or player-facing rules:** review
  `GAME_RULES_VERSION`, deterministic board tests, run export/import, and
  replay assumptions.
- **Endless floor schedule rules:** review `FLOOR_SCHEDULE_RULES_VERSION` and
  `src/shared/floor-mutator-schedule.test.ts`.
- **Copy/UI/assets only:** do not bump rules versions unless player-visible
  mechanics or persisted contracts actually changed.

Version authority remains local-client only for v1; do not introduce a server
truth requirement to satisfy versioning.

## Acceptance rubric

A refined v1 is complete when:

- A new player can launch, understand the shell, choose a mode, complete a
  first-run-to-first-win path, and recover from interruptions using local state.
- The active shell and gameplay screens meet responsive/touch/mobile quality
  at least equal to the Choose Path bar.
- Core gameplay depth, economy, meta progression, onboarding, settings,
  overlays, game over, and read-only meta screens are coherent and tested in
  their scheduled phases.
- Save/rules/version changes have explicit migration or bump decisions.
- Performance, a11y, input, GPU/WebGL, reduced-motion, audio, and CI/e2e gates
  have been run against the real shell.
- Release/Steam/demo/legal/packaging tasks are closed only in Phase 7.
- Online leaderboards, live services, and mandatory accounts remain deferred
  unless product explicitly reopens the `REG-052` boundary in a future phase.

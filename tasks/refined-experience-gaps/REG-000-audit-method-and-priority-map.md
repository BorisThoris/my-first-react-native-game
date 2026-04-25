# REG-000: Audit Method And Priority Map

## Status
Open

## Priority
P0

## Area
QA

## Evidence
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `docs/new_design/TASKS/README.md`
- `docs/new_design/TASKS/TASKS_HUD_PARITY.md`
- `docs/new_design/TASKS/TASKS_META_AND_SHELL.md`
- `docs/new_design/TASKS/TASKS_OVERLAYS_FTUE.md`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`
- `docs/refinement-tasks/INDEX.md`
- `docs/gameplay-depth/`
- `docs/gameplay/GAMEPLAY_POLISH_AND_GAPS.md`
- `docs/LEADERBOARDS_DEFERRAL.md`
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`
- `docs/new_design/I18N_FOUNDATION.md`
- `docs/new_design/SETTINGS_REFERENCE_CONTROLS_MATRIX.md`
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`
- `docs/AUDIO_INTERACTION_MATRIX.md`
- `docs/AUDIO_ASSET_INVENTORY.md`
- `test-results/visual-screens/`
- `tasks/user-critis/`
- `README.md` (folder index) — includes **Complete Product Pass (third wave)**: `REG-068` through `REG-119`, **Fourth wave (enterprise depth & edge)**: `REG-120` through `REG-147`, **Fifth wave (ultra-deep gameplay mechanics)**: `REG-148` through `REG-156`, and **Sixth wave (hazard tile types)**: `REG-157` through `REG-160` — **162 files** total in this directory (`README.md` + `REG-000`…`REG-160`).
- `REG-068-complete-product-definition-of-done.md` and `REG-119-bot-batch-plan-and-product-acceptance-report.md` (third-wave bookends for sequencing)
- `REG-120-mechanics-combinatoric-matrix-and-coverage.md` and `REG-147-local-trust-and-no-server-anticheat-posture.md` (fourth-wave bookends: combinatoric anchor and local trust posture)
- `REG-148-hazard-and-trap-vocabulary.md` and `REG-156-relic-mutator-synergy-exploits-balance.md` (fifth-wave bookends: hazard vocabulary anchor and exploit/balance pass)
- `REG-157-hazard-tile-type-taxonomy-and-outcomes.md` and `REG-160-hazard-tile-ui-a11y-and-telegraphy.md` (sixth-wave bookends: hazard tile taxonomy and UI/a11y telegraphy)

## Problem
Refinement gaps are spread across comparison docs, finished task packs, screenshots, source files, and ad hoc critique. That makes it hard to separate remaining release blockers from already-completed design work, and it increases the risk of implementing isolated polish without a consistent priority model.

A **third wave** (`REG-068`–`REG-119`) adds a **handoff-ready complete product** layer: run map/economy depth, end-to-end UI at **Choose Path quality or better**, gameplay composition, performance, release/Steam packaging, and **long-running implementation bot** sequencing. That wave is **Markdown-only** here; it does not assume final art/audio/trailer/capsule generation by an implementation bot (see per-ticket `placeholderNeeded`).

A **fourth wave** (`REG-120`–`REG-147`) names **combinatoric matrices**, **RC/process gates**, and **edge-case coverage** (fault injection, platform matrices, Steam **client**-only cases) so large-team QA and systems risks are not only implicit. **Verification** in this file and the folder index should reflect tickets through `REG-147`. Fourth-wave tasks remain **local/offline-first**; they do not introduce mandatory **online** services (see `REG-052` and `README`).

A **fifth wave** (`REG-148`–`REG-156`) deep-dives **core gameplay**: hazard/decoy vocabulary, **interaction** and **resolution** documentation, **schedule** coverage (`trap_hall` and kin), **shop placement** (without duplicating `REG-015`/`REG-070`/`REG-071`), **inventory** invariants, **hazard** research, **scoring tag** contract, and **relic/mutator exploit** review. **Verification** in this file and the folder index should reflect tickets through `REG-156`. Fifth-wave tasks remain **local/offline-first**.

A **sixth wave** (`REG-157`–`REG-160`) specifies **hazard *tile* types** (penalty/reward outcomes on flips) — taxonomy, **engine** hooks, **objective/balance** matrix, and **UI/a11y** — building on `REG-148` and `REG-154` without conflating **accessibility** focus traps. **Verification** in this file and the folder index should reflect tickets through `REG-160`. Sixth-wave **Markdown** does not by itself change `src/`; implementation follows separately. **Online**-first or **server**-dependent hazards remain **out of scope** for v1 per `REG-052` and `README`.

## Target Experience
The refinement backlog should function as a clear map from current evidence to player-facing work. A developer (or long-running **implementation bot**) should be able to choose a task, understand why it matters, see likely affected surfaces, and verify completion without re-auditing the full repo.

**Current product bar (`README` — *Current product scope (refinement bar)*):** a **fully refined** v1 **includes** local/offline play, **Steam** where targeted, and **first-class mobile and responsive UI** (not optional). It **excludes** **online** leaderboards, server-backed or real-time **online** services, and **mandatory online** accounts in this phase — that exclusion is a **ship decision**, recorded in `REG-052` / `LEADERBOARDS_DEFERRAL.md`, not a soft deferral. Steam, local telemetry, and privacy constraints from earlier `REG-*` tasks are preserved.

## Suggested Implementation
- For **which REG to do in what order** (phases, parallel tracks, and bookends), use [`REG-IMPLEMENTATION-ORDER-AND-PHASES.md`](REG-IMPLEMENTATION-ORDER-AND-PHASES.md) together with this file’s priority rules.
- Treat current source and fresh screenshots as the highest-confidence evidence.
- Treat `docs/ui-design-reference/*` as historical unless it matches current screenshots or source.
- Use P0 for core gameplay readability, **mobile usability** (treat as release-critical for a fully refined v1), regression coverage, and system-contract decisions.
- Use P1 for depth systems, high-traffic screen polish, and gameplay identity improvements.
- Use P2 for expansion, art upgrades, platform work, online/social decisions, localization, and aspirational systems that should not block core refinement.
- Sequence long-running bot work through `REG-033` before starting broad task batches. For a **full build**, order **P0** third-wave work (`REG-068` definition of done, `REG-087` softlocks, `REG-088` first win path, `REG-089` versioning) before unbounded **economy/map** depth unless a spike de-risks the stack.
- Keep future schema risks explicit when tasks may touch `SaveData`, `PlayerStatsPersisted`, `RunState`, `Settings`, `RunModeDefinition`, `RelicId`, `MutatorId`, `FindableKind`, `TelemetryPayload`, `AchievementUnlockResult`, `DesktopApi`, `IPC_CHANNELS`, `RunExportPayload`, `ENCYCLOPEDIA_VERSION`, `FLOOR_SCHEDULE_RULES_VERSION`, `GAME_RULES_VERSION`, or `SAVE_SCHEMA_VERSION`.
- Third- through sixth-wave tickets (`REG-068`+): each includes **Cross-links** to bookends (`REG-068`/`REG-119`, `REG-120`/`REG-147`, `REG-148`/`REG-156`, and `REG-157`/`REG-160` where in scope); asset-heavy work documents **placeholderNeeded** and fallbacks, not final licensed deliverables, in the implementation phase.

## Acceptance Criteria
- `tasks/refined-experience-gaps/` contains one `README`, this audit map, and one ticket per named gap: **`REG-000` through `REG-160` (161 `REG-*.md` files)** plus the README, **162 files total**.
- Every ticket through `REG-067` uses the historical section structure; every ticket **`REG-068` through `REG-160`** uses the same core sections plus **Placeholder and asset contract (placeholderNeeded)** before **Cross-links** (third wave `REG-068`–`REG-119`, fourth `REG-120`–`REG-147`, fifth `REG-148`–`REG-156`, sixth `REG-157`–`REG-160`).
- Tickets cross-link existing task systems instead of copying large completed task bodies.
- Priority assignments make P0 release-critical work obvious; third-wave P0s cover product gate, first-run quality, and performance trust.
- Long-term tasks are marked P2 unless they block release trust, bot sequencing, or high-risk shared contracts. **Online/leaderboard** work stays deferrable; do not add mandatory online acceptance to the third wave unless product re-opens `REG-052`.

## Verification
- Confirm the folder contains `README.md`, `REG-000-audit-method-and-priority-map.md`, and a contiguous set **`REG-000` through `REG-160`** (each matching `REG-NNN-*.md` naming).
- Confirm `README.md` lists the first/second wave index (`REG-001`–`REG-067`), the **Complete Product Pass** table (`REG-068`–`REG-119`), the **Fourth wave** table (`REG-120`–`REG-147`), the **Fifth wave** table (`REG-148`–`REG-156`), and the **Sixth wave** table (`REG-157`–`REG-160`).
- Run `git status --short` and confirm only `tasks/refined-experience-gaps/*` (or this Markdown-only set) changes for a task pack PR.
- No unit tests are required because this is Markdown-only task authoring.

## Placeholder and asset contract (placeholderNeeded)
- **Not applicable** for this audit ticket: it is process and index documentation only, not a request for shippable art, audio, or store media.

## Cross-links
- `REG-IMPLEMENTATION-ORDER-AND-PHASES.md` (suggested **implementation** sequence: phases 1–7; **Phase 4** UI and shell, **Phase 5** hardening, **Phase 6** `REG-120`+ deep coverage, **Phase 7** release and packaging)
- `README.md` (index + **Complete Product Pass (third wave)** + **Fourth wave** + **Fifth wave** + **Sixth wave**)
- `REG-068-complete-product-definition-of-done.md`
- `REG-119-bot-batch-plan-and-product-acceptance-report.md`
- `REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `REG-147-local-trust-and-no-server-anticheat-posture.md`
- `REG-148-hazard-and-trap-vocabulary.md`
- `REG-156-relic-mutator-synergy-exploits-balance.md`
- `REG-157-hazard-tile-type-taxonomy-and-outcomes.md`
- `REG-160-hazard-tile-ui-a11y-and-telegraphy.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`
- `docs/new_design/TASKS/`
- `docs/gameplay-tasks/`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `docs/refinement-tasks/INDEX.md`
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`

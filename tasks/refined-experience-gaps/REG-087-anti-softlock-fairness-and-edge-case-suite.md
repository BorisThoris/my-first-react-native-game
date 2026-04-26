# REG-087: Anti-softlock fairness and edge case suite

## Status
Done

## Priority
P0

## Area
QA

## Evidence
- `tasks/refined-experience-gaps/README.md` — *Current product scope (refinement bar)*; **Fourth wave (enterprise depth & edge)** (`REG-120`–`REG-147`)
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md`
- `tasks/refined-experience-gaps/REG-033-bot-handoff-sequencing-and-dependency-map.md`
- `tasks/refined-experience-gaps/REG-120-mechanics-combinatoric-matrix-and-coverage.md` — *Combinatoric anchor; fan-out for rare stacks*
- `tasks/refined-experience-gaps/REG-125-negative-test-and-fault-injection-suite.md` — *Negative and fault injection*
- `tasks/refined-experience-gaps/REG-126-soak-test-and-long-session-stability.md` — *Soak and long-session*
- `tasks/refined-experience-gaps/REG-123-exploit-surface-economy-and-quit-farm.md` — *Exploit / min-max (offline scope)*
- `docs/gameplay-tasks/`
- `docs/new_design/TASKS/`

## Problem
Softlocks, progression blocks, and unfair board states need a **named** repro list, automation targets, and **traceability** to mechanics data. A single paragraph cannot hold the **combinatoric** surface (`RelicId` × `MutatorId` × mode × board timing). **Decomposed** matrices, negative tests, soak, and exploit-surface documentation now live in the **fourth wave** (`REG-120`–`REG-147`). This ticket remains the **P0 index**: it sequences work with `REG-068` / `REG-119` and points implementers at the right `REG-120+` files instead of duplicating them.

## Target Experience
QA and engineering treat `REG-087` as the **entry point** for fairness and softlock risk, then use [`REG-120`](REG-120-mechanics-combinatoric-matrix-and-coverage.md) for **coverage matrices**, [`REG-125`](REG-125-negative-test-and-fault-injection-suite.md) / [`REG-126`](REG-126-soak-test-and-long-session-stability.md) for **stability under stress**, and [`REG-123`](REG-123-exploit-surface-economy-and-quit-farm.md) for **abuse** that does not depend on **online** validation. Cross-cutting **online** leaderboards stay **deferred** per `REG-052` until product reopens that phase.

## Suggested Implementation
- **Do not** paste full combinatoric tables here; maintain them under `REG-120+` and link from this file.
- Cross-link `REG-040` / `REG-117` (save trust during edge repro), `REG-041` (replay for deterministic repro), `REG-086` / `REG-030` (balance and telemetry, offline), and `REG-112` (FX fairness and motion).
- Sequence with `REG-033`: keep P0 `REG-068` and this `REG-087` before unbounded economy/map depth unless a spike de-risks the stack; use `REG-119` for batch acceptance.
- For version and catalog surfaces, name `GAME_RULES_VERSION`, `SAVE_SCHEMA_VERSION`, and `FLOOR_SCHEDULE_RULES_VERSION` when migrations apply; reference `RelicId`, `MutatorId`, and `FindableKind` per `REG-120` when combinatoric rows change.
- Preserve **offline-first** scope: no new mandatory **online** services in acceptance criteria.

## Acceptance Criteria
- This document’s scope is resolvable as one or more implementation PRs with clear verification, without requiring final licensed assets in this pass.
- It **links** to at least the fourth-wave anchors [`REG-120`](REG-120-mechanics-combinatoric-matrix-and-coverage.md) and, where relevant, [`REG-125`](REG-125-negative-test-and-fault-injection-suite.md), [`REG-126`](REG-126-soak-test-and-long-session-stability.md), [`REG-123`](REG-123-exploit-surface-economy-and-quit-farm.md); overlap with `REG-015`–`REG-021`, `REG-040`–`REG-043`, and `REG-052` is acknowledged.
- The **Placeholder and asset contract (placeholderNeeded)** section states either **Not applicable** or required slots and fallbacks.

## Verification
- File includes: Status, Priority, Area, Evidence, Problem, Target Experience, Suggested Implementation, Acceptance Criteria, Verification, **Placeholder and asset contract (placeholderNeeded)**, and **Cross-links**.
- `git status --short` for implementation work is scoped and reviewable.
- No schema change is *required* by this markdown-only definition; implementation work follows separately.

## Placeholder and asset contract (placeholderNeeded)
- **Not applicable** for shippable new art, audio, trailer, capsule, or poster deliverables in this task’s planning scope. If implementation implies UI, use existing in-product frames, procedural audio fallbacks, and placeholder copy per `REG-113` until owners supply finals. The implementation bot does not generate or license final marketing art.

## Cross-links
- `README.md` (index + **Fourth wave**)
- `REG-033-bot-handoff-sequencing-and-dependency-map.md`
- `REG-068-complete-product-definition-of-done.md`
- `REG-119-bot-batch-plan-and-product-acceptance-report.md`
- `REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `REG-125-negative-test-and-fault-injection-suite.md`
- `REG-126-soak-test-and-long-session-stability.md`
- `REG-123-exploit-surface-economy-and-quit-farm.md`
- `REG-147-local-trust-and-no-server-anticheat-posture.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`

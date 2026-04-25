# Refined Experience Gaps

This folder is a refinement task backlog for the current app. It consolidates gaps across gameplay depth, UI polish, mobile scaling, broken or crowded menus, meta systems, QA coverage, and release-quality systems.

**Pack size:** this folder contains **`README.md` plus `REG-000` through `REG-160` — 162 files total** (161 `REG-*.md` task files).

**Implementation order (suggested, not ticket order in filenames):** see [`REG-IMPLEMENTATION-ORDER-AND-PHASES.md`](REG-IMPLEMENTATION-ORDER-AND-PHASES.md) for a **phase map (1–7)**: full **UI and shell (Phase 4)** before **hardening (Phase 5)**, **`REG-120`+ deep coverage (Phase 6)** after that, and **release and packaging (Phase 7)** last — plus **Track A / Track B** and bookends from `REG-000`.

## Current product scope (refinement bar)

- **Required for a “fully refined” v1 in this phase:** **Local / offline** play, **Steam** (desktop) where the product already targets it, and **first-class mobile and responsive UI** — phone and tablet, touch, short viewports, and the **device grid** — at **Choose Path quality or better** across shell and gameplay. Treat mobile REGs (e.g. `REG-001`, `REG-006`–`REG-009`, `REG-010`, `REG-028`, `REG-090`–`REG-104`, `REG-102`–`REG-103`, and the full index) as **in scope to complete**, not optional polish. Gameplay depth, performance, save trust, audio/mix, accessibility, and release or demo packaging in this pack apply to that bar unless a ticket is explicitly online-only.
- **Out of scope for this phase (explicit product choice):** **Online** features — real-time or server-backed services, **competitive online leaderboards**, and **mandatory online accounts**. Those stay **deferred** and documented in [`REG-052`](REG-052-leaderboards-trust-model-and-online-deferral.md) and [`docs/LEADERBOARDS_DEFERRAL.md`](../docs/LEADERBOARDS_DEFERRAL.md). A ship-quality product **does not** depend on them; the definition of done is [`REG-068`](REG-068-complete-product-definition-of-done.md).

This is a task-writing pass only. No runtime code, schemas, or source APIs are changed here. Future implementation tickets may need to touch `SaveData`, `PlayerStatsPersisted`, `RunState`, `Settings`, `RunModeDefinition`, `RelicId`, `MutatorId`, `FindableKind`, `TelemetryPayload`, `AchievementUnlockResult`, `DesktopApi`, `IPC_CHANNELS`, `RunExportPayload`, `ENCYCLOPEDIA_VERSION`, `FLOOR_SCHEDULE_RULES_VERSION`, `GAME_RULES_VERSION`, or `SAVE_SCHEMA_VERSION`; those likely surfaces are called out inside the relevant tickets.

## Audit Sources

- Current UI/source: `src/renderer/components/*`
- Shared gameplay and persistence contracts: `src/shared/*`
- Current/reference comparison: `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- Existing design task systems: `docs/new_design/TASKS/*`
- Existing gameplay task systems: `docs/gameplay-tasks/*`
- Current partial Playwright captures: `test-results/visual-screens/`
- Historical UI reference captures: `docs/ui-design-reference/*`
- Deep refinement backlog: `docs/refinement-tasks/`
- Gameplay depth and polish docs: `docs/gameplay-depth/*`, `docs/gameplay/GAMEPLAY_POLISH_AND_GAPS.md`
- Release and market-positioning docs: `docs/LEADERBOARDS_DEFERRAL.md`, `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`
- Settings, localization, and target gap docs: `docs/new_design/I18N_FOUNDATION.md`, `docs/new_design/SETTINGS_REFERENCE_CONTROLS_MATRIX.md`, `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`
- Audio identity docs: `docs/AUDIO_INTERACTION_MATRIX.md`, `docs/AUDIO_ASSET_INVENTORY.md`
- User critique tickets: `tasks/user-critis/*`

Treat `docs/ui-design-reference/*` as historical unless it is confirmed by current app screenshots or source.

## Task Index

| Task | Priority | Area | Focus |
| --- | --- | --- | --- |
| [REG-000](REG-000-audit-method-and-priority-map.md) | P0 | QA | Audit method, priority map, and sequencing rules |
| [REG-001](REG-001-mobile-gameplay-hud-board-ratio.md) | P0 | Mobile | Make the mobile board primary over HUD and rails |
| [REG-002](REG-002-desktop-gameplay-stage-dead-space.md) | P1 | UI | Reduce desktop stage dead space and improve board focus |
| [REG-003](REG-003-gameplay-sidebar-integration.md) | P0 | UI | Integrate the left rail with the gameplay shell |
| [REG-004](REG-004-gameplay-hud-density-hierarchy.md) | P0 | UI | Rebalance HUD hierarchy around score and run state |
| [REG-005](REG-005-in-game-rules-hints-disclosure.md) | P1 | UI | Replace always-on rules strips with progressive help |
| [REG-006](REG-006-settings-mobile-scroll-and-footer.md) | P0 | Mobile | Make settings usable in phone and modal layouts |
| [REG-007](REG-007-mobile-game-over-above-fold.md) | P0 | Mobile | Keep game-over actions above the fold |
| [REG-008](REG-008-overlays-mobile-height-and-hierarchy.md) | P0 | Mobile | Compact pause, floor-clear, relic, and run-settings overlays |
| [REG-009](REG-009-main-menu-mobile-landscape-density.md) | P1 | Mobile | Improve menu density across phone and landscape |
| [REG-010](REG-010-choose-path-discoverability.md) | P1 | UI | Clarify browsing and start affordances in Choose Path |
| [REG-011](REG-011-meta-screens-reward-value.md) | P1 | Meta | Make Collection, Inventory, and Codex feel rewarding |
| [REG-012](REG-012-card-materials-and-interaction-fx.md) | P1 | UI | Improve cards, materials, and match feedback impact |
| [REG-013](REG-013-brand-logo-and-mode-art.md) | P2 | UI | Upgrade wordmark, crest, menu art, and mode posters |
| [REG-014](REG-014-design-system-dead-space-audit.md) | P0 | UI | Cross-screen density and chrome audit |
| [REG-015](REG-015-shop-and-run-currency-system.md) | P1 | Gameplay | Add shop, vendor, and run-currency loop |
| [REG-016](REG-016-meta-progression-upgrades.md) | P1 | Meta | Turn unlocks and honors into a progression economy |
| [REG-017](REG-017-between-floor-route-choice.md) | P1 | Gameplay | Add route choices between floors |
| [REG-018](REG-018-endless-mode-shipping-plan.md) | P1 | Gameplay | Ship or clearly stage Endless mode |
| [REG-019](REG-019-relic-build-archetypes.md) | P1 | Gameplay | Strengthen relic build identities and synergies |
| [REG-020](REG-020-mutator-chapter-identity.md) | P1 | Gameplay | Make mutators more visible and chapter-specific |
| [REG-021](REG-021-quests-contracts-objective-board.md) | P1 | Gameplay | Build a player-facing objectives and contracts surface |
| [REG-022](REG-022-puzzle-library-and-authoring-flow.md) | P2 | Gameplay | Expand puzzle library, progress, import, and editor flow |
| [REG-023](REG-023-daily-weekly-results-loop.md) | P1 | Meta | Add history, comparison, share strings, and leaderboard hooks |
| [REG-024](REG-024-economy-unification.md) | P0 | Systems | Unify shards, favor, combo rewards, relics, and currencies |
| [REG-025](REG-025-collectibles-cosmetics-implementation.md) | P2 | Meta | Decide what collectible and cosmetic systems become real |
| [REG-026](REG-026-playable-onboarding.md) | P0 | Gameplay | Replace text-heavy onboarding with guided interaction |
| [REG-027](REG-027-visual-baseline-refresh.md) | P0 | QA | Refresh visual baselines from current screenshots |
| [REG-028](REG-028-mobile-short-viewport-regression-hardening.md) | P0 | QA | Harden short viewport, phone, tablet, and landscape coverage |
| [REG-029](REG-029-input-accessibility-and-controller-comfort.md) | P1 | QA | Unify keyboard, touch, focus, safe area, and controller paths |
| [REG-030](REG-030-telemetry-and-balance-playtest-loop.md) | P1 | Systems | Add practical playtest and balance instrumentation |
| [REG-031](REG-031-performance-graphics-real-device-pass.md) | P1 | QA | Verify WebGL, bloom, DPR, Pixi, and mobile presets |
| [REG-032](REG-032-save-profile-cloud-release-shell.md) | P1 | Systems | Define save slots, profile level, cloud save, and release shell |
| [REG-033](REG-033-bot-handoff-sequencing-and-dependency-map.md) | P0 | QA | Sequence the backlog for long-running bot execution |
| [REG-034](REG-034-startup-intro-hydration-and-skip-contract.md) | P1 | UI | Harden startup intro, hydration, and skip behavior |
| [REG-035](REG-035-main-menu-profile-social-community-strip.md) | P2 | Meta | Decide profile, social, and community strip scope |
| [REG-036](REG-036-reference-settings-controls-model-plan.md) | P1 | Systems | Decide model support for reference-only settings controls |
| [REG-037](REG-037-audio-identity-mix-and-callsite-coverage.md) | P1 | Systems | Complete audio callsite coverage and mix identity |
| [REG-038](REG-038-music-loop-and-adaptive-audio-depth.md) | P2 | Systems | Deepen menu/run music and adaptive audio |
| [REG-039](REG-039-achievement-surface-steam-offline-recovery.md) | P1 | Systems | Refine achievement, Steam, and offline recovery surfaces |
| [REG-040](REG-040-save-failure-recovery-and-local-data-trust.md) | P0 | Systems | Make local save failures recoverable and trusted |
| [REG-041](REG-041-run-export-replay-seed-integrity.md) | P1 | Systems | Harden run export, replay, and seed integrity |
| [REG-042](REG-042-notification-toast-score-pop-hierarchy.md) | P1 | UI | Separate notifications, achievements, and score pops |
| [REG-043](REG-043-pause-timer-resume-and-interruption-contract.md) | P1 | Systems | Define pause, timer, resume, and interruption rules |
| [REG-044](REG-044-meta-navigation-backstack-and-return-model.md) | P1 | Systems | Clarify meta navigation stack and return behavior |
| [REG-045](REG-045-power-verbs-charge-economy-and-toolbar-teaching.md) | P1 | Gameplay | Teach power verbs, charges, and toolbar costs |
| [REG-046](REG-046-forgiveness-difficulty-profiles-and-fairness-tuning.md) | P1 | Gameplay | Tune fairness, forgiveness, and difficulty profiles |
| [REG-047](REG-047-symbol-band-readability-and-distractor-similarity.md) | P1 | Gameplay | Audit symbol bands and distractor similarity |
| [REG-048](REG-048-secondary-objectives-bonus-clarity.md) | P1 | Gameplay | Improve secondary objective bonus clarity |
| [REG-049](REG-049-findables-pickup-readability-and-reward-tuning.md) | P1 | Gameplay | Refine findable pickup readability and rewards |
| [REG-050](REG-050-wild-gauntlet-meditation-mode-identity.md) | P1 | Gameplay | Give Wild, Gauntlet, and Meditation stronger identities |
| [REG-051](REG-051-pass-and-play-and-social-challenge-decision.md) | P2 | Meta | Decide pass-and-play and social challenge scope |
| [REG-052](REG-052-leaderboards-trust-model-and-online-deferral.md) | P2 | Systems | Define leaderboard trust model before online work |
| [REG-053](REG-053-daily-streak-freeze-and-habit-loop-ethics.md) | P2 | Meta | Refine daily streaks, freezes, and habit ethics |
| [REG-054](REG-054-premium-vs-f2p-economy-positioning.md) | P2 | Meta | Lock premium versus F2P economy positioning |
| [REG-055](REG-055-localization-string-extraction-foundation.md) | P2 | Systems | Prepare localization and string extraction foundations |
| [REG-056](REG-056-cognitive-accessibility-and-older-player-comfort.md) | P1 | QA | Improve cognitive accessibility and older-player comfort |
| [REG-057](REG-057-webgl-context-loss-and-dom-fallback-recovery.md) | P1 | QA | Recover from WebGL context loss or fallback cleanly |
| [REG-058](REG-058-dev-sandbox-fixtures-and-story-state-matrix.md) | P2 | QA | Expand dev fixtures for design and bot validation |
| [REG-059](REG-059-asset-pipeline-rights-attribution-and-drop-in-readiness.md) | P1 | Systems | Harden asset rights, attribution, and drop-in workflow |
| [REG-060](REG-060-steam-package-installer-and-runtime-smoke.md) | P1 | QA | Verify Steam package, installer, and runtime behavior |
| [REG-061](REG-061-steam-store-screenshots-trailer-and-capsule-readiness.md) | P2 | Meta | Prepare store screenshots, trailer, and capsule readiness |
| [REG-062](REG-062-e2e-flake-budget-and-ci-visual-sharding.md) | P0 | QA | Control e2e flake budget and visual sharding |
| [REG-063](REG-063-privacy-telemetry-consent-and-pii-scrubbing.md) | P1 | Systems | Define privacy, telemetry consent, and PII scrubbing |
| [REG-064](REG-064-player-facing-copy-glossary-and-rules-language.md) | P1 | UI | Align player-facing rules language and glossary |
| [REG-065](REG-065-long-content-tail-level-pack-and-puzzle-curation.md) | P2 | Gameplay | Plan long content tail, level packs, and puzzle curation |
| [REG-066](REG-066-card-theme-system-and-theme-economy.md) | P2 | Meta | Define card themes and cosmetic theme economy |
| [REG-067](REG-067-device-motion-haptics-and-platform-permissions.md) | P2 | Systems | Decide device motion, haptics, and platform permissions |

## Complete Product Pass (third wave)

`REG-068` through `REG-119` are a **handoff-ready complete product plan** for a polished **offline / premium** build **including full mobile UI** (see **Current product scope (refinement bar)** above): run depth and economy, shop and route systems, end-to-end **Choose Path quality or better** on every major screen, final gameplay screen composition, performance hardening, audio/mix, release and Steam/demo packaging, save trust, and a **bot batch plan** with acceptance report. This wave **does not** require implementation bots to create final shippable art, audio, or store media — each ticket includes a **Placeholder and asset contract (placeholderNeeded)** section with slots and fallbacks. **Online leaderboards and mandatory live services** are **out of this ship** by product decision, not “maybe later by default” — they remain **deferred** per `REG-052` and telemetry/privacy tasks until a future **online** phase. Steam, installer, and store-readiness work remains aligned with `REG-060` and `REG-061` (implementation follows those + third-wave checklists, not this markdown pass).

| Task | Priority | Area | Focus |
| --- | --- | --- | --- |
| [REG-068](REG-068-complete-product-definition-of-done.md) | P0 | QA | Definition of done, ship gate, acceptance rubric |
| [REG-069](REG-069-run-map-route-node-system.md) | P1 | Gameplay | Run map, route nodes, determinism |
| [REG-070](REG-070-shop-vendor-stock-pricing-and-rerolls.md) | P1 | Gameplay | Shop vendor, stock, pricing, rerolls |
| [REG-071](REG-071-shop-item-catalog-consumables-and-services.md) | P1 | Gameplay | Item catalog, consumables, services |
| [REG-072](REG-072-wallet-run-currency-sinks-and-reward-pacing.md) | P1 | Gameplay | Wallet, sinks, reward pacing |
| [REG-073](REG-073-rest-shrine-heal-and-risk-services.md) | P1 | Gameplay | Rest, shrine, heal, risk services |
| [REG-074](REG-074-random-event-room-system.md) | P1 | Gameplay | Random events, choices |
| [REG-075](REG-075-treasure-chest-secret-room-and-bonus-rewards.md) | P1 | Gameplay | Chests, secrets, bonus rewards |
| [REG-076](REG-076-boss-elite-encounter-identity.md) | P1 | Gameplay | Boss and elite identity |
| [REG-077](REG-077-chapter-act-floor-biome-structure.md) | P1 | Gameplay | Chapters, acts, biomes, floor structure |
| [REG-078](REG-078-relic-offer-reroll-ban-and-upgrade-services.md) | P1 | Gameplay | Relic offer, reroll, ban, upgrade |
| [REG-079](REG-079-run-inventory-consumable-and-loadout-model.md) | P1 | Gameplay | Run inventory, consumables, loadout |
| [REG-080](REG-080-permanent-upgrade-tree-and-cosmetic-track.md) | P2 | Meta | Meta tree, cosmetic track |
| [REG-081](REG-081-challenge-mode-progression-and-unlock-gates.md) | P2 | Gameplay | Challenge mode, unlock gates |
| [REG-082](REG-082-quest-contract-campaign-ladder.md) | P1 | Gameplay | Quests, campaign ladder |
| [REG-083](REG-083-daily-weekly-season-archive.md) | P1 | Meta | Daily, weekly, season archive (offline-first) |
| [REG-084](REG-084-puzzle-pack-progression-medals-and-curation.md) | P2 | Gameplay | Puzzle packs, medals, curation |
| [REG-085](REG-085-run-history-build-replay-and-journal.md) | P1 | Systems | Run history, build, journal, replay |
| [REG-086](REG-086-balance-simulation-economy-and-drop-rate-tuning.md) | P1 | Systems | Balance sim, drop rates |
| [REG-087](REG-087-anti-softlock-fairness-and-edge-case-suite.md) | P0 | QA | Anti-softlock, fairness suite |
| [REG-088](REG-088-playable-first-run-to-first-win-campaign.md) | P0 | Gameplay | First run to first win |
| [REG-089](REG-089-final-rules-versioning-save-migration-gate.md) | P0 | Systems | Rules versions, save migration policy |
| [REG-090](REG-090-choose-path-quality-system-rollout.md) | P0 | UI | Choose Path quality bar rollout |
| [REG-091](REG-091-main-menu-final-hub-layout.md) | P0 | UI | Main menu hub |
| [REG-092](REG-092-settings-final-control-center.md) | P0 | UI | Settings as control center |
| [REG-093](REG-093-collection-final-reward-gallery.md) | P1 | UI | Collection, reward gallery |
| [REG-094](REG-094-inventory-final-loadout-and-run-prep-screen.md) | P1 | UI | Inventory, loadout, run prep |
| [REG-095](REG-095-codex-final-knowledge-base.md) | P1 | UI | Codex knowledge base |
| [REG-096](REG-096-game-over-final-results-and-next-run-loop.md) | P0 | UI | Game over, results, next run |
| [REG-097](REG-097-pause-and-overlay-final-decision-sheets.md) | P0 | UI | Pause, overlays, decisions |
| [REG-098](REG-098-first-run-onboarding-and-help-center-ui.md) | P0 | UI | Onboarding, help center |
| [REG-099](REG-099-navigation-shell-backstack-and-global-chrome.md) | P0 | UI | Nav shell, back stack, chrome |
| [REG-100](REG-100-empty-loading-error-and-locked-states.md) | P0 | UI | Empty, loading, error, locked |
| [REG-101](REG-101-copy-tone-rules-language-and-microcopy-pass.md) | P0 | UI | Copy, tone, rules language |
| [REG-102](REG-102-responsive-layout-final-device-grid.md) | P0 | UI | Responsive device grid |
| [REG-103](REG-103-touch-drag-pan-zoom-and-one-hand-comfort.md) | P0 | UI | Touch, drag, pan, one-hand |
| [REG-104](REG-104-gameplay-screen-final-composition.md) | P0 | UI | Gameplay screen composition |
| [REG-105](REG-105-board-stage-camera-dais-and-depth-finalization.md) | P0 | UI | Board stage, camera, depth |
| [REG-106](REG-106-hud-final-information-architecture.md) | P0 | UI | HUD information architecture |
| [REG-107](REG-107-power-toolbar-final-interactions-and-teaching.md) | P0 | Gameplay | Power toolbar, teaching |
| [REG-108](REG-108-card-state-feedback-animation-and-impact-system.md) | P0 | UI | Card feedback, animation, impact |
| [REG-109](REG-109-performance-budget-quality-preset-enforcement.md) | P0 | QA | Performance budget, quality presets |
| [REG-110](REG-110-memory-gpu-leak-and-context-lifecycle.md) | P0 | QA | Memory, GPU, context lifecycle |
| [REG-111](REG-111-input-latency-frame-pacing-and-responsiveness.md) | P0 | QA | Input latency, frame pacing |
| [REG-112](REG-112-effect-lod-reduced-motion-and-visual-noise-control.md) | P0 | QA | FX LOD, reduced motion, noise |
| [REG-113](REG-113-asset-placeholder-inventory-and-drop-in-contract.md) | P0 | Systems | Placeholder inventory, drop-in contract |
| [REG-114](REG-114-audio-final-mix-event-coverage-and-ducking.md) | P0 | Systems | Audio mix, coverage, ducking |
| [REG-115](REG-115-feature-flag-content-lock-and-release-readiness.md) | P0 | Systems | Feature flags, content lock, release |
| [REG-116](REG-116-credits-legal-about-and-attribution-surface.md) | P1 | Meta | Credits, legal, about |
| [REG-117](REG-117-save-backup-import-export-and-user-trust-flow.md) | P0 | Systems | Save backup, import/export, trust |
| [REG-118](REG-118-steam-demo-full-product-packaging-checklist.md) | P0 | Meta | Steam, demo, packaging checklist |
| [REG-119](REG-119-bot-batch-plan-and-product-acceptance-report.md) | P0 | QA | Bot batch plan, acceptance report |

*Task-writing and Markdown only: no API or runtime change is introduced by the REG documents themselves; implementation and schema work are separate PRs.*

## Fourth wave (enterprise depth & edge)

`REG-120` through `REG-147` extend the backlog with **combinatoric coverage**, **process gates**, and **edge-case matrices** that large teams typically keep explicit: mechanics × mutator × mode coverage, offline clock boundaries, negative/fault testing, RC roles, platform matrices (DPI, multi-monitor, input), Steam **client** edge cases without new **online** services, and a documented **no server anticheat** posture. They are **local/offline-first** and **Markdown-only** here; they cross-link the mechanics catalog, `REG-087` (softlock and fairness as an index), save trust (`REG-040` / `REG-117`), and product acceptance (`REG-119`). Bookends: [`REG-120`](REG-120-mechanics-combinatoric-matrix-and-coverage.md) (combinatoric anchor) and [`REG-147`](REG-147-local-trust-and-no-server-anticheat-posture.md) (local trust bookend).

| Task | Priority | Area | Focus |
| --- | --- | --- | --- |
| [REG-120](REG-120-mechanics-combinatoric-matrix-and-coverage.md) | P0 | QA | Combinatoric matrix, catalog traceability |
| [REG-121](REG-121-rng-determinism-replay-drift-audit.md) | P0 | Systems | RNG determinism, replay drift, version coupling |
| [REG-122](REG-122-utc-daily-weekly-clock-rollback-and-boundaries.md) | P0 | Systems | UTC, daily/weekly keys, clock rollback (offline) |
| [REG-123](REG-123-exploit-surface-economy-and-quit-farm.md) | P1 | Gameplay | Exploit surface, quit-farm (no online validation) |
| [REG-124](REG-124-skill-floor-ceiling-and-mode-difficulty-telemetry-offline.md) | P1 | Gameplay | Skill floor/ceiling, offline-only telemetry |
| [REG-125](REG-125-negative-test-and-fault-injection-suite.md) | P0 | QA | Negative tests, fault injection |
| [REG-126](REG-126-soak-test-and-long-session-stability.md) | P0 | QA | Soak, long sessions, memory/GPU |
| [REG-127](REG-127-local-crash-error-bucketing-privacy.md) | P0 | Systems | Local crash buckets, privacy-safe |
| [REG-128](REG-128-support-workflow-logs-and-redaction.md) | P1 | Systems | Support workflow, log redaction |
| [REG-129](REG-129-demo-versus-full-build-content-matrix.md) | P0 | Meta | Demo vs full build matrix |
| [REG-130](REG-130-release-candidate-gate-roles-and-signoff.md) | P0 | QA | RC gate, roles, signoff (offline) |
| [REG-131](REG-131-multimonitor-hidpi-sleep-and-exclusive-fullscreen.md) | P0 | QA | Multi-monitor, HiDPI, sleep, fullscreen |
| [REG-132](REG-132-controller-rebind-conflict-and-focus-loss.md) | P0 | QA | Controller, rebind, focus loss |
| [REG-133](REG-133-wcag-formal-matrix-and-screen-reader.md) | P0 | QA | WCAG matrix, screen reader |
| [REG-134](REG-134-pseudo-localization-and-string-overflow-qa.md) | P1 | Systems | Pseudo-loc, string overflow |
| [REG-135](REG-135-photosensitivity-and-rapid-strobe-audit.md) | P0 | QA | Photosensitivity, strobe audit |
| [REG-136](REG-136-content-data-completeness-and-orphan-audit.md) | P0 | Gameplay | Data completeness, orphan scan |
| [REG-137](REG-137-steam-offline-client-edge-cases.md) | P0 | Systems | Steam client offline, overlay |
| [REG-138](REG-138-rules-encyclopedia-drift-and-forbidden-combos.md) | P0 | Gameplay | Rules vs copy, forbidden combos |
| [REG-139](REG-139-migration-fuzzing-and-partial-corruption.md) | P0 | Systems | Save migration fuzz, partial corruption |
| [REG-140](REG-140-accessibility-acceptance-per-release.md) | P0 | QA | A11y acceptance per release |
| [REG-141](REG-141-balance-regression-baseline-snapshots.md) | P1 | Systems | Balance baselines, regression |
| [REG-142](REG-142-audio-routing-downmix-bluetooth-latency.md) | P0 | Systems | Audio routes, downmix, Bluetooth |
| [REG-143](REG-143-keyboard-repeat-chording-and-ghosting-edge-cases.md) | P1 | QA | Keyboard repeat, chording, ghosting |
| [REG-144](REG-144-laptop-battery-saver-thermal-graphics.md) | P1 | QA | Battery saver, thermal, graphics |
| [REG-145](REG-145-window-placement-and-persistence.md) | P0 | Systems | Window placement, persistence |
| [REG-146](REG-146-import-path-and-clipboard-safety.md) | P1 | Systems | Import path, clipboard safety |
| [REG-147](REG-147-local-trust-and-no-server-anticheat-posture.md) | P0 | Systems | Local trust, no server anticheat |

## Fifth wave (ultra-deep gameplay mechanics)

`REG-148` through `REG-156` add **ultra-deep gameplay** planning: a shared **hazard / trap** vocabulary (glass decoy, `trap_hall`, `glass_witness` — not a11y focus traps), **interaction matrices** and **pair-resolution timelines**, **floor archetype × mutator × objective** schedule coverage, **shop node hooks** that **defer** to `REG-015` / `REG-070` / `REG-071`, **run inventory** `RunState` vs **read-only** `InventoryScreen` invariants, **new hazard** research, **result tags** contract vs `GP-SECONDARY-OBJECTIVES`, and **relic/mutator exploit** review. All **local/offline-first** per `README` and `REG-052`. Bookends: [`REG-148`](REG-148-hazard-and-trap-vocabulary.md) and [`REG-156`](REG-156-relic-mutator-synergy-exploits-balance.md).

| Task | Priority | Area | Focus |
| --- | --- | --- | --- |
| [REG-148](REG-148-hazard-and-trap-vocabulary.md) | P0 | Gameplay | Hazard, decoy, archetype vocabulary |
| [REG-149](REG-149-glass-decoy-witness-scholar-cursed-interaction-matrix.md) | P0 | Gameplay | Decoy, witness, scholar, cursed matrix |
| [REG-150](REG-150-pair-resolution-timeline-gambit-wild-cursed.md) | P0 | Gameplay | Resolution timeline, gambit, wild |
| [REG-151](REG-151-floor-archetype-mutator-objective-synergy-coverage.md) | P0 | Gameplay | Archetype × mutator × objective |
| [REG-152](REG-152-shop-vendor-run-map-and-node-hooks.md) | P1 | Gameplay | Shop nodes, route hooks, gating |
| [REG-153](REG-153-run-inventory-runstate-invariants-and-ui-contract.md) | P0 | Gameplay | RunState vs inventory UI contract |
| [REG-154](REG-154-new-board-hazard-candidates-research.md) | P1 | Gameplay | New hazard candidates, research |
| [REG-155](REG-155-secondary-objectives-and-tags-deep-contract.md) | P0 | Gameplay | Secondary objectives, `LevelResult` tags |
| [REG-156](REG-156-relic-mutator-synergy-exploits-balance.md) | P1 | Gameplay | Relic/mutator exploits, balance |

## Sixth wave (hazard tile types — design and rollout)

`REG-157` through `REG-160` specify **hazard *tile* types** with **penalty** and **reward** outcomes (e.g. shuffle-on-miss, chain-remove on match): **taxonomy** ([`REG-157`](REG-157-hazard-tile-type-taxonomy-and-outcomes.md)), **engine hooks and invariants** in `game.ts` / contracts ([`REG-158`](REG-158-hazard-tile-engine-hooks-and-invariants.md)), **objective and balance matrix** ([`REG-159`](REG-159-hazard-tile-objective-and-balance-matrix.md)), and **UI, a11y, telegraphy** ([`REG-160`](REG-160-hazard-tile-ui-a11y-and-telegraphy.md)). They **extend** [`REG-148`](REG-148-hazard-and-trap-vocabulary.md) and [`REG-154`](REG-154-new-board-hazard-candidates-research.md); implementation PRs are **separate** from this Markdown pass. All **local/offline-first** per `README` and `REG-052`. Bookends: [`REG-157`](REG-157-hazard-tile-type-taxonomy-and-outcomes.md) and [`REG-160`](REG-160-hazard-tile-ui-a11y-and-telegraphy.md).

| Task | Priority | Area | Focus |
| --- | --- | --- | --- |
| [REG-157](REG-157-hazard-tile-type-taxonomy-and-outcomes.md) | P0 | Gameplay | Penalty/reward/dual families, non-goals |
| [REG-158](REG-158-hazard-tile-engine-hooks-and-invariants.md) | P0 | Gameplay | Engine hooks, `GAME_RULES_VERSION`, invariants |
| [REG-159](REG-159-hazard-tile-objective-and-balance-matrix.md) | P0 | Gameplay | Objectives, balance vs `REG-086` / `REG-156` |
| [REG-160](REG-160-hazard-tile-ui-a11y-and-telegraphy.md) | P0 | QA | Telegraphy, `aria`, `REG-112` motion |

## Priority Rules

P0 tasks block a refined release feel because they affect core playability, mobile usability, visual regression confidence, or economy contract decisions.

P1 tasks materially deepen the game or improve high-traffic surfaces but can follow the first release-readiness pass.

P2 tasks are valuable polish or expansion tracks that should be scoped after the foundation is stable.

## Implementation Notes

- Cross-link existing `REF-*`, `GP-*`, `PLAY-*`, `HUD-*`, `META-*`, `OVR-*`, `A11Y-*`, and `PERF-*` work instead of duplicating completed task bodies.
- Use current screenshots under `test-results/visual-screens/` for immediate truth, and refresh them before any final visual signoff.
- Keep individual implementation PRs small enough to verify with targeted visual captures, focused tests, and manual gameplay checks.
- For long-running bot execution, start with `REG-033`, then use **`REG-068`–`REG-119`** (Complete Product Pass), **`REG-120`–`REG-147`** (fourth wave: enterprise depth & edge), **`REG-148`–`REG-156`** (fifth wave: ultra-deep gameplay mechanics), and **`REG-157`–`REG-160`** (sixth wave: hazard tile types) for end-state sequencing, `REG-119` for batch plan and acceptance; clear P0 tasks before broad P1/P2 expansion.

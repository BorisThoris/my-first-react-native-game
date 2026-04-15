# Documentation catalog (markdown index)

**Purpose:** Every `.md` under `docs/` is listed so nothing is “orphaned” from the internal wiki. **One-line summaries** are for navigation; authoritative detail stays in each file.

**Count:** ~150 markdown files under `docs/` (exact count drifts as files are added).

---

## Portal

| File | Summary |
|------|---------|
| [README.md](../README.md) | Entry to `docs/`; points at internal wiki |
| [internal-wiki/README.md](./README.md) | Wiki home: quick links + concern map |

---

## `docs/` root (topic memos)

| File | Summary |
|------|---------|
| [BALANCE_NOTES.md](../BALANCE_NOTES.md) | Numeric balance notes |
| [COLLECTIBLE_SYSTEM.md](../COLLECTIBLE_SYSTEM.md) | Collectibles design |
| [FINDABLES.md](../FINDABLES.md) | Findables mechanic |
| [GAMEPLAY_SYSTEMS_ANALYSIS.md](../GAMEPLAY_SYSTEMS_ANALYSIS.md) | **Desktop** systems map: who owns what |
| [GAME_FORGIVENESS_CODE_AUDIT.md](../GAME_FORGIVENESS_CODE_AUDIT.md) | Forgiveness: code audit |
| [GAME_FORGIVENESS_DEEP_DIVE.md](../GAME_FORGIVENESS_DEEP_DIVE.md) | Forgiveness: design deep dive |
| [GAME_MECHANICS_IDEAS.md](../GAME_MECHANICS_IDEAS.md) | Mechanics idea backlog |
| [GAME_MECHANICS_IDEAS_TASKS.md](../GAME_MECHANICS_IDEAS_TASKS.md) | Task breakdown for ideas |
| [GAME_MECHANICS_PLAN.md](../GAME_MECHANICS_PLAN.md) | Planning / roadmap notes |
| [GAME_TECHSTACK_ANALYSIS.md](../GAME_TECHSTACK_ANALYSIS.md) | **Historical / Expo-era** tech survey — see [LEGACY_AND_CAVEATS.md](./LEGACY_AND_CAVEATS.md) |
| [HOOK_AND_DEPTH_TASKS.md](../HOOK_AND_DEPTH_TASKS.md) | Hook + depth backlog |
| [IDEAS_AUDITS.md](../IDEAS_AUDITS.md) | Idea audits |
| [LEADERBOARDS_DEFERRAL.md](../LEADERBOARDS_DEFERRAL.md) | Leaderboards deferral rationale |
| [MARKET_SIMILAR_GAMES_RESEARCH.md](../MARKET_SIMILAR_GAMES_RESEARCH.md) | Market / comps research |
| [MUTATORS.md](../MUTATORS.md) | Mutator reference checklist |
| [OBSIDIAN_RELIC_THEORY.md](../OBSIDIAN_RELIC_THEORY.md) | Relic design theory |
| [PICTURE_SUPERIORITY_CHECKLIST.md](../PICTURE_SUPERIORITY_CHECKLIST.md) | Picture-superiority UX checklist |
| [PUZZLE_CONTRIBUTING.md](../PUZZLE_CONTRIBUTING.md) | Contributing puzzles |
| [RELIC_ROSTER.md](../RELIC_ROSTER.md) | Relic roster |
| [RELIC_SYNERGY_PLAYTEST.md](../RELIC_SYNERGY_PLAYTEST.md) | Relic synergy playtest notes |
| [STRAY_TILE.md](../STRAY_TILE.md) | Stray tile mechanic |
| [SYMBOL_GUIDELINES.md](../SYMBOL_GUIDELINES.md) | Symbol art / semantics guidelines |
| [VIEWPORT_FIT_UI.md](../VIEWPORT_FIT_UI.md) | Viewport fit / shell behavior |
| [AUDIO_INTEGRATION.md](../AUDIO_INTEGRATION.md) | Web Audio procedural **gameplay SFX** wiring (`gameSfx.ts`, store hooks) |
| [gameplay/RUN_SESSION_DEBUG.md](../gameplay/RUN_SESSION_DEBUG.md) | Timer ownership and debugging run session |

---

## `docs/gameplay/`

| File | Summary |
|------|---------|
| [README.md](../gameplay/README.md) | Epic index + maintenance rules |
| [GAMEPLAY_MECHANICS_CATALOG.md](../gameplay/GAMEPLAY_MECHANICS_CATALOG.md) | **Master** mechanics matrix + contract appendices |
| [GAMEPLAY_MECHANICS_CATALOG.auto-appendix.md](../gameplay/GAMEPLAY_MECHANICS_CATALOG.auto-appendix.md) | Machine snapshot (`yarn docs:mechanics-appendix`) — versions + catalog counts |
| [GAMEPLAY_POLISH_AND_GAPS.md](../gameplay/GAMEPLAY_POLISH_AND_GAPS.md) | Consolidated polish, partial implementations, UX/doc risks |
| [epic-core-memory-loop.md](../gameplay/epic-core-memory-loop.md) | Flips, match flow, gambit, wild/decoy |
| [epic-run-session-flow.md](../gameplay/epic-run-session-flow.md) | Memorize/play/resolve, pause, relic gate |
| [epic-board-rendering-assists.md](../gameplay/epic-board-rendering-assists.md) | Board, findables, hints, WebGL |
| [epic-mutators.md](../gameplay/epic-mutators.md) | Mutator IDs, daily, endless schedule |
| [epic-scoring-objectives.md](../gameplay/epic-scoring-objectives.md) | Scoring, objectives, penalties |
| [epic-lives-and-pressure.md](../gameplay/epic-lives-and-pressure.md) | Lives, guard, timer, parasite |
| [epic-powers-and-interactions.md](../gameplay/epic-powers-and-interactions.md) | Powers, toolbar, tile actions |
| [epic-relics.md](../gameplay/epic-relics.md) | Relics, milestones |
| [epic-modes-and-runs.md](../gameplay/epic-modes-and-runs.md) | Modes, puzzles, import/export |
| [epic-meta-progression.md](../gameplay/epic-meta-progression.md) | Achievements, telemetry, saves |
| [epic-contracts-challenge-runs.md](../gameplay/epic-contracts-challenge-runs.md) | Scholar / pin vow contracts |
| [epic-content-symbols-and-generation.md](../gameplay/epic-content-symbols-and-generation.md) | Symbols, generation |
| [epic-presentation-motion-fx.md](../gameplay/epic-presentation-motion-fx.md) | Motion, shuffle, reduce motion |
| [epic-onboarding-codex-copy.md](../gameplay/epic-onboarding-codex-copy.md) | FTUE, Codex, copy |
| [epic-audio-feedback.md](../gameplay/epic-audio-feedback.md) | Audio vs settings |
| [epic-readonly-meta-ui.md](../gameplay/epic-readonly-meta-ui.md) | Codex, collection, inventory (read-only) |
| [epic-choose-your-path.md](../gameplay/epic-choose-your-path.md) | Choose Your Path shell: layout/zoom, drag-first carousel, magnifier search, a11y, QA matrix |

---

## `docs/gameplay-depth/`

| File | Summary |
|------|---------|
| [README.md](../gameplay-depth/README.md) | Depth series intro |
| [01-floor-identity-and-archetypes.md](../gameplay-depth/01-floor-identity-and-archetypes.md) | Floor identity |
| [02-helper-tiers-and-cognitive-jobs.md](../gameplay-depth/02-helper-tiers-and-cognitive-jobs.md) | Helpers / cognitive load |
| [03-mutators-as-spine-relics-as-build.md](../gameplay-depth/03-mutators-as-spine-relics-as-build.md) | Mutators vs relics framing |
| [04-secondary-objectives.md](../gameplay-depth/04-secondary-objectives.md) | Secondary objectives |
| [05-app-specific-idea-backlog.md](../gameplay-depth/05-app-specific-idea-backlog.md) | App-specific backlog |

---

## `docs/gameplay-tasks/` (GP backlog)

| File | Summary |
|------|---------|
| [README.md](../gameplay-tasks/README.md) | GP task index |
| [ENCYCLOPEDIA_FOLLOWUP_TASKS.md](../gameplay-tasks/ENCYCLOPEDIA_FOLLOWUP_TASKS.md) | Codex & mechanics encyclopedia follow-up |
| [GP-FINDABLES.md](../gameplay-tasks/GP-FINDABLES.md) | Findables tasks |
| [GP-FLOOR-SCHEDULE.md](../gameplay-tasks/GP-FLOOR-SCHEDULE.md) | Floor schedule tasks |
| [GP-HELPERS.md](../gameplay-tasks/GP-HELPERS.md) | Helpers tasks |
| [GP-MODES.md](../gameplay-tasks/GP-MODES.md) | Modes tasks |
| [GP-RELICS-CONTRACTS.md](../gameplay-tasks/GP-RELICS-CONTRACTS.md) | Relics / contracts tasks |
| [GP-SECONDARY-OBJECTIVES.md](../gameplay-tasks/GP-SECONDARY-OBJECTIVES.md) | Secondary objectives tasks |

---

## `docs/new_design/` (redesign package)

| File | Summary |
|------|---------|
| [README.md](../new_design/README.md) | New design package index |
| [ASSET_AND_ART_PIPELINE.md](../new_design/ASSET_AND_ART_PIPELINE.md) | Asset pipeline |
| [CARD_TEXTURE_AI_BRIEF.md](../new_design/CARD_TEXTURE_AI_BRIEF.md) | Card texture AI brief |
| [COMPONENT_CATALOG.md](../new_design/COMPONENT_CATALOG.md) | UI component catalog |
| [CURRENT_VS_TARGET_GAP_ANALYSIS.md](../new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md) | Gap analysis |
| [DROP_IN_ASSET_CHECKLIST.md](../new_design/DROP_IN_ASSET_CHECKLIST.md) | Drop-in asset checklist |
| [FX_REDUCE_MOTION_MATRIX.md](../new_design/FX_REDUCE_MOTION_MATRIX.md) | FX × reduce motion |
| [HOVER_DOM_WEBGL_TOKENS.md](../new_design/HOVER_DOM_WEBGL_TOKENS.md) | Hover tokens DOM vs WebGL |
| [I18N_FOUNDATION.md](../new_design/I18N_FOUNDATION.md) | i18n foundation |
| [IMPLEMENTATION_SEQUENCE.md](../new_design/IMPLEMENTATION_SEQUENCE.md) | Implementation order |
| [MOTION_AND_STATE_SPEC.md](../new_design/MOTION_AND_STATE_SPEC.md) | Motion + state |
| [NAVIGATION_MODEL.md](../new_design/NAVIGATION_MODEL.md) | Navigation model |
| [PERFORMANCE_BUDGET.md](../new_design/PERFORMANCE_BUDGET.md) | Performance budget |
| [REFERENCE_IMAGE_AUDIT.md](../new_design/REFERENCE_IMAGE_AUDIT.md) | Reference image audit |
| [REFERENCE_VS_SCENARIOS.md](../new_design/REFERENCE_VS_SCENARIOS.md) | Reference vs scenarios |
| [SCREEN_SPEC_GAMEPLAY.md](../new_design/SCREEN_SPEC_GAMEPLAY.md) | Gameplay screen spec |
| [SCREEN_SPEC_MAIN_MENU.md](../new_design/SCREEN_SPEC_MAIN_MENU.md) | Main menu spec |
| [SCREEN_SPEC_MODE_SELECTION.md](../new_design/SCREEN_SPEC_MODE_SELECTION.md) | Mode selection spec |
| [SCREEN_SPEC_SETTINGS.md](../new_design/SCREEN_SPEC_SETTINGS.md) | Settings spec |
| [SETTINGS_REFERENCE_CONTROLS_MATRIX.md](../new_design/SETTINGS_REFERENCE_CONTROLS_MATRIX.md) | Settings controls matrix |
| [VISUAL_REVIEW.md](../new_design/VISUAL_REVIEW.md) | Visual review |
| [VISUAL_SYSTEM_SPEC.md](../new_design/VISUAL_SYSTEM_SPEC.md) | Visual system |

### `docs/new_design/TASKS/`

| File | Summary |
|------|---------|
| [README.md](../new_design/TASKS/README.md) | TASK index + completion tracking |
| [TASK-001-theme-foundation-and-assets.md](../new_design/TASKS/TASK-001-theme-foundation-and-assets.md) | Theme foundation |
| [TASK-002-shared-ui-primitives.md](../new_design/TASKS/TASK-002-shared-ui-primitives.md) | Shared primitives |
| [TASK-003-main-menu-redesign.md](../new_design/TASKS/TASK-003-main-menu-redesign.md) | Main menu |
| [TASK-004-gameplay-hud-and-shell.md](../new_design/TASKS/TASK-004-gameplay-hud-and-shell.md) | HUD + shell |
| [TASK-005-card-states-and-fx.md](../new_design/TASKS/TASK-005-card-states-and-fx.md) | Card states / FX |
| [TASK-006-settings-shell.md](../new_design/TASKS/TASK-006-settings-shell.md) | Settings shell |
| [TASK-007-mode-selection-and-menu-ia.md](../new_design/TASKS/TASK-007-mode-selection-and-menu-ia.md) | Mode selection IA |
| [TASK-008-gap-surfaces-and-regression.md](../new_design/TASKS/TASK-008-gap-surfaces-and-regression.md) | Gap surfaces |
| [TASK-009-final-menu-and-gameplay-illustrations.md](../new_design/TASKS/TASK-009-final-menu-and-gameplay-illustrations.md) | Illustrations |
| [TASK-010-final-logo-and-emblem-lockup.md](../new_design/TASKS/TASK-010-final-logo-and-emblem-lockup.md) | Logo lockup |
| [TASK-011-final-card-art-and-texture-pipeline.md](../new_design/TASKS/TASK-011-final-card-art-and-texture-pipeline.md) | Card art pipeline |
| [TASK-012-card-interaction-fx-and-celebration.md](../new_design/TASKS/TASK-012-card-interaction-fx-and-celebration.md) | Card interaction FX |
| [TASK-013-gameplay-hud-segment-ornament-pass.md](../new_design/TASKS/TASK-013-gameplay-hud-segment-ornament-pass.md) | HUD ornament |
| [TASK-014-visual-reference-captures-and-diff-process.md](../new_design/TASKS/TASK-014-visual-reference-captures-and-diff-process.md) | Reference capture process |
| [TASK-015-settings-schema-for-reference-controls.md](../new_design/TASKS/TASK-015-settings-schema-for-reference-controls.md) | Settings schema |
| [TASK-016-profile-and-meta-menu-strip.md](../new_design/TASKS/TASK-016-profile-and-meta-menu-strip.md) | Profile strip |
| [TASK-017-social-and-community-strip.md](../new_design/TASKS/TASK-017-social-and-community-strip.md) | Social strip |
| [TASK-018-mode-select-card-illustrations.md](../new_design/TASKS/TASK-018-mode-select-card-illustrations.md) | Mode card art |
| [TASK-019-reference-stills-and-scenario-audit-matrix.md](../new_design/TASKS/TASK-019-reference-stills-and-scenario-audit-matrix.md) | Scenario audit matrix |
| [TASK-020-endproduct-screenshot-audit-and-captures.md](../new_design/TASKS/TASK-020-endproduct-screenshot-audit-and-captures.md) | End-product screenshots |
| [TASKS_A11Y_I18N_E2E.md](../new_design/TASKS/TASKS_A11Y_I18N_E2E.md) | Cross-cutting a11y / i18n / e2e |
| [TASKS_ARCHIVE_PARITY.md](../new_design/TASKS/TASKS_ARCHIVE_PARITY.md) | Archive parity |
| [TASKS_ASSETS_QA.md](../new_design/TASKS/TASKS_ASSETS_QA.md) | Assets QA |
| [TASKS_CARDS_VFX_PARITY.md](../new_design/TASKS/TASKS_CARDS_VFX_PARITY.md) | Cards VFX parity |
| [TASKS_COMPLETION_LOG.md](../new_design/TASKS/TASKS_COMPLETION_LOG.md) | Completion log |
| [TASKS_CROSSCUTTING.md](../new_design/TASKS/TASKS_CROSSCUTTING.md) | Crosscutting tasks |
| [TASKS_DESIGN_SYSTEM.md](../new_design/TASKS/TASKS_DESIGN_SYSTEM.md) | Design system |
| [TASKS_HUD_PARITY.md](../new_design/TASKS/TASKS_HUD_PARITY.md) | HUD parity |
| [TASKS_META_AND_SHELL.md](../new_design/TASKS/TASKS_META_AND_SHELL.md) | Meta + shell |
| [TASKS_NAVIGATION_STATE.md](../new_design/TASKS/TASKS_NAVIGATION_STATE.md) | Navigation state |
| [TASKS_OVERLAYS_FTUE.md](../new_design/TASKS/TASKS_OVERLAYS_FTUE.md) | Overlays / FTUE |
| [TASKS_PERFORMANCE_GRAPHICS.md](../new_design/TASKS/TASKS_PERFORMANCE_GRAPHICS.md) | Performance / graphics |
| [TASKS_PLAYING_ENDPRODUCT.md](../new_design/TASKS/TASKS_PLAYING_ENDPRODUCT.md) | Playing vs end product |
| [TASKS_SIDEBAR_PARITY.md](../new_design/TASKS/TASKS_SIDEBAR_PARITY.md) | Sidebar parity |
| [TASKS_TILE_BOARD_WEBGL_FX_V2.md](../new_design/TASKS/TASKS_TILE_BOARD_WEBGL_FX_V2.md) | Tile board WebGL FX v2 |

---

## `docs/reference-comparison/`

| File | Summary |
|------|---------|
| [CURRENT_VS_ENDPRODUCT.md](../reference-comparison/CURRENT_VS_ENDPRODUCT.md) | Current vs end-product comparison |
| [TILE_BOARD_WEBGL_FX_V2_AUDIT.md](../reference-comparison/TILE_BOARD_WEBGL_FX_V2_AUDIT.md) | WebGL FX v2 audit |

---

## `docs/research/`

| File | Summary |
|------|---------|
| [RESEARCH_LOG.md](../research/RESEARCH_LOG.md) | Dated research log |

---

## `docs/UI_TASKS/`

| File | Summary |
|------|---------|
| [README.md](../UI_TASKS/README.md) | Mobile UI task index |
| [TASK-001-mobile-onboarding-content.md](../UI_TASKS/TASK-001-mobile-onboarding-content.md) | Onboarding content |
| [TASK-002-mobile-overlays-legibility.md](../UI_TASKS/TASK-002-mobile-overlays-legibility.md) | Overlays legibility |
| [TASK-003-mobile-settings-footer-actions.md](../UI_TASKS/TASK-003-mobile-settings-footer-actions.md) | Settings footer |
| [TASK-004-mobile-settings-copy.md](../UI_TASKS/TASK-004-mobile-settings-copy.md) | Settings copy |
| [TASK-005-mobile-landscape-coverage.md](../UI_TASKS/TASK-005-mobile-landscape-coverage.md) | Landscape coverage |

---

## `docs/visual-capture/`

| File | Summary |
|------|---------|
| [README.md](../visual-capture/README.md) | Capture workflow + matrix |
| [INVENTORY.md](../visual-capture/INVENTORY.md) | Generated inventory |
| `*/landscape/AUDIT.md`, `*/portrait/AUDIT.md` | Per-device/orientation audit notes (desktop-1280, desktop-1440, ipad-11, iphone-14-pro, iphone-se, laptop-1366, phone-large, pixel-7) |

---

## `docs/wip-assets/`

| File | Summary |
|------|---------|
| [README.md](../wip-assets/README.md) | WIP asset buckets and policy |

---

## `docs/internal-wiki/`

| File | Summary |
|------|---------|
| [README.md](./README.md) | Wiki home |
| [multiple-agents.md](./multiple-agents.md) | Parallel agent workflow |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layer diagram + entry points |
| [SOURCE_MAP.md](./SOURCE_MAP.md) | `src/` module map |
| [TOOLING.md](./TOOLING.md) | Scripts and tooling |
| [E2E_AND_QA.md](./E2E_AND_QA.md) | Playwright spec matrix |
| [DOCS_CATALOG.md](./DOCS_CATALOG.md) | This file |
| [LEGACY_AND_CAVEATS.md](./LEGACY_AND_CAVEATS.md) | Legacy + doc caveats |
| [COVERAGE.md](./COVERAGE.md) | Coverage methodology |

---

## Renderer source doc (outside `docs/`)

| File | Summary |
|------|---------|
| [ASSET_SOURCES.md](../../src/renderer/assets/ASSET_SOURCES.md) | Authored vs generated assets |

# Current vs Target Gap Analysis

## Purpose
This document maps the reference images against the current live renderer and classifies each area as:
- `Restylable existing surface`
- `Structurally mismatched existing surface`
- `Missing screen`
- `Missing model support`
- `Asset-only dependency`

## Related
- **Screenshot delta tables** (Playwright captures vs `ENDPRODUCTIMAGE*.png`): [`docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`](../reference-comparison/CURRENT_VS_ENDPRODUCT.md). Maintenance: [`docs/new_design/TASKS/TASK-020-endproduct-screenshot-audit-and-captures.md`](TASKS/TASK-020-endproduct-screenshot-audit-and-captures.md).

## Current Live App Boundaries

### Active Views Today
From `src/shared/contracts.ts`, current live `ViewState` coverage is:
- `boot`
- `menu`
- `settings`
- `playing`
- `gameOver`
- `modeSelect` (Choose Your Path)
- `collection`
- `inventory` (in-run overlay; also routed from store)
- `codex` (in-run overlay; also routed from store)

### Key Current Screens and Systems
- `MainMenu`, `ChooseYourPathScreen`, `CollectionScreen`, `InventoryScreen`, `CodexScreen` (meta surfaces)
- `GameScreen`, `TileBoard`
- `SettingsScreen`, `GameOverScreen`
- `OverlayModal`
- Shared primitives under `src/renderer/ui/`

### Current Visual Test Coverage
From `e2e/visualScenarioSteps.ts`, the visual workflow captures:
- startup intro (`00`)
- main menu (`01`), Choose Your Path (`01a`), collection (`01b`), menu inventory empty (`01c-inventory-empty`), in-run inventory (`01d-inventory-active`), in-run codex (`01e-codex`)
- main menu with how-to (`02`)
- settings (`03`)
- gameplay (`04`)
- pause, run settings, floor cleared, game over (`05`–`08`)

---

## Main Menu Mapping

| Reference Element | Current App Status | Classification | Notes |
|---|---|---|---|
| Illustrated hero background | `MainMenuBackground` exists but is abstract and procedural | Structurally mismatched existing surface | Scene art direction still the main asset gap |
| Large logo lockup with emblem | Title treatment improved; may still be text-forward | Asset-only dependency | Ornamental logo raster optional |
| Vertical CTA stack | Centered primary stack + Play → mode select | Restylable existing surface | IA largely aligned |
| Curated primary menu | Extra modes moved to secondary surface | Restylable existing surface | Matches redesign direction |
| Collection destination | Live route from main menu | Restylable existing surface | Content depth is catalog/mock aware |
| Daily challenge card | Daily reachable from Choose Your Path / secondary | Restylable existing surface | Promo card chrome vs reference |
| Current run card | Last-run / best-score region exists | Restylable existing surface | Composition tuning |
| Player profile/meta strip | No live profile/currency layer | Missing model support | Future product layer |
| Social/community strip | No live equivalent | Missing screen or external-link feature | Not required for initial live parity |

### Main Menu Summary
- Menu IA and routing match the redesign program; remaining gap is mostly illustration/logo assets and premium chrome density.

### Profile / social strips (TASK-016 / TASK-017 resolution)
- **Profile / meta strip:** Not required for the current Steam demo scope; tracked as optional product work in `docs/new_design/TASKS/TASK-016-profile-and-meta-menu-strip.md`.
- **Social / community strip:** Not in v1; defer or use external storefront links only if product approves—see `docs/new_design/TASKS/TASK-017-social-and-community-strip.md`.

---

## Gameplay Mapping

| Reference Element | Current App Status | Classification | Notes |
|---|---|---|---|
| Illustrated dungeon stage | Gameplay background exists but is abstract | Structurally mismatched existing surface | Stronger illustrated environment = asset pass |
| Ornate segmented top HUD | HUD modules restyled toward reference | Restylable existing surface | Score dominance and segment ornament still tunable |
| Score-centered hierarchy | Score emphasized in HUD | Restylable existing surface | Further typography/glow pass possible |
| Left icon rail | Premium-styled rail + flyout | Restylable existing surface | Inventory/Codex in flyout |
| Sidebar flyout with labels | Flyout with labeled actions | Restylable existing surface | Parity with reference sidebar |
| Collection/inventory/codex entries | Live flyout + full-screen meta where routed | Restylable existing surface | Collection is menu-first per IA |
| Premium card back/front treatment | `tileTextures` + board CSS / WebGL | Structurally mismatched existing surface | Asset + state FX still main lever |
| Hover, flip, matched, mismatch FX | Implemented; iteratively stronger | Restylable existing surface | See TASK-005 |
| Score popup and celebratory burst | Partial feedback | Structurally mismatched existing surface | FX layer can deepen |

### Gameplay Summary
- Structure and routes are in place; highest-impact remaining work is card-state FX and illustrated environment assets.

---

## Settings Mapping

| Reference Element | Current App Status | Classification | Notes |
|---|---|---|---|
| Framed settings shell | Category shell with left rail | Restylable existing surface | Premium pane layout landed |
| Left category rail | Present | Restylable existing surface | — |
| Gameplay section pane | Mapped | Restylable existing surface | — |
| Difficulty selector | Not in live `Settings` model | Missing model support | Mock or future |
| Timer mode selector | Not in live model | Missing model support | Mock or future |
| Max-lives selector | Not in live model | Missing model support | Mock or future |
| Card theme selector | Not in live model | Missing model support | Mock or future |
| Tutorial hints toggle | Partial / onboarding | Structurally mismatched existing surface | Explicit mapping optional |
| Audio, Video, Controls, Accessibility, About | Categories live; Controls/About UI-first where noted | Restylable existing surface | Schema expansion still future |

### Current Live Settings Model Notes
Current `Settings` model supports:
- `masterVolume`, `musicVolume`, `sfxVolume`
- `displayMode`, `uiScale`, `reduceMotion`
- `boardPresentation`, `tileFocusAssist`, `resolveDelayMultiplier`
- `weakerShuffleMode`, `echoFeedbackEnabled`, `distractionChannelEnabled`, `shuffleScoreTaxEnabled`

### Settings Summary
- Shell and IA are implemented; several reference-only controls still need an honest “future” label or schema work.

---

## Mode Selection Mapping

| Reference Element | Current App Status | Classification | Notes |
|---|---|---|---|
| Dedicated `Choose Your Path` screen | Live `modeSelect` view | Restylable existing surface | — |
| Classic Run card | Maps to current start flow | Restylable existing surface | — |
| Daily Challenge card | Maps to daily | Restylable existing surface | — |
| Endless Mode card | Gated / locked per product | Missing model support or mock | Labeled in UI |
| Featured mode-card state | Mode cards with lock states | Restylable existing surface | — |
| Timer badge on daily card | Countdown presentation where implemented | Restylable existing surface | — |

### Extra Live Modes Not Present in the Reference
Additional modes remain reachable from secondary surfaces (`more run types`, etc.) per IA decision.

---

## Game Over and Overlays Mapping

| Reference Element | Current App Status | Classification | Notes |
|---|---|---|---|
| Premium summary shell | `GameOverScreen` restyled | Restylable existing surface | Phase 8 polish ongoing |
| Premium overlay language | `OverlayModal` aligned with shell tokens | Restylable existing surface | — |
| Dense debug/export block demotion | Export/debug collapsed or de-emphasized | Restylable existing surface | Functionality retained |

---

## Shared Primitive Mapping

| Current Primitive | Reference Need | Classification |
|---|---|---|
| `UiButton` | Premium beveled CTA | Restylable existing surface |
| `Panel` | Ornamental panel family | Restylable existing surface |
| `ScreenTitle` | Display hierarchy | Restylable existing surface |
| `StatTile` | Premium status cards | Restylable existing surface |

---

## Asset Gaps

### Required for Close Fidelity
- Illustrated menu scene
- Illustrated gameplay scene
- Logo lockup or emblem
- Icon family
- Card back / face final art
- Optional mode-card art
- Display font files (if not already final)

### Conclusion
CSS and routing can only go so far; reference fidelity still depends on asset onboarding.

---

## Contract and Routing Gaps to Record

### Resolved routing (was future-only in early drafts)
- `Choose Your Path` (`modeSelect`)
- `Collection`, `Inventory`, `Codex` (see store and `App.tsx` for when each is full-screen vs overlay)

### Future model gaps (still valid)
- Distinct settings for difficulty, timer mode, max lives, and card theme
- Optional meta/profile data for top menu strip
- Optional currencies if the menu should mirror the reference literally

### Current package rule
Mock or unsupported controls must stay labeled honestly in UI and tests.

---

## Final Gap Summary
- Main menu: IA and routes aligned; illustration and logo assets remain the main gap.
- Gameplay shell: structure and flyout landed; card FX and stage art are the main gap.
- Settings: shell done; several reference controls remain model-future.
- Game over/modals: functional; presentation can still move closer to reference.
- Mode selection and meta screens: live; content depth follows catalog/save data.
- Asset pipeline: still the hard dependency for pixel-level reference match.

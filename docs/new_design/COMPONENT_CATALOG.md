# Component Catalog

## Purpose
This catalog normalizes the reusable UI and presentation components implied by the references. Each component appears once here, then maps to target screens and current code areas.

## Naming Convention
- `Primitive`: shared presentational building block
- `Composite`: larger reusable assembly built from primitives
- `Surface`: full screen or major page shell

## Gameplay left toolbar IA (SIDE-002)

**Component:** [`GameLeftToolbar`](../../src/renderer/components/GameLeftToolbar.tsx) (in-game left rail).

| Surface | Purpose | Examples |
|--------|---------|----------|
| **Always-visible rail** | One-tap gameplay and shell actions | Utility toggle, Fit board, pause/resume, settings, codex, inventory, main menu (abandon confirm), power row (shuffle, pin, destroy, peek, stray), undo while resolving |
| **Utility flyout** | Overflow-friendly labels for paths also on the rail | Inventory, codex (pause is rail-only); **Close** control (SIDE-009); dismissed by outside click, scrim, Escape |
| **Modals only** | Run-scoped settings, inventory/codex overlays, pause/floor modals | `SettingsScreen` (playing), `OverlayModal`, meta `modalOverlay` for in-run codex/inventory |

Settings are **rail-only** (flyout no longer duplicates Settings). Inventory and codex appear on both rail and flyout so players can use either pattern.

## Meta surfaces IA (META-004 – META-007)

| Screen | Primary job | Navigation | Notes |
|--------|-------------|------------|-------|
| **MainMenu** | Mode entry, collection, codex, inventory, settings | Poster cards + meta row | Hub screen; no long-form TOC. |
| **CodexScreen** | Read-only rules reference | Header **Back** + in-page TOC → anchors | [`MetaScreen.module.css`](../../src/renderer/components/MetaScreen.module.css) `.inPageToc`, `.sectionAnchor`. |
| **CollectionScreen** | Save progress / unlocks | Header **Back** + in-page TOC | Jumps to achievements, relics, bests, daily, symbols. |
| **InventoryScreen** | Active run loadout | Header **Back** + in-page TOC | Run summary, relics, mutators, charges, contract. |
| **GameOverScreen** | Run summary + export | Hero + side rail + details | **META-002:** same stack as main menu — Pixi atmosphere, **`sceneLayer`** (`UI_ART.menuScene`), dual-gradient **scrim** (`MainMenu` rim + radial), hero **crest lockup** (`UI_ART.brandCrest`) on the summary plate. |

---

## Shared Primitives

### 1. Display Title
- Type: Primitive
- Purpose: large gold serif heading for logo-adjacent titles, screen headers, and hero headings
- Variants:
  - Logo title
  - Screen title
  - Card title
  - HUD numeric emphasis
- Current mapping:
  - `ScreenTitle`
  - global theme and font stack

### 2. Eyebrow Label
- Type: Primitive
- Purpose: small uppercase support label above stats or headings
- Variants:
  - HUD label
  - Section label
  - Status label
- Current mapping:
  - `Eyebrow`
  - HUD helper labels in `GameScreen`

### 3. Framed Button
- Type: Primitive
- Purpose: premium action button with bevel, border, and inner glow
- Variants:
  - Primary CTA
  - Secondary CTA
  - Footer button
  - Menu-stack button
- Current mapping:
  - `UiButton`

### 4. Icon Capsule
- Type: Primitive
- Purpose: framed icon holder used inside buttons, sidebars, cards, and utility strips
- Variants:
  - Round medallion
  - Square utility icon
  - Small badge capsule
- Current mapping:
  - gameplay toolbar buttons
  - modal actions currently lack this styling

### 5. Ornamental Panel
- Type: Primitive
- Purpose: shared dark framed surface for cards, settings panes, info panels, and stat modules
- Variants:
  - Strong
  - Muted
  - Elevated
  - Flyout
- Current mapping:
  - `Panel`
  - settings sections
  - current menu record card

### 5b. Meta frame (forged gold cornice) — **META-003**
- Type: Primitive (presentation wrapper)
- Purpose: scalable **SVG** double-rail + corner rivets around meta plates (“forged gold” read) **without** growing new `Panel` variants; composes with existing `Panel` surfaces.
- Variants:
  - Default cornice (theme-driven gradients + `vector-effect: non-scaling-stroke`)
- Contract:
  - Decorative only: root sets `data-meta-frame="true"`; SVG is `aria-hidden` with `pointer-events: none`.
  - Theme tokens: `--theme-meta-frame-outset`, `--theme-meta-frame-accent`, `--theme-meta-frame-drop` (`theme.ts` META-003 block).
- Current mapping:
  - [`MetaFrame`](../../src/renderer/ui/MetaFrame.tsx) + [`MetaFrame.module.css`](../../src/renderer/ui/MetaFrame.module.css)
  - `CollectionScreen` — achievements stack (`data-testid="collection-meta-frame-achievements"`).
  - `ChooseYourPathScreen` — mode path cards (META-011).

### 6. Title Bar
- Type: Primitive
- Purpose: centered gold title row with ornamental separators and optional close action
- Variants:
  - Screen title bar
  - Settings shell title bar
  - Section title bar
- Current mapping:
  - not currently centralized

### 7. Segmented Control
- Type: Primitive
- Purpose: mutually exclusive option picker shown in settings
- Variants:
  - Two-state
  - Three-state
  - Four-state
- Current mapping:
  - not currently present as a shared primitive

### 8. Toggle Switch
- Type: Primitive
- Purpose: on/off control in premium shell
- Variants:
  - Enabled
  - Disabled
  - Focused
- Current mapping:
  - currently plain checkbox in settings

### 9. Status Card
- Type: Primitive
- Purpose: compact framed information card for daily timers, current run, meta summaries, and end-of-run stats
- Variants:
  - Promo card
  - Current-run card
  - Score card
  - Footer stat card
- Current mapping:
  - `StatTile`
  - ad hoc menu and game-over blocks

### 10. Thumbnail Tile
- Type: Primitive
- Purpose: framed selectable thumbnail for card themes or other visual sets
- Variants:
  - Selectable
  - Selected
  - Locked
- Current mapping:
  - not currently present

---

## Gameplay Composites

### 11. Gameplay HUD Segment
- Type: Composite
- Purpose: one framed stat segment in the gameplay HUD
- Variants:
  - Floor
  - Lives
  - Shards
  - Score
  - Daily
  - Mutator
- Current mapping:
  - [`GameplayHudBar`](../../src/renderer/components/GameplayHudBar.tsx) segments (floor hex badge, lives row, shards pill, centered score, daily strip when applicable, score-parasite module, mode/meta block with mutator chips, compact `statRail` pills)
  - Presentation tokens and layout live in [`GameScreen.module.css`](../../src/renderer/components/GameScreen.module.css) (HUD-011 rail: `.hudStatsStrip::before` gold-trim inset frame; `.hudDeck.floatingDeck` glass deck)

### 12. Gameplay HUD Bar
- Type: Composite
- Purpose: assembled top status strip with score in the visual center
- Current mapping:
  - [`GameplayHudBar`](../../src/renderer/components/GameplayHudBar.tsx) — mounted from [`GameScreen`](../../src/renderer/components/GameScreen.tsx) (`data-testid="game-hud"`)
  - Outer chrome: `.hudRow` → `.floatingDeck.statsDeck.hudDeck` → `.hudStatsStrip` (CSS grid: **left wing** | divider | **score** | divider | **right wing**)
  - **Left wing** (`.hudStripLeftModule`): SVG-framed floor hex (`.floorBadgeHexFrame`), lives hearts, shards + guard subline
  - **Center** (`.hudStripScoreModule`): score segment (`.hudScoreSegment`, `.statValScore`)
  - **Right wing** (`.hudStripRightModule`): optional daily date, score-parasite progress when active, then column with mode label / mutator chip row (including gauntlet, scholar, shuffle-tax context chips) and `.statRail` compact pills (gauntlet time, findables, contract, pins, meditation, wild)
  - **HUD-015:** screen-reader status: `.srOnly` region with `aria-live="polite"` (`politeHudAnnouncement` prop)
  - **HUD-016:** there is no Storybook package in this repo; static review props for four HUD states (daily, gauntlet, scholar, multi-mutator) live in [`hudFixtures.ts`](../../src/renderer/dev/hudFixtures.ts) as `GameplayHudBar` props (`hudFixturePropsDaily`, `…Gauntlet`, `…Scholar`, `…MultiMutator`, plus `gameplayHudBarFixturePropsById`).

### 13. In-Game Sidebar Rail
- Type: Composite
- Purpose: fixed left vertical action rail during gameplay
- Variants:
  - Collapsed icon-only
  - Expanded labeled flyout
- Current mapping:
  - current left toolbar in `GameScreen`

### 14. Card Face
- Type: Composite
- Purpose: premium front-side card art treatment
- Variants:
  - Flipped
  - Matched
  - Themed
- Current mapping:
  - current `TileBoard` front face and `tileTextures.ts`

### 15. Card Back
- Type: Composite
- Purpose: premium hidden-card design with emblem and ornamental border
- Variants:
  - Default
  - Hovered
  - Dimmed
- Current mapping:
  - current hidden-card styling in `TileBoard` and `tileTextures.ts`

### 16. Card Feedback FX
- Type: Composite
- Purpose: motion and effect layer for flip, success, and failure states
- Variants:
  - Hover glow
  - Flip
  - Match success
  - No-match failure
- Current mapping:
  - `shuffleFlipAnimation`
  - in-board CSS and renderer effects

### 17. Board Stage
- Type: Composite
- Purpose: board container plus surrounding environment framing and glow
- Current mapping:
  - `TileBoard`
  - `GameScreen`
  - current board stage classes

---

## Menu and Meta Composites

### 18. Menu Hero Shell
- Type: Composite
- Purpose: main menu composition containing hero art, logo, and CTA stack
- Current mapping:
  - `MainMenu`
  - `MainMenuBackground`

### 19. Logo Lockup
- Type: Composite
- Purpose: title plus emblem/rune mark used as the primary menu focal point
- Current mapping:
  - current text-only main title is insufficient

### 20. CTA Stack
- Type: Composite
- Purpose: vertically stacked major menu buttons
- Current mapping:
  - current horizontal-first action treatment in `MainMenu`

### 21. Profile Meta Strip
- Type: Composite
- Purpose: player level, title, currencies, and utility shortcuts at the top of the menu
- Current mapping:
  - no current equivalent live product layer

### 22. Promo / Meta Card Row
- Type: Composite
- Purpose: daily timer, current run, and optional social/community strip
- Current mapping:
  - current best-score and last-run block

### 23. Mode Card
- Type: Composite
- Purpose: tall mode-selection card used in choose-your-path
- Variants:
  - Neutral
  - Featured
  - Timer-badge
  - Stat-footer
- Current mapping:
  - [`ChooseYourPathScreen`](../../src/renderer/components/ChooseYourPathScreen.tsx) + [`ChooseYourPathScreen.module.css`](../../src/renderer/components/ChooseYourPathScreen.module.css) — **META-011:** each card sits in [`MetaFrame`](../../src/renderer/ui/MetaFrame.tsx) (forged-gold cornice) with mode-tinted panel + **Classic** stat footer (tabular numerals, large display values, label lockup)

---

## Settings Composites

### 24. Settings Shell
- Type: Surface
- Purpose: full framed settings page or modal with title bar and two-column structure
- Current mapping:
  - `SettingsScreen`

### 25. Settings Category Rail
- Type: Composite
- Purpose: left-side icon and label navigation for settings categories
- Variants:
  - Selected
  - Inactive
- Current mapping:
  - no current equivalent

### 26. Settings Content Pane
- Type: Composite
- Purpose: right-side active settings content area
- Current mapping:
  - current two-column grid must be replaced

### 27. Heart Selector
- Type: Composite
- Purpose: visible max-life picker in the reference settings
- Current mapping:
  - no current equivalent
  - future model gap

### 28. Card Theme Picker
- Type: Composite
- Purpose: row of selectable/locked theme thumbnails
- Current mapping:
  - no current equivalent
  - future model gap

---

## Overlay and Summary Composites

### 29. Ornamental Modal
- Type: Composite
- Purpose: pause, floor-cleared, and settings-over-game overlays aligned with the premium frame system
- Current mapping:
  - `OverlayModal`
  - in-game settings modal mode

### 30. End-of-Run Summary Panel
- Type: Composite
- Purpose: summary cards, achievements, actions, and secondary debug/export information
- Current mapping:
  - `GameOverScreen`

---

## Screen Matrix

| Component | Main Menu | Gameplay | Settings | Mode Selection | Game Over |
|---|---|---|---|---|---|
| Display Title | X | X | X | X | X |
| Eyebrow Label | X | X | X | X | X |
| Framed Button | X | X | X | X | X |
| Icon Capsule | X | X | X | X | Optional |
| Ornamental Panel | X | X | X | X | X |
| Title Bar | Optional | Optional | X | X | Optional |
| Segmented Control | - | - | X | - | - |
| Toggle Switch | - | - | X | - | - |
| Status Card | X | X | Optional | X | X |
| Thumbnail Tile | - | - | X | - | - |
| Gameplay HUD Segment | - | X | - | - | - |
| Gameplay HUD Bar | - | X | - | - | - |
| In-Game Sidebar Rail | - | X | - | - | - |
| Card Face | - | X | Card-theme preview only | Mode-art only | - |
| Card Back | - | X | Card-theme preview only | - | - |
| Card Feedback FX | - | X | - | Hover only | - |
| Board Stage | - | X | - | - | - |
| Menu Hero Shell | X | - | - | - | - |
| Logo Lockup | X | - | - | - | - |
| CTA Stack | X | - | - | - | Optional |
| Profile Meta Strip | X | - | - | - | - |
| Promo / Meta Card Row | X | - | - | - | Optional |
| Mode Card | - | - | - | X | - |
| Settings Shell | - | Modal variant only | X | - | - |
| Settings Category Rail | - | - | X | - | - |
| Settings Content Pane | - | - | X | - | - |
| Heart Selector | - | - | X | - | - |
| Card Theme Picker | - | - | X | - | - |
| Ornamental Modal | - | X | X | - | Optional |
| End-of-Run Summary Panel | - | - | - | - | X |

---

## State Matrix

| Component | States |
|---|---|
| Framed Button | default, hover, pressed, focused, disabled, primary-emphasis |
| Icon Capsule | default, hover, active, disabled |
| Ornamental Panel | default, elevated, muted, highlighted |
| Segmented Control | inactive option, hovered option, selected option |
| Toggle Switch | off, on, focused, disabled |
| Status Card | passive, emphasized, timer variant, stat variant |
| Gameplay HUD Segment | default, active-mutator, score-primary, life-icon variant |
| In-Game Sidebar Rail | collapsed, expanded |
| Card Back | hidden default, hover/focus, dimmed |
| Card Face | flipped neutral, matched success |
| Card Feedback FX | hover glow, flip motion, success burst, failure recoil |
| Settings Category Rail | inactive, hovered, selected |
| Mode Card | neutral, focused, selected, timer-badge |

---

## Catalog Rules
- A component shown in multiple screens should be implemented once as a primitive or composite, not re-specified independently.
- Mockup-only surfaces can introduce new composites, but those composites must still be separated from current live screen assumptions.
- If a component depends on assets, that dependency must be recorded in `ASSET_AND_ART_PIPELINE.md`.

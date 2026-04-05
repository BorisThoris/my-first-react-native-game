# Asset and Art Pipeline

## Purpose
Define the asset classes required for close visual fidelity, where they should live in the repo, how they should be named, and how later implementation should behave when final art is not ready yet.

## Asset Principles
- The redesign is asset-backed, not CSS-only.
- Placeholder assets are acceptable during implementation, but the placeholder strategy must keep final-swappable boundaries clean.
- Asset structure should match screen and component responsibilities.

---

## Required Asset Categories

### 1. Background Scenes
Needed for:
- Main menu hero
- Gameplay environment
- Mode-selection cards

Requirements:
- high-resolution scene art
- desktop-first framing
- central silhouette support where titles or boards sit

### 2. Logo and Emblem
Needed for:
- main menu hero
- possible marketing or splash reuse

Requirements:
- layered wordmark or emblem support
- version that works over illustrated backgrounds

### 3. Icon Family
Needed for:
- menu buttons
- top meta strip
- gameplay sidebar
- settings category rail
- social strip

Requirements:
- one coherent fantasy icon language
- support for filled, engraved, or sculpted treatments

### 4. Card Art
Needed for:
- hidden back state
- optional front-frame overlays
- card-theme picker thumbnails

Requirements:
- ornamental back art
- swappable theme support if the product later adds card themes

### 5. Ornamental Frame Assets
Needed for:
- title bars
- buttons
- panels
- HUD segments
- mode cards

Requirements:
- use only where CSS or inline SVG construction becomes too brittle

### 6. Fonts
Needed for:
- display serif
- utility sans

Requirements:
- valid desktop/web license
- clear file ownership and versioning

---

## Drop-in checklist (renderer paths)

For a concise map of **current imports** and where to place final art without rewiring components, see [DROP_IN_ASSET_CHECKLIST.md](DROP_IN_ASSET_CHECKLIST.md) (supports TASK-009–011 and TASK-018).

## Recommended Repo Structure

Suggested root:
- `src/renderer/assets/ui/`

Suggested subfolders:
- `src/renderer/assets/ui/backgrounds/`
- `src/renderer/assets/ui/logos/`
- `src/renderer/assets/ui/icons/`
- `src/renderer/assets/ui/cards/`
- `src/renderer/assets/ui/frames/`
- `src/renderer/assets/ui/fonts/`
- `src/renderer/assets/ui/thumbnails/`

This separates UI-specific art from existing texture experiments while still living under renderer assets.

---

## Naming Conventions

### Backgrounds
- `bg-main-menu-cathedral-v1.webp`
- `bg-gameplay-dungeon-ring-v1.webp`
- `bg-mode-classic-v1.webp`
- `bg-mode-daily-v1.webp`
- `bg-mode-endless-v1.webp`

### Logos
- `logo-memory-dungeon-gold-v1.svg`
- `logo-memory-dungeon-lockup-v1.svg`
- `emblem-crystal-sigil-v1.svg`

### Icons
- `icon-settings-gold-v1.svg`
- `icon-pause-gold-v1.svg`
- `icon-codex-gold-v1.svg`

### Cards
- `card-back-ornate-v1.webp`
- `card-frame-front-v1.png`
- `card-theme-arcane-thumb-v1.webp`

### Fonts
- `display-cinzel-bold.woff2`
- `body-inter-regular.woff2`

---

## Format Guidance

### Prefer SVG For
- logos
- icons
- ornamental separators where vector holds up

### Prefer WebP or PNG For
- painted backgrounds
- complex card art
- thumbnail images
- textured overlays

### Use WOFF2 For
- web font delivery in the renderer

---

## Placeholder Policy

### Goal
Allow the UI shell to be built before final art is complete.

### Rules
- Every art-backed component should have a graceful fallback that preserves layout.
- Fallbacks should keep the right silhouette, proportions, and layering.
- Fallbacks should never silently become the final design target.

### Examples
- Background fallback: restrained gradient or blurred ambient wash with the same content anchors
- Logo fallback: styled text lockup plus temporary emblem
- Card fallback: current tile art with upgraded frame structure
- Icon fallback: current inline icons wrapped in final-shape capsules

---

## Integration Rules

### Theme Layer
- Fonts and core asset URLs should be consumed through the renderer theme layer where possible.

### Component Layer
- Components should not hard-code random asset paths.
- Prefer small helper modules or manifest constants for shared UI asset references.

### Swappability
- Final art replacement should not require component rewrites.
- The component contract should stay stable when placeholder assets are replaced by final ones.

---

## Licensing and Ownership Notes
- Record the source and license of every imported font and major art file.
- Avoid pulling in placeholder assets with unclear commercial rights.
- If AI-generated or externally commissioned art is used, document ownership and approval status alongside the files or in a short inventory note.

---

## Current Code Areas Likely to Consume New Assets
- `src/renderer/styles/global.css`
- `src/renderer/styles/theme.ts`
- `src/renderer/components/MainMenuBackground.tsx`
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/tileTextures.ts`
- future shared UI primitives under `src/renderer/ui/`

---

## Acceptance Criteria for Later Implementation
- Asset categories are clearly partitioned.
- Placeholder assets can be swapped with final art without changing screen layout contracts.
- Font loading is explicit and versioned.
- The renderer can degrade gracefully when a premium asset is missing.

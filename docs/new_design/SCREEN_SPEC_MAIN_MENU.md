# Screen Spec: Main Menu

## Purpose
Define the target main menu surface shown in `ENDPRODUCTIMAGE2.png`, while documenting how it should reconcile with the current live app.

## Target Surface Summary
The main menu is a scene-first hero surface with:
- top profile and meta strip
- large logo lockup
- centered tagline
- vertical CTA stack
- bottom daily card
- bottom current-run card
- bottom community/social strip

## Visual Hierarchy
1. Logo lockup
2. Primary `Play` button
3. Remaining CTA stack
4. Daily and current-run cards
5. Top profile/resources
6. Social strip

---

## Layout Zones

### Zone A: Background Scene
- Tall dungeon corridor or cathedral-like environment
- Central light source behind the logo
- Rich depth and torchlight
- Must support strong silhouette behind the logo and CTA stack

### Zone B: Top Profile and Utility Strip
- Player level badge
- Player name or title
- Meta resources or utility shortcuts
- Sits above the hero, not inside the CTA stack

### Zone C: Hero Center
- Logo lockup
- Tagline
- Primary CTA stack
- This zone owns the strongest contrast and spacing

### Zone D: Bottom Meta Cards
- Daily challenge card at left
- Current run card at right
- Social strip centered below or between them

---

## Core Components

### 1. Profile Meta Strip
Target contents:
- Level badge
- `PLAYER` label
- player title/name
- optional meta resources and shortcuts

Current-app reconciliation:
- The current app does not have live currencies or player identity beyond save/run data.
- This block should be documented as future product scope unless those fields are added.

### 2. Logo Lockup
Target contents:
- Gold display title
- purple crystal or rune emblem
- layered ornamental treatment

Requirements:
- Treat as a composite asset, not just a heading style.

### 3. Tagline
Target contents:
- One restrained support line below the logo
- Uppercase or small caps utility treatment

### 4. CTA Stack
Target contents in the literal reference:
- `Play`
- `Collection`
- `Daily Challenge`
- `Settings`
- `Exit Game`

Shared rules:
- full-width framed buttons
- icon capsule at left
- premium depth and bevel
- one visually dominant primary button

### 5. Daily Challenge Card
Target contents:
- header label
- countdown
- challenge icon or shard art

### 6. Current Run Card
Target contents:
- current run label
- floor depth
- best score or continuity stat

### 7. Social Strip
Target contents:
- three small icon buttons
- low visual priority

---

## IA Treatment for the Current App

### Recommended Entry Flow
- `Play` should remain the main hero action.
- Pressing `Play` is the cleanest place to route into a future `Choose Your Path` screen.

### Handling Current Extra Run Modes
Current live modes exceed the reference:
- gauntlet
- puzzle
- meditation
- wild
- practice
- scholar
- import

Recommended treatment:
- Keep the main menu visually close to the reference.
- Move extra live modes into a secondary panel, drawer, or submenu rather than leaving them in the main hero stack.

### Collection Button
- The reference treats `Collection` as a first-class menu action.
- The current app does not have a live collection screen.
- Document the slot in the target composition, but mark it as future scope until a route and content model exist.

### Exit Game
- The reference includes `Exit Game`.
- The current desktop app can support a quit action later, but this package should document it as a menu slot, not assume implementation exists now.

---

## Responsive Rules
- Preserve the hero center before preserving meta cards.
- If the viewport compresses:
  - keep logo and primary CTA readable
  - collapse or simplify the top meta strip first
  - stack or compress bottom cards before collapsing the main CTA column
- Never let bottom cards visually compete with the hero title.

---

## Current Code Mapping
- `src/renderer/components/MainMenu.tsx`
- `src/renderer/components/MainMenu.module.css`
- `src/renderer/components/MainMenuBackground.tsx`
- `src/renderer/ui/UiButton.tsx`
- `src/renderer/ui/Panel.tsx`
- `src/renderer/ui/ScreenTitle.tsx`

---

## Acceptance Criteria for Later Implementation
- The hero reads as a single centered composition, not a scattered dashboard.
- The main menu supports a vertical premium CTA stack.
- Daily and current-run summaries are visually distinct from the hero but still integrated into the scene.
- Extra current live modes no longer clutter the hero surface.
- The screen can degrade gracefully when future-scope profile or collection data is not yet live.

---

## Out of Scope for This Spec
- Exact collection-screen design beyond acknowledging the menu destination
- Exact currency economy
- Social-link implementation details

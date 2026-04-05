# Screen Spec: Mode Selection

## Purpose
Define the `Choose Your Path` surface shown in `ENDPRODUCTIMAGE2.png`, plus its implications for routing and how the current app's extra live modes should be handled.

## Target Surface Summary
The mode-selection screen is a dedicated screen reached after the main menu's `Play` action. It presents three premium illustrated mode cards:
- Classic Run
- Daily Challenge
- Endless Mode

## Visual Hierarchy
1. Centered screen title
2. Featured middle card
3. Neighbor mode cards
4. Subtitle and footer stats

---

## Layout Zones

### Zone A: Title Area
- Centered display title: `Choose Your Path`
- Small supporting subtitle below

### Zone B: Card Row
- Three equal-width mode cards
- Center card is visually featured through color and glow
- Cards are aligned along the same visual baseline

### Zone C: Card Footers
- Best score or best floor data
- Timer badge where relevant

---

## Mode Card Anatomy

### Shared Card Structure
- Framed tall panel
- Full-height background art
- Title
- Description
- Footer statistic or status

### Classic Run
- Cool blue mood
- Default or foundational mode identity
- Footer uses `Best Score`

### Daily Challenge
- Purple magical/challenge mood
- Featured state in the reference
- Floating badge for countdown to next challenge

### Endless Mode
- Warm orange mood
- More dangerous or late-game energy
- Footer uses `Best Floor`

---

## State Rules

### Neutral Card
- Framed and readable
- Lower glow than the featured card

### Featured / Selected Card
- Strongest border glow
- Highest chroma emphasis
- Can support hover or selected state

### Timer Badge Variant
- Floating or attached badge with countdown
- Used on daily challenge

### Stat Footer Variant
- Bottom-aligned stat or record panel
- Used across cards with content-specific wording

---

## Navigation Implications

### Recommended Entry Point
- Main menu `Play` should route here instead of starting gameplay immediately.

### Recommended Current-App Mapping
- `Classic Run` -> current `startRun`
- `Daily Challenge` -> current `startDailyRun`
- `Endless Mode` -> future product gap unless a distinct mode is defined

### Why `Endless Mode` Is a Gap
- The current app already has an arcade-like main run.
- The reference visually distinguishes `Classic Run` and `Endless Mode`.
- Until product rules define the difference, `Endless Mode` must be recorded as a future design and model decision.

---

## Handling the Current Extra Live Modes
Current live modes not shown in the reference:
- gauntlet
- puzzle
- meditation
- wild
- practice
- scholar
- import

### Recommended IA Treatment
- Keep `Choose Your Path` aligned with the reference's three-card hero flow.
- Expose the extra current modes in a secondary surface:
  - `More Modes` drawer
  - secondary tab
  - lower-priority panel

### Why
- This keeps the hero flow clean.
- It preserves current functionality without forcing the reference surface to become crowded.

---

## Current Code and Routing Impact
- The current `ViewState` does not include a mode-selection screen.
- A literal implementation would require:
  - new routing or `ViewState` entry
  - main menu flow change
  - mode-card components
  - navigation back behavior

This spec documents those implications but does not implement them.

---

## Acceptance Criteria for Later Implementation
- `Play` no longer has to jump directly into a run if the team adopts this flow.
- The screen cleanly presents three hero cards without collapsing into a button list.
- Current extra live modes are retained somewhere, but not at the expense of the main reference composition.
- The screen clearly distinguishes live-supported modes from future-scope ones.

---

## Out of Scope for This Spec
- Final product decision for what `Endless Mode` means
- Full collection or codex flow after mode selection

# Motion and State Spec

## Purpose
Define the motion language and interactive states implied by the references so later implementation work uses one coherent system.

## Motion Tone
- Weighty
- Directional
- Premium
- Slightly ceremonial
- Magical where appropriate

Avoid:
- generic website microinteraction scaling
- oversoft springiness with no sense of mass
- random animation styles per screen

---

## Global Interaction States

### Focus
- Use glow, rim light, or stronger edge definition.
- Do not rely only on browser-default geometry changes.

### Hover
- Prefer illumination, edge emphasis, or subtle tilt over large movement.

### Pressed
- Use slight compression or inset depth response.
- Preserve the crafted object feel.

### Disabled
- Desaturate, reduce glow, and lower contrast.
- Disabled should still look intentional, not broken.

---

## Button Motion

### Framed Buttons
- Hover: brighter rim, slight lift or bloom
- Pressed: shallow inset, reduced shadow, quick return
- Primary CTA: strongest highlight budget

### Small Utility Icons
- Hover: capsule glow or icon brightening
- Active: persistent selected rim or filled state

---

## Sidebar Motion

### Collapsed Rail
- Button hover/focus should brighten the medallion and icon.

### Expanded Flyout
- Flyout should feel anchored to the rail, not like a random tooltip.
- Entry motion should be short lateral reveal with opacity and shadow support.
- Reduce-motion mode should fall back to a quick non-sliding reveal.

---

## Card-State Motion

### Hidden
- Idle state only, with optional faint breathing of light if subtle enough

### Hover / Focus
- Gold bloom
- Slight tilt or depth change allowed
- No aggressive scale jump

### Flip
- Directional 3D rotation
- Fast but readable
- Short blur or trail acceptable
- Reduce-motion fallback can use a simpler crossfade or reduced-angle flip

### Match Success
- Green glow
- Optional particle burst
- Score popup or reward label
- Slight celebratory linger before settling

### Mismatch
- Red edge flash
- Quick recoil or shake
- Faster and harsher than success
- Clear return to neutral hidden state after resolution

---

## HUD and Meta Motion

### Score and Stat Updates
- Prefer small emphasis pulses or count-up polish, not constant animation

### Mutator or Daily Context
- Magical segments can use subtle arcane glow
- Do not let these segments compete with score on every frame

---

## Ambient Motion

### Menu and Gameplay Backgrounds
- Backgrounds may use very light atmospheric motion:
  - fog drift
  - embers
  - subtle lighting shimmer
- Ambient motion should support mood, not distract from interaction targets

### Mode Cards
- Selected or featured card can use mild glow emphasis
- Avoid full card bobbing or unrelated floating motion

---

## Overlay Motion

### Modal Entry
- Quick fade and scale or short depth reveal
- Should feel like a foreground plate arriving above the scene

### Modal Exit
- Fast and decisive

### Reduce Motion
- Favor opacity-only or very shallow transform changes

---

## Reduced-Motion Policy

### Must Simplify
- Card flip depth
- Particle bursts
- Sidebar flyout slide
- Ambient scene shimmer
- Large-scale board or shell motion

### May Retain
- State color changes
- Static glow differences
- Minimal opacity transitions

### Principle
Reduce-motion mode should preserve information clarity even when spectacle is removed.

---

## Current Code Areas Affected Later
- `MainMenuBackground.tsx`
- `GameScreen.tsx`
- `TileBoard.tsx`
- `TileBoardScene.tsx`
- `shuffleFlipAnimation.ts`
- modal and screen CSS modules

---

## Acceptance Criteria for Later Implementation
- Interaction states feel like one family across menu, gameplay, settings, and overlays.
- Card success and failure are readable without extra explanatory text.
- Reduced-motion mode still communicates state changes clearly.

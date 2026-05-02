# AI Gameplay HUD Concept Brief

## Purpose
This is the implementation-facing AI concept brief for the first HTML UI refinement pass after the full-bleed gameplay board. It can be pasted into Figma Make, Figma AI, or another UI concept tool, then used as a visual target for repo-native CSS and component work.

## Prompt
Create a high-fidelity desktop game HUD concept for a dark fantasy memory-card dungeon game.

The gameplay board is a full-bleed 3D card canvas in the background. Design only the HTML UI chrome layered above it: top HUD, bottom action dock, small dungeon status panels, and score feedback.

Visual direction: premium forged obsidian and aged brass, sharp architectural frames, restrained arcane cyan accents, warm antique gold highlights, cinematic dungeon atmosphere. The UI should feel crafted and physical, not generic glassmorphism. Use Source Sans style utility text and a classical serif display font for score/floor numerals.

Composition:
- Top HUD is a slim command bar, centered horizontally, with three clear zones.
- Score is the strongest center medallion.
- Floor, lives, and shards sit in the left zone.
- Mode, objective, mutators, and secondary run context sit in a quieter lower/right strip.
- Bottom action dock floats over the board, compact and icon-first, with framed medallion buttons.
- Cards remain visually primary; UI chrome should not form a large opaque box.

Constraints:
- No marketing hero layout.
- No rounded bubbly mobile-app style.
- No one-note purple or blue palette.
- No dense explanatory text.
- Keep all text readable over a busy game board.
- Preserve responsive compression for tablet and phone HUD.

## Locked Implementation Direction
- Implement the concept as CSS over the existing `GameplayHudBar`, `GameLeftToolbar`, and `GameScreen` structure.
- Do not add new gameplay state, settings, routes, or Figma-only placeholder controls.
- Prefer theme tokens and existing assets over new image dependencies.
- Treat this as a first refinement pass; future Figma work can replace the concept image, not the component contracts.

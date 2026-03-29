# Obsidian Tile Theory

Working design note for the renderer and board identity. This version assumes a polished premium UI with gold accents, not a ritual system.

## Thesis

The app does not read as ritual or occult.

It reads as polished, premium, and controlled:

- dark chrome
- rounded cards
- soft glass gradients
- gold accents
- restrained cyan highlights
- crisp uppercase labels
- expensive, clean contrast

The replacement for the cube should match that language. It should feel like a high-end interface module or display tile, not a temple prop.

## What The App Already Says

The current UI stack is consistent across screens:

- dark charcoal and navy backgrounds
- large rounded panels
- subtle inner glows and soft shadows
- gold as the main accent color
- cool blue and cyan only as a secondary energy note
- typography that is bold, clean, and legible

That means the visible tile object should also feel:

- polished
- engineered
- premium
- readable at a glance
- like part of the UI, not a keepsake

## Why The Cube Should Go

The cube is generic and too neutral for this UI language.

Even with better materials, it still communicates:

- toy-like geometry
- placeholder game token
- standard puzzle object

The replacement object should communicate:

- crafted value
- controlled power
- a premium reveal
- a designed interface object, not a stock puzzle shape

## Design Pillars

1. Premium, not rustic.
2. Polished, not gritty.
3. Heavy, not playful.
4. Bold, not busy.
5. Gold-forward, with cyan as support.
6. Legible under motion and during quick gameplay.

## App Tone Reference

Use these as the current tone anchors:

- board chrome: smoked glass and brushed metal
- primary accent: gold and warm amber
- secondary accent: cyan energy
- neutral base: deep black, charcoal, slate
- feedback: bright but controlled, never neon chaos

Avoid:

- ritual symbols
- altar language
- temple framing
- fantasy grime
- overly mystical silhouette noise

## Recommended Direction

### Polished Bezel Tile

Replace cubes with a premium bezel tile or display module.

Core idea:

- a dark, beveled object with a refined silhouette
- a front face that reads like an inset display or panel
- thin gold seams and polished edge catches
- matched tiles open, brighten, or pulse from within
- the object feels like premium UI hardware, not jewelry or an artifact

Why this direction fits:

- it removes cube identity completely
- it matches the current UI's rounded, polished surfaces
- it keeps the grid readable
- it supports strong lighting and reveal effects
- it can be rendered both in Three.js and in fallback DOM mode

## Shape Candidates

### 1. Bezel Tile

Best fit for the app as it stands.

- rectangular but softened by bevels
- thin enough to feel refined
- inset display face or symbol panel
- polished rim with gold edge light
- strong silhouette on a dark board

### 2. Display Tile

More UI-native and readable.

- tile reads like a small display module
- symbol is centered like a status icon
- better if we want the board to feel integrated with the interface

### 3. Panel Insert

Most screen-aligned.

- flatter, cleaner, and more modern
- reads like a piece of the board hardware
- best if we want the object to feel embedded in the UI

### 4. Signal Tile

Most energetic.

- simple silhouette with a bright face
- stronger glow cues
- better if the board should feel more active than ornamental

## Visual Language

### Materials

- body: deep black stone or smoked metal
- edge: polished gold or brushed brass
- inner seams: warm gold, ember, or cyan
- front face: inset panel, display face, or recessed symbol
- matched state: brighter edge light and more open inner glow

### Surface Detail

- fine scratches
- subtle bevel highlights
- etched linework
- faint surface noise
- controlled glow around active states

### Color Roles

- gold: primary prestige accent
- amber: warmth and score energy
- cyan: active reveal and memory state
- ember: impact, break, failure, discharge
- black stone: weight and contrast

## Motion Language

### Hidden State

- tile is quiet, polished, and closed
- minimal idle motion

### Memorize State

- surface glow rises
- gold edges become more visible
- the object feels intentionally exposed, not magically summoned

### Match State

- the tile opens, fractures, or brightens from the impact point
- the animation should feel like a premium object unlocking
- energy release should be sharp and expensive-looking

### Failure State

- brief ember or gold flare
- stronger contrast, not cartoon bounce

### Reduce Motion

- preserve state changes
- replace destruction with fade and glow decay
- keep the same premium tone

## Board-Level Composition

The board should feel like a polished display surface or control field.

Good metaphors:

- display deck
- control surface
- module grid
- premium game table

The board frame should support the tiles and chrome, not compete with them.

## UI Chrome Direction

The surrounding chrome should stay aligned with the current app:

- smoked glass
- rounded panels
- gold trim and highlights
- subtle cyan glow
- clean card edges
- luxury control panel energy

The UI should feel like a refined arcade instrument, not a temple or dungeon prop.

## What Stays Stable

- game rules
- board dimensions
- match timing
- score flow
- accessibility
- fallback support
- reduce-motion behavior

This is a visual redesign, not a mechanics redesign.

## What Must Be True In The Final Design

- readable at small sizes
- distinct hidden, preview, and matched states
- clickable and obvious in fallback mode
- strong silhouette with the glow off
- no cube-first composition
- no ritual or occult framing
- premium, not noisy

## Iteration Questions

Use these for the next pass:

1. Should the replacement object feel more like a bezel tile, a display tile, or a panel insert?
2. Should the match effect feel like opening, cracking, or discharging?
3. Should the board read more like a display deck, control surface, or game table?
4. Should gold remain the dominant accent, with cyan used sparingly?
5. Do we want the symbol face to feel engraved, inset, or embossed?

## Suggested Next Pass

The next design iteration should choose one replacement object and commit to its silhouette.

Recommended default:

- start with the bezel tile
- keep the grid footprint
- use gold edge lighting and a dark polished body
- make the matched state feel like a controlled activation rather than a ritual reveal

Once that is locked, the implementation can follow the object instead of trying to salvage the cube language.

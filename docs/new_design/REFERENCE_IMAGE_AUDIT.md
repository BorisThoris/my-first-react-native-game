# Reference Image Audit

## Scope
This audit decomposes the two reference images into visible screens, panels, regions, reusable components, states, materials, and implied interactions. It is the screenshot-grounded source of truth for the rest of the package.

---

## Image A: `ENDPRODUCTIMAGE.png`

### Panel Inventory
The image is a design board made of eight visible panels or modules:
1. Main game screen
2. Card states examples
3. Interactions examples
4. Top bar details
5. Sidebar menu (in-game)
6. Visual theme example
7. Color palette
8. Typography

### A1. Main Game Screen
Label in image: `MAIN GAME SCREEN`

#### Layout Regions
- Full illustrated dungeon backdrop
- Fixed left vertical icon rail
- Fixed ornate top HUD strip
- Centered 3x4 board stage
- Ambient edge lighting around the board
- Dark vignette containing the playable space

#### Visible Components
##### Environment Backdrop
- Circular stone floor arena
- Dungeon walls and alcoves
- Candle and torch light sources
- Warm orange highlights
- Dark fog and low-contrast falloff at edges
- Occasional cool accent glows

##### Board Stage
- Central raised or visually isolated play zone
- Slight top-down cinematic perspective
- Stronger spotlighting in the center than at the edges
- Negative space preserved around the board

##### Top HUD
- Floor segment
- Lives segment
- Shards segment
- Score segment
- Daily seed/date segment
- Mutator segment with a purple crystal icon

##### Left Sidebar
- Icon-only default state
- Circular or medallion-style button treatment
- Six stacked action slots visible in the large gameplay panel

##### Card Grid
- Twelve cards
- Three rows by four columns
- Even spacing
- Large margins between chrome and cards

#### Visual Hierarchy
1. Score
2. Board
3. Sidebar/HUD chrome
4. Environment and edge lighting

#### Key Takeaways
- The gameplay composition is environment-first, not panel-first.
- The HUD reads as framed metal objects embedded over a scene, not flat glass UI.
- Score is the emotional anchor of the screen.

### A2. Card States Examples
Label in image: `CARD STATES (EXAMPLES)`

#### States Shown
- Face down
- Hover
- Flipped
- Matched

#### Card Anatomy
##### Face Down
- Dark lacquer or leather-like face
- Orange-gold filigree
- Center emblem
- Bronze rim
- Mild edge glow

##### Hover
- Same back art as face down
- Strong gold bloom
- Brighter rim and edge treatment
- Reads as cursor hover or controller focus

##### Flipped
- Premium face frame
- Crystal art
- Title line
- Small secondary copy
- Dark frame, not yet success-coded

##### Matched
- Green border and internal glow
- Checkmark emblem
- Particle sparkle around card
- Persistent success state

#### Key Takeaways
- Hidden, hover, flipped, and matched must each have their own visual grammar.
- The front face needs a real content frame, not just symbol text on a flat tile.

### A3. Interactions Examples
Label in image: `INTERACTIONS`

#### States or Moments Shown
- Flip animation
- Match success
- No match

#### Flip Animation
- Card angled in 3D space
- Motion blur or trailing smear
- Hinge or page-turn feel
- Quick directional motion

#### Match Success
- Green celebratory glow on both cards
- Particle burst
- Floating score text (`+50`)
- No extra text box required for success feedback

#### No Match
- Red rim or error glow
- Tilted recoil posture
- Failure communicated through color and motion

#### Key Takeaways
- Match and mismatch feedback need strong visual differentiation.
- The board should communicate outcomes mostly through motion, color, and card posture.

### A4. Top Bar Details
Label in image: `TOP BAR DETAILS`

#### Segments Explained
- Floor
- Lives
- Shards
- Score
- Daily
- Score Parasite

#### Segment Characteristics
- Tiny uppercase label
- Numeric or icon value
- Shared frame language with different widths
- Center score segment is largest and most decorative

#### Key Takeaways
- The HUD should use segmented modules, not one undifferentiated bar.
- Score must stay centered and oversized relative to adjacent stats.

### A5. Sidebar Menu (In-Game)
Label in image: `SIDEBAR MENU (IN-GAME)`

#### Items Visible
- Pause
- Settings
- Collection
- Inventory
- Codex

#### Structure
- Icon capsule or medallion at left
- Title
- Short subtitle or explanation
- Dark framed flyout shell

#### Implied States
- Collapsed gameplay icon rail
- Expanded menu/flyout state with labels and descriptions

#### Key Takeaways
- The in-game sidebar is not just a utility strip. It is a navigational object with a collapsed and expanded mode.
- Several destinations shown here do not exist in the current app and must be documented as future scope.

### A6. Visual Theme Example
No explicit label besides image context.

#### Purpose
- Shows the gameplay screen again at a smaller size to reinforce overall composition and atmosphere.
- Confirms that the intended look relies on illustrated scenery, warm/cool lighting contrast, and premium framed chrome.

### A7. Color Palette
Label in image: `COLOR PALETTE`

#### Swatches Visible
- Near-black charcoal
- Antique gold
- Brick red
- Arcane violet
- Success green
- Light ivory or parchment
- Dark neutral support tone

#### Semantic Use
- Gold: premium interactable chrome and key numerals
- Red: lives and failure
- Violet: magical content, relics, mutators, daily emphasis
- Green: matched/success
- Ivory: text highlight

### A8. Typography
Label in image: `TYPOGRAPHY`

#### Fonts Called Out
- Header font: `Cinzel Bold`
- Body font: `Inter Regular`

#### Typography Behavior
- Serif display face for titles and high-value numbers
- Neutral sans for labels, subtitles, and helper copy
- Small uppercase labels above numeric values

### A9. Image A Global Conclusions
- The image is effectively a compact gameplay design system board.
- It specifies composition, HUD IA, card states, interaction FX, palette, and typography.
- The current app already has live gameplay, but the reference demands a much richer asset and state presentation layer.

---

## Image B: `ENDPRODUCTIMAGE2.png`

### Surface Inventory
The image contains three distinct product surfaces:
1. Main menu
2. Settings
3. Choose-your-path mode selection

### B1. Main Menu

#### Layout Regions
- Full vertical hero background scene
- Top-left player profile cluster
- Top utility and currency strip
- Center logo lockup
- Center tagline
- Large vertical CTA stack
- Bottom-left daily status card
- Bottom-right current-run status card
- Bottom-center social icons

#### Visible Components
##### Background Scene
- Cathedral or dungeon corridor
- Steps rising toward a portal or bright doorway
- Hanging banners and chains
- Torches and warm light pools
- Fog and reflective floor highlights

##### Player Profile Block
- Circular level badge with `25`
- `PLAYER` label
- Player title or name (`Seeker of Shards`)

##### Resource and Utility Strip
- Gem resource value
- Coin resource value
- Three small square utility buttons, likely lore/messages/settings

##### Logo Lockup
- Large gold serif title
- Purple crystal or rune emblem behind it
- Not plain text alone; the mark is composited and ornamental

##### CTA Stack
- `PLAY`
- `COLLECTION`
- `DAILY CHALLENGE`
- `SETTINGS`
- `EXIT GAME`

##### Bottom Status Cards
- Daily challenge countdown card
- Current run card with floor and best-score details

##### Social Strip
- Three small icon buttons centered near the bottom edge

#### Visual Hierarchy
1. Logo
2. Play button
3. Remaining CTA stack
4. Bottom status cards
5. Top profile/resources

#### Key Takeaways
- The menu is cinematic and heavily art-dependent.
- Navigation is curated and vertically centered.
- Progression and meta systems are present even before play starts.

### B2. Settings

#### Layout Regions
- Large framed shell with centered title
- Left category navigation rail
- Right content pane
- Top-right close action
- Bottom footer actions

#### Visible Components
##### Category Navigation
- Gameplay
- Audio
- Video
- Controls
- Accessibility
- About

##### Active Content Pane
- Gameplay section title
- Difficulty segmented control
- Timer mode segmented control
- Max lives heart selector
- Card theme thumbnail row
- Tutorial hints toggle

##### Footer Buttons
- Reset to defaults
- Back

#### States Visible
- Selected nav item
- Inactive nav items
- Selected segment option
- Unselected segment option
- Toggle enabled
- Locked card-theme slot

#### Key Takeaways
- Settings are framed as a premium game shell, not a plain form.
- The reference contains controls that exceed the current `Settings` model.
- Some categories shown in the reference do not yet have meaningful live settings in the current app.

### B3. Choose Your Path

#### Layout Regions
- Centered screen title
- Subtitle
- Three equal-width mode cards
- Bottom stat/footer areas per card

#### Visible Components
##### Classic Run Card
- Cool blue environment art
- Title and description
- Footer with `Best Score`

##### Daily Challenge Card
- Purple challenge art
- Stronger glow than neighboring cards
- Floating timer badge
- Title and description

##### Endless Mode Card
- Warm orange environment art
- Title and description
- Footer with `Best Floor`

#### States Visible
- Neutral mode card
- Featured/selected daily card
- Timer-badge variant
- Stat-footer variant

#### Key Takeaways
- The choose-your-path screen is a full product surface, not a subpanel.
- The current app does not have an equivalent view state or routing step.

### B4. Cross-Screen Patterns Visible in Image B
- Gold display titles with ornamental separators
- Shared framed button family
- Shared status-card family
- Filled or engraved icon system
- Painted environment backdrops behind every major surface
- Purple used as magical/challenge emphasis
- Blue and orange used to differentiate mode cards

### B5. Image B Global Conclusions
- The reference defines a broader product UI model, not just a reskin.
- It assumes:
  - player profile or progression data
  - currencies or meta resources
  - a collection destination
  - a distinct mode-selection flow
  - a richer settings model
- Those must be separated into existing-surface restyles versus future scope in later docs.

---

## Shared Conclusions Across Both Images

### Reusable Design System Signals
- Large serif display typography
- Neutral sans utility copy
- Framed and beveled controls
- Dark, textured, premium materials
- Strong scene art instead of abstract backgrounds
- High-contrast state coding for success, magic, danger, and focus

### Implementation-Level Implications
- Shared primitives must be redesigned before individual screens.
- Asset ingestion is a first-class requirement.
- Several mockup elements need future routes or model expansions.
- The current app can support a large portion of the redesign visually, but not every feature shown literally.

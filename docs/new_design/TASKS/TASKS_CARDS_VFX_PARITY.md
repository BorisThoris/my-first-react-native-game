# Tasks: Cards, flip, and VFX parity (`CARD-*`, `FX-*`)

**Sweep (P2/P3):** FX-007 `HOVER_DOM_WEBGL_TOKENS.md`, FX-006 hover tint lerp, CARD-002 face-up arc, CARD-010 lift damp, CARD-012 gambit resolving states, CARD-018 pinned+match stack, FX-013 shuffle Z jitter, FX-017 stronger match pulse, matrix rows in `FX_REDUCE_MOTION_MATRIX.md`.

**Research summary:**

- **DOM fallback:** Logical face flip only (no CSS 3D arc). Hover: gold border/glow + tilt vars. Match/mismatch: `.resolvingMatch` / `.resolvingMismatch`, `.matched`, `pulseGlow`. **No** `::after` checkmark on fallback tiles (checkmark exists on WebGL **hit buttons** only).
- **WebGL:** `TileBezel` damped `rotation.y` toward `targetRotation`; hover lift/tilt via UV; `cardTint` for mismatch/pin. Shuffle: `shuffleMotionDeadlineMs` + DOM `shuffleFlipAnimation.ts` FLIP.
- **Missing vs mockup:** Heavy shared hover spec DOM↔WebGL, flip “pop” at transition, **mismatch shake**, **match particles**, **DOM matched checkmark**, optional **bloom** (expensive).

**Primary code:** `TileBoard.tsx`, `TileBoard.module.css`, `TileBoardScene.tsx`, `tileTextures.ts`, `shuffleFlipAnimation.ts`, `tileResolvingSelection.ts`, `App.tsx` (`data-reduce-motion`)

---

## Task table

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| CARD-001 | P0 | DOM matched checkmark | Parity with WebGL hit-layer `::after` ✓ on fallback tiles. | Visible on match; `reduceMotion` OK. | — |
| CARD-002 | P1 | DOM flip arc (optional) | CSS 3D or cross-fade back↔front. | Instant path when `reduceMotion`; no a11y regression. | Product |
| CARD-003 | P1 | WebGL flip pop | Brief scale/Z impulse on face-up edge. | Subtle; perf OK on low DPR. | — |
| FX-004 | P1 | Mismatch shake | CSS keyframes and/or Three.js position jitter during resolving mismatch. | Off when `reduceMotion`. | — |
| FX-005 | P1 | Match particles | Lightweight burst on successful match (R3F or CSS). | Off when `reduceMotion`; no canvas leak. | State subscription |
| FX-006 | P2 | WebGL hover gold rim | Emissive/rim aligned with DOM hover tokens. | `FX-007` documents numeric parity. | — |
| FX-007 | P2 | Hover spec doc | Tokenize DOM `.fallbackTile:hover` glow for WebGL artists. | Doc in `VISUAL_SYSTEM` or tasks folder. | — |
| CARD-008 | P1 | Resolving timing sync | New FX align with `getResolvingSelectionState` / `tileResolvingSelection.ts`. | No double-fire; gambit path OK (`CARD-012`). | — |
| FX-009 | P3 | Audio/haptic hooks | Optional mismatch/match feedback. | Behind settings flag. | Product |
| CARD-010 | P2 | Lift curve on flip | Ease `targetLift` / `targetDepth` over ~200ms on face-up. | Coherent with `CARD-003`. | — |
| FX-011 | P1 | Checkmark animate | Scale/fade for matched ✓ (DOM + hit layer). | Respects `reduceMotion`. | CARD-001 |
| CARD-012 | P2 | Gambit third flip | FX classes correct for three-tile resolving. | Manual + unit if applicable. | — |
| FX-013 | P2 | Shuffle polish | Stagger WebGL motion or “deal” Z during shuffle window. | Matches FLIP stagger feel. | — |
| CARD-014 | P1 | E2e strategy | Document flakiness if pixel tests catch particles. | Feature flag or threshold update in tile specs. | FX-005 |
| FX-015 | P3 | Bloom pass | Optional post-FX for hover; quality setting. | Default off; perf budget. | Settings |
| FX-016 | P0 | Reduce-motion matrix | Table: flip, shuffle, hover, pulse, particles, shake. | All new FX gated; QA sign-off. | — |
| FX-017 | P2 | Matched pair link | Dual-tile pulse or beam. | Doesn’t obscure symbols. | — |
| CARD-018 | P2 | Pinned + resolving | Tint stacking clarity. | Visual review + snapshot if needed. | — |
| FX-019 | P2 | Score pop + tile FX | Coordinate `GameScreen` score pop with tile burst. | Optional polish. | — |
| CARD-020 | P1 | DOM-only users | Shuffle + resolving UX when WebGL off. | `runShuffleAnimation` + fallback grid tested. | — |

---

## ID mapping (research draft → final)

Research used **FX-004** for mismatch shake and **FX-005** for particles; **CARD-001**–**CARD-003** unchanged. **FX-016** should be scheduled **before** FX-005 / FX-004 merge to avoid shipping motion without policy.

---

## Refinement notes

- **CARD-014** / **QA-005** (`TASKS_ASSETS_QA.md`): WebGL screenshot diff ratio may need bump if stage effects add noise.
- **CARD-020** prevents “WebGL-first” features from leaving fallback players behind.

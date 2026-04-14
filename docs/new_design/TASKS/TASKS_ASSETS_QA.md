# Tasks: Assets consolidation & QA (`AST-*`, `QA-*`)

**Research summary:** `src/renderer/assets/ui/index.ts` is the shell `UI_ART` barrel (PNG menu/gameplay backgrounds, SVG crest/divider/emblem/seal/stage-ring). `modeArt.ts` drives mode posters. **`slots.ts`** exports another object also named `UI_ART` (slot chrome + card texture URLs) — import with an alias when both are needed; see `ASSET_SOURCES.md`. `frames/hud-segment-ornament.svg` ties to `hudScoreSegment` in `GameScreen.module.css`. **`assets/ui/icons/`** holds gameplay rail / power SVGs (barrel `icons/index.ts`). Main menu / settings use `<img>` and shell assets, not necessarily that icons folder.

**Tests at risk:** `mobile-layout` (HUD vs board geometry), `navigation-flow` (`game-hud`), `tile-card-face-dom` (`.cardBack` stack), `tile-card-face-webgl` (stage screenshot diff), `visual-screens.*`, `tile-board-raycast`.

---

## Asset tasks (`AST-*`)

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| AST-001 | P1 | Single source for scenes | Resolve any legacy `menu-scene.svg` / `gameplay-scene.svg` vs PNG backgrounds; one authoritative path per screen. | `index.ts` + disk + `ASSET_SOURCES.md` agree; dead assets removed or documented legacy. | — |
| AST-002 | P1 | Backgrounds on disk | All imports in `index.ts` / `modeArt.ts` resolve in CI. | Fresh clone + `yarn build` OK. | — |
| AST-003 | P2 | Document `slots.ts` vs `index.ts` | Explain when to import which barrel (cards vs shell UI). | Short table in `ASSET_SOURCES.md` or `assets/ui/README`. | — |
| AST-004 | P1 | HUD ornament sync | If HUD segments move, update `hud-segment-ornament.svg` placement in `GameScreen.module.css`. | Visual review. | HUD-001 |
| AST-005 | P2 | Card texture regen | When palette shifts, rerun `scripts/card-pipeline/generate-card-textures.ps1` (if used) and update sources doc. | Tile e2e green. | Art pass |
| AST-006 | P2 | Future menu icons | If MainMenu/Settings gain icon buttons, add `menuIcons.tsx` or extend pipeline; don’t fork stroke style accidentally. | Design review. | — |

---

## QA / e2e tasks (`QA-*`)

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| QA-001 | P1 | Visual baselines refresh | After HUD/sidebar/chrome changes, update expected captures per project process. | `test:e2e:visual` green. | HUD-019, SIDE-006 |
| QA-002 | P1 | `mobile-layout` tolerances | Re-tune overlap assertions if toolbar width or HUD height changes. | Spec documents px tolerances. | HUD-001, SIDE-004 |
| QA-003 | P1 | Selector migration | If `game-hud` splits, update `navigation-flow` + `mobile-layout`. | Grep-clean `game-hud` usage. | HUD-018 |
| QA-004 | P1 | DOM tile fingerprint | After `.cardBack` / face asset / gradient changes, update `tile-card-face-dom` expectations. | Intentional choice documented. | CARD-001 |
| QA-005 | P1 | WebGL diff budget | If particles/bloom affect stage shot, adjust `maxDiffRatio` or mask region. `tile-card-face-webgl` / `tile-board-raycast` flip steps use **keyboard** (application focus + arrows + Enter) instead of canvas `mouse.click` for reliable picks; still validates one-flip screenshot delta. | Stable CI. | FX-005, FX-015, TBF-010 |
| QA-006 | P2 | Visual scenarios | Add steps if new HUD regions need coverage. | Scenario list updated. | HUD-011 |
| QA-007 | P2 | Raycast spec | Run after `tile-board-frame` / stage DOM changes. | `tile-board-raycast` green. | Layout |

---

## Refinement notes

- **AST-001** prevents “works on my machine” missing PNGs (common with large binaries).
- Treat **QA-001** as a **release gate** for any epic that touches `GameScreen` or global chrome.

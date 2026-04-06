# Current app vs end-product reference — screenshot audit

This document compares **Playwright full-page captures** of the live Vite renderer against the product stills **`docs/ENDPRODUCTIMAGE.png`** (gameplay / system breakdown) and **`docs/ENDPRODUCTIMAGE2.png`** (main menu, settings gameplay tab, mode selection). Use it for art, UI, and systems parity — not pixel-diff automation.

## How the captures were produced

- **Command:** `VISUAL_CAPTURE_ROOT=docs/reference-comparison/captures yarn playwright test e2e/visual-screens.standard.spec.ts --workers=1`
- **Harness:** [`e2e/visualScenarioSteps.ts`](../../e2e/visualScenarioSteps.ts), [`e2e/visualScreenHelpers.ts`](../../e2e/visualScreenHelpers.ts) (`buildVisualSaveJson`, `captureVisualScreen`).
- **Browser:** Chromium (Playwright `Desktop Chrome` device profile).
- **Test save defaults:** `reduceMotion: true` in the visual save JSON (see `buildVisualSaveJson`) — animations and some motion-gated effects differ from a user session with motion enabled.
- **Web server:** Vite on `127.0.0.1:5173` (same as [`playwright.config.ts`](../../playwright.config.ts)).
- **Screenshot:** `page.screenshot({ fullPage: true })` per scenario.

Recent parity work (toolbar illustrated icons, optional board bloom, Game Over scene plate, meta-screen TOCs, graphics quality defaults) can shift captures slightly versus older baselines — regenerate desktop/mobile sets when diffing against this doc.

### Viewports on disk

| Folder | Size | Role |
|--------|------|------|
| [`captures/desktop/landscape/`](captures/desktop/landscape/) | 1440×900 | **Primary** comparison to wide mockups (closest to composite layouts in stills). |
| [`captures/tablet/portrait/`](captures/tablet/portrait/) | 820×1180 | Stacked/mobile-ish layout regression. |

> **Note:** A full `yarn test:e2e:visual` run (including mobile 390×844) hit a timeout on one scenario (`inventory during a run`) in one environment; the **standard** spec completed cleanly and produced the captures above. Regenerate mobile with the same `VISUAL_CAPTURE_ROOT` if you need a complete mobile set.

### Reference stills (source of truth)

| File | Contents |
|------|----------|
| [`../ENDPRODUCTIMAGE.png`](../ENDPRODUCTIMAGE.png) | Gameplay board, HUD breakdown, **card states** (back, hover, face, matched), sidebar legend, palette notes. |
| [`../ENDPRODUCTIMAGE2.png`](../ENDPRODUCTIMAGE2.png) | **Triptych:** main menu (left), settings Gameplay (top right), Choose Your Path (bottom right). |

### Capture ↔ scenario map

| Capture basename | Scenario | Primary reference |
|------------------|----------|-------------------|
| `00-startup-intro.png` | Startup relic intro | Not shown on ENDPRODUCT stills |
| `01-main-menu.png` | Main menu | ENDPRODUCTIMAGE2 **left panel** |
| `01a-choose-your-path.png` | Choose Your Path | ENDPRODUCTIMAGE2 **bottom right** |
| `01b-collection.png` | Collection | Not on ENDPRODUCT stills |
| `01c-inventory-empty.png` | Inventory (no run) | Not on ENDPRODUCT stills |
| `01d-inventory-active.png` | Inventory (in run) | Not on ENDPRODUCT stills |
| `01e-codex.png` | Codex | Not on ENDPRODUCT stills |
| `02-main-menu-howto.png` | Main menu + How To Play | Not on ENDPRODUCT stills |
| `03-settings-page.png` | Settings (Gameplay category) | ENDPRODUCTIMAGE2 **top right** |
| `04-game-playing.png` | Level 1 playing | ENDPRODUCTIMAGE **main board / HUD** |
| `05-pause-modal.png` | Pause | Not on ENDPRODUCT stills |
| `06-run-settings-modal.png` | Run settings | Not on ENDPRODUCT stills |
| `07-floor-cleared-modal.png` | Floor cleared | Not on ENDPRODUCT stills |
| `08-game-over.png` | Game over | Not on ENDPRODUCT stills |

---

## 1. Main menu — capture vs ENDPRODUCTIMAGE2 (left panel)

**Captures:** [`captures/desktop/landscape/01-main-menu.png`](captures/desktop/landscape/01-main-menu.png)

### Matched or close

- Dark fantasy **menu scene** layer + procedural background; title stack **Memory Dungeon** + tagline **Test your mind. Conquer the depths.**
- **Vertical primary actions** (Play, Collection, Inventory, Settings, Exit) with secondary hint lines.
- **Secondary content:** extra run types grid + run archive / stats region (live app exposes more modes than the reference menu list; IA differs by design).

### Differences and missing elements (reference → current)

| Area | Reference (ENDPRODUCTIMAGE2) | Current (capture + code) |
|------|------------------------------|---------------------------|
| **Top strip** | Player **level badge**, **display name**, **two currencies** (shard + coin), **journal / mail / quick-settings** icons | **Four meta cards:** Build, Best score, Daily streak, Steam — **no** level ring, **no** dual currency, **no** journal/mail/quick-settings cluster |
| **Title treatment** | Large **embossed gold metallic** wordmark | **Light serif/cream** display title + small crest SVG; not the same metal/bevel read |
| **PLAY CTA** | **Red–black gradient**, prominent **sword/book** icon, jewel-like CTA | Primary `UiButton` styling; **no** matching iconography on the main Play row |
| **Menu item labels** | **COLLECTION**, **DAILY CHALLENGE**, **SETTINGS**, **EXIT** as top-level vertical list | **Play** opens mode select; **Daily** is not a duplicate top-level button (lives under Choose Your Path); **Collection** and **Settings** present |
| **Bottom widgets** | **Daily challenge** tile + **current run** tile + **social** icons (Discord, Twitter, mail) | **Alternate descents** + **profile/progress** panel; **no** social strip |
| **Background composition** | Strong **blue portal** focal point, chains, specific staging | Illustrated PNG + procedural field; **composition not locked** to the same focal art |
| **Grid overlay** | Not part of reference | Faint **grid** visible in capture over the scene (procedural/menu background treatment) |

---

## 2. Settings (Gameplay) — capture vs ENDPRODUCTIMAGE2 (top right)

**Captures:** [`captures/desktop/landscape/03-settings-page.png`](captures/desktop/landscape/03-settings-page.png)

### Matched or close

- **Split shell:** left category rail + right pane; **Gameplay** category with grouped **cards** and premium dark/gold styling.
- Live settings map to **real** `Settings` in code (audio, video, accessibility, etc.).

### Differences and missing elements

| Area | Reference | Current |
|------|-----------|---------|
| **Difficulty** | EASY / NORMAL / HARD / NIGHTMARE toggles | **Not in live model** — absent |
| **Timer mode** | CLASSIC / COUNTDOWN / RELENTLESS | **Not in live model** — absent |
| **Max lives** | Six-heart selector | **Not in live model** — absent |
| **Card theme** | **Five card-back previews** (four themes + locked), ornate backs | **Not implemented**; no theme row |
| **Tutorial hints** | Dedicated toggle | Partially covered elsewhere; **not** the same control in this pane |
| **Footer** | **Reset to defaults** | Current uses **Back** + **Save** pattern aligned to persisted settings |

---

## 3. Choose Your Path — capture vs ENDPRODUCTIMAGE2 (bottom right)

**Captures:** [`captures/desktop/landscape/01a-choose-your-path.png`](captures/desktop/landscape/01a-choose-your-path.png)

### Matched or close

- Three columns: **Classic**, **Daily** (featured), **Endless** (locked).
- Copy explains daily UTC rotation; **countdown** in footer for daily; endless honestly disabled.

### Differences and missing elements

| Area | Reference | Current |
|------|-----------|---------|
| **Card art** | Each column is a **tall illustrated poster** (blue gate, purple crystal, fire gate) inside **ornate gold frame** | **Flat** gradient panels, **no** archway illustrations, lighter filigree |
| **Subtitle** | “Every run is a new challenge…” style line | Different explanatory paragraph (implementation + design copy) |
| **Selection chrome** | **Strong outer glow** on selected mode (e.g. purple rim on Daily) | **Featured** badge + modest **purple glow** on Daily; weaker than mock |
| **Stats line** | Reference shows **best score / best floor** as large display numerals | Live uses **Unranked** / **em dash** for empty saves in this capture |

---

## 4. Gameplay — capture vs ENDPRODUCTIMAGE.png

**Captures:** [`captures/desktop/landscape/04-game-playing.png`](captures/desktop/landscape/04-game-playing.png)

### Matched or close

- **Dungeon-style stage** backdrop + memorization / run chrome.
- **Top HUD** with **Floor**, **Lives**, **Shards**, **Score**, mode/meta region.
- **Left vertical toolbar** (utility menu, pause, settings, etc.) — functionally aligned with reference sidebar intent.

### Differences and missing elements

| Area | Reference | Current |
|------|-----------|---------|
| **HUD segmentation** | Distinct **gold-trimmed modules**, hex-like floor badge, **score parasite** (purple bar + crystal) | **Single bar** with segments; **no** score-parasite mechanic strip |
| **Daily / seed** | Explicit **daily ID** in HUD row | Mode line shows **Arcade Run** / daily when applicable — not the same layout as mock |
| **Board framing** | Cards on **circular stone dais** / strong floor graphic | Cards sit on **grid** over environment; less staged “arena” read |
| **Card backs** | **Leather/walnut**, **symmetric gold filigree**, **glowing diamond** center | **Illustrated `reference-back.png`** (AI, end-product–aligned) on DOM/WebGL static planes; procedural hatch in [`tileTextures.ts`](../../src/renderer/components/tileTextures.ts) still layers on non-static paths. Fine-tune vs mock as needed. |
| **Card faces** | **3D crystal relic**, **gold serif name**, **effect line** (e.g. +10% score) | **Illustrated `front-face.png`** panel + **symbol-centric** overlay (letters/emoji) + optional label; **not** full item portrait cards |
| **Hover** | **Intense gold bloom** aura | Subtler **border / shadow** lift (CSS fallback) or **3D lift** (WebGL) — weaker bloom |
| **Matched** | **Green glow + large checkmark** overlay | Green-tinted state / pulse; **no** dominant checkmark glyph in the reference style |
| **Mismatch** | **Red pulse** + stress cues | Red-tinted resolving state; less aggressive than mock |
| **Tutorial / FTUE** | Not shown as a large center overlay on the mock | Capture shows **in-run helper copy** over the board (product decision: keep vs relocate) |
| **Pair markers** | N/A | Capture shows **large pair identifiers** on face-down tiles for level-1 tutorial flow — not part of end-product marketing stills |

---

## 5. Screens captured but not in ENDPRODUCT stills

These captures are useful for regression but have **no direct panel** in ENDPRODUCTIMAGE / ENDPRODUCTIMAGE2:

- **Startup intro** (`00-startup-intro.png`)
- **Collection** (`01b-collection.png`)
- **Inventory** empty / active (`01c`, `01d`)
- **Codex** (`01e-codex.png`)
- **How To Play** overlay (`02-main-menu-howto.png`)
- **Pause** (`05-pause-modal.png`)
- **Run settings** (`06-run-settings-modal.png`)
- **Floor cleared** (`07-floor-cleared-modal.png`)
- **Game over** (`08-game-over.png`)

**Gap type:** reference scope is narrower than the **Steam demo** surface area; parity is judged against [`docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`](../new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md) and task files, not only these two PNGs.

---

## 6. Regenerating captures

From repo root:

```bash
# Tablet + desktop (recommended; stable in CI-like runs)
cross-env VISUAL_CAPTURE_ROOT=docs/reference-comparison/captures yarn playwright test e2e/visual-screens.standard.spec.ts --workers=1

# All configured viewports (mobile + tablet + desktop)
cross-env VISUAL_CAPTURE_ROOT=docs/reference-comparison/captures yarn test:e2e:visual
```

Update this document when reference stills change or when new scenarios are added to [`e2e/visualScenarioSteps.ts`](../../e2e/visualScenarioSteps.ts).

**Capture policy (recorded):** Default CI flow uses gitignored Playwright output. Optional committed PNGs under `docs/reference-comparison/captures/` only when intentionally updating design-review baselines—see [`VISUAL_REVIEW.md`](../new_design/VISUAL_REVIEW.md) § “Recorded default”.

---

## 7. Related internal docs

- [`docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`](../new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md) — structured feature/model gaps.
- [`docs/new_design/REFERENCE_VS_SCENARIOS.md`](../new_design/REFERENCE_VS_SCENARIOS.md) — scenario naming map.
- [`docs/new_design/VISUAL_REVIEW.md`](../new_design/VISUAL_REVIEW.md) — how to run visual checks and where outputs go by default.

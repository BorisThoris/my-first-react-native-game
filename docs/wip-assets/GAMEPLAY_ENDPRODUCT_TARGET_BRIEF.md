# Gameplay Endproduct Target Brief

This brief defines how the gameplay portion of [`docs/ENDPRODUCTIMAGE.png`](../ENDPRODUCTIMAGE.png) should be used during refinement. The still remains the approved visual target for this phase. The editable working area lives under `docs/wip-assets/`; final PNG replacement is deferred until review sign-off.

## Inputs and working files

- Fixed target still: [`docs/ENDPRODUCTIMAGE.png`](../ENDPRODUCTIMAGE.png)
- Live evidence: `test-results/endproduct-parity/`
- Reference crop workflow: `yarn wip:extract-endproduct`
- Crop outputs: `docs/wip-assets/png/`, `docs/wip-assets/svg/`, `docs/wip-assets/index.json`

Use the parity captures and extracted reference crops side by side. Do not edit the shipped runtime assets from this brief alone; this file exists to keep the image work decision-complete before final exports happen.

## Panel parity levels

### Must match closely in the live app

| Reference panel | Live evidence | Required parity |
|-----------------|--------------|-----------------|
| Main gameplay shell | `main-game-screen.png` | Environment-first composition, stronger circular dais, clearer board spotlight, warmer torch staging |
| Top bar details | `top-bar-details.png` | Score dominance, tighter floor badge, lighter secondary row, closer Daily / Parasite proportions |
| Face down | `card-face-down.png` | Warmer leather / walnut tone, stronger gold filigree center read |
| Hover | `card-hover.png` | Tighter premium bloom at the rim, not a broad flat wash |
| Flipped | `card-flipped.png` | Richer face hierarchy: premium frame plus clearer title / subtitle / relic treatment |
| Matched | `card-matched.png` | Stronger green success coding and clearer celebratory read |
| Match / mismatch interactions | `interaction-match.png`, `interaction-mismatch.png` | More explicit success burst and failure recoil while keeping states unambiguous |

### May stay reference-only comp for now

| Reference panel | Current status | Rule |
|-----------------|----------------|------|
| Expanded sidebar flyout | No live equivalent; only collapsed rail is implemented | May stay in the design board as a reference-only comp until product chooses to ship it |
| Isolated interaction montage styling | Live captures exist, but the concept board uses more cinematic compositing than the app currently produces | May stay reference-only as long as the live app matches the underlying state grammar |
| Fully cinematic page-turn smear | Live flip capture is real but subtler than the board art | Can remain reference-only until motion / camera work is approved for production |

## Refinement directives

### Environment and stage

- Push the board stage toward a raised stone arena, not a card grid on a vignette.
- Increase warm torch contrast around the edges while keeping the board center readable.
- Preserve generous negative space around the cards.

### HUD

- Keep score as the dominant anchor.
- Reduce how visually heavy the context row feels relative to the primary stat row.
- Tighten the floor badge toward a shield / medallion read.

### Sidebar

- Keep the live rail premium and medallion-led.
- Treat the expanded labeled flyout as optional product scope, not an implementation assumption.

### Cards and interactions

- Warm the hidden-card material toward leather / walnut.
- Give flipped faces a more content-rich hierarchy than the current symbol-first front.
- Increase success celebration and failure recoil without making the board noisy.
- Suppress tutorial-only badge chrome in parity stills unless product explicitly wants it retained.

### Typography and palette

- Keep Cinzel for display hierarchy and Inter for body / utility copy.
- Warm the gameplay palette toward gold / ember / walnut while preserving the existing green, red, and violet state coding.

## Working process

1. Refresh live evidence with:
   `yarn playwright test e2e/hud-inspect.spec.ts e2e/visual-endproduct-parity.spec.ts --workers=1`
2. Extract reference slices when needed with:
   `yarn wip:extract-endproduct`
3. Update working comparisons in `docs/wip-assets/` only.
4. Update [`docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`](../reference-comparison/CURRENT_VS_ENDPRODUCT.md) §4 and [`docs/new_design/TASKS/PLAYING_ENDPRODUCT/README.md`](../new_design/TASKS/PLAYING_ENDPRODUCT/README.md) whenever the visual gap materially changes.
5. Export or replace final PNG stills only after review approves the updated live direction.

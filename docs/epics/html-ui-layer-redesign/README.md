# HTML UI Layer Redesign Epic

## Intent
Rebuild the renderer HTML chrome as a designed layer above the play canvas. The board/card renderer remains responsible for cards, board camera, and board effects; HTML owns player-facing UI: HUD, controls, overlays, meta panels, toasts, and hints.

The current failure mode is visual: the play screen can technically be full-bleed while still reading as a boxed dashboard because the HUD and controls are styled as one large centered container. This epic replaces that with separated, intentional chrome islands.

## Target Composition
- **Canvas layer:** board fills the play screen and initially centers the card layout.
- **Top chrome:** three independent HUD islands: run/floor at left, score at center, lives/resources/timer at right.
- **Intel ribbon:** mutators, mode, and secondary stats are subordinate, compact, and collapsible where possible.
- **Action layer:** icon-first actions sit in a bottom dock or side rail depending on viewport.
- **Overlay layer:** pause, floor clear, relic draft, settings, codex/inventory, FTUE, toasts, and score floaters share one z-index contract.

## Component Direction
- `GameplayChromeShell`: owns HTML chrome placement above the canvas.
- `GameplayTopHud`: compact primary stat islands.
- `GameplayActionDock`: board powers and utility actions.
- `GameplayOverlayRoot`: modal/toast/FTUE stack.
- Shared primitives: `ChromeFrame`, `IconMedallionButton`, `StatMedallion`, `StatusTicker`, `SegmentedBadge`, `FantasyTooltip`, `OverlayPanel`.

## Phases
1. **Gameplay chrome reset:** replace the single boxed top HUD with separated islands and a subdued secondary ribbon.
2. **Primitive extraction:** move repeated frame, icon-button, medallion, tooltip, and overlay styling into `src/renderer/ui`.
3. **Overlay pass:** restyle pause, floor clear, relic draft, settings modal, and run meta overlays with the new primitives.
4. **Meta screen pass:** apply the same HTML chrome language to main menu, choose path, inventory, codex, collection, settings, and game over.
5. **Visual QA:** capture desktop/tablet/mobile stills, update parity docs, and remove legacy one-off CSS.

## Acceptance
- Desktop gameplay no longer reads as cards inside a central UI box.
- HUD hierarchy is obvious at a glance: score first, run/floor/lives second, tactical context third.
- HTML UI never blocks the central card play area except intentional overlays.
- 390x844, 844x390, 1280x720, and 1440x900 viewports avoid clipped text and incoherent overlap.
- Existing gameplay state, save data, and store actions are unchanged.

# Tasks: Accessibility, i18n, extended e2e (`A11Y-*`, `E2E-*`)

**Research pass:** `aria-*`, `role`, `OverlayModal` focus trap, `StartupIntro` dialog, `SettingsScreen` modal, toast rail, landmark structure; `i18n` packages (none); full `e2e/*.spec.ts` inventory vs parity docs; flake notes.

**Finding:** Solid patterns on gameplay HUD, tiles, OverlayModal; **`<main>`** scrollport in [`App.tsx`](../../../src/renderer/App.tsx); **no skip link**; **StartupIntro** + **Settings** / **OverlayModal** use shared **document-capture Tab trap** ([`focusables.ts`](../../../src/renderer/a11y/focusables.ts)); **toasts** use per-item **`aria-live`** in [`NotificationHost`](../../../packages/notifications/src/NotificationHost.tsx); **single locale** English; **`ui-screenshots.spec.ts`** not in parity doc set.

**Cross-links:** `TASKS_OVERLAYS_FTUE.md` (OVR-010), `TASKS_NAVIGATION_STATE.md` (NAV-008). **A11Y-008:** deferred i18n plan — [`I18N_FOUNDATION.md`](../I18N_FOUNDATION.md) (not Steam demo v1).

---

## Accessibility & i18n

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| A11Y-002 | P2 | Skip link | Focus-visible skip to main. | Keyboard-only pass. | — |
| A11Y-006 | P2 | Backdrop inert | `inert` or `aria-hidden` on shell behind dialogs. | Tab cannot reach board under pause. | — |
| A11Y-007 | P2 | Heading outline audit | One `h1` policy; sr-only level vs meta titles. | Doc or fix list. | — |
| A11Y-008 | P3 | i18n foundation | If shipping non-EN: choose stack + string extraction policy. | Deferred until product asks. | — |

---

## E2E & harness

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| E2E-001 | P2 | Document `ui-screenshots.spec.ts` | CI vs local-only; `tmp/` writes. | README in `e2e/` or tasks. | — |
| E2E-002 | P2 | Startup intro contract spec | Dismiss + `data-e2e-menu-pointer` stability. | Reduces flake from `startupIntroHelpers`. | — |
| E2E-003 | P2 | Pause modal keyboard | Focus lands in dialog; Tab stays trapped. | Playwright. | A11Y-004 |
| E2E-004 | P2 | Achievement toast | Seed unlock; assert status region or testid. | — | A11Y-005 |
| E2E-005 | P2 | Game over landmarks | Headings/regions for expedition over. | — | A11Y-007 |

---

## Spec inventory (not all cited in pass 1 parity docs)

| Spec | Role |
|------|------|
| `mobile-layout.spec.ts` | HUD/board geometry |
| `navigation-flow.spec.ts` | `game-hud` |
| `tile-card-face-*.spec.ts` | DOM/WebGL tiles |
| `tile-board-raycast.spec.ts` | Hit geometry |
| `visual-screens.*.spec.ts` | Full-page baselines |
| `visual-inventory-capture.spec.ts` | Inventory captures |
| **`ui-screenshots.spec.ts`** | Local tmp captures — **document in E2E-001** |

---

## Flake watchlist

- `tile-card-face-webgl`: GPU pixel diff, fixed `waitForTimeout`.
- `dismissStartupIntro`: race with pointer-events.
- Visual suite: serial, long; retries mask CI noise — track retry rate.

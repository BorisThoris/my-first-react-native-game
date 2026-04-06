# Tasks: View state & navigation (`NAV-*`)

**Research pass:** `ViewState` in `contracts.ts`, `useAppStore.ts` transitions, `App.tsx` conditional render (no React Router), `freezeRun` / `clearAllTimers` / `resumeRunWithTimers`, `subscreenReturnView` / `settingsReturnView`.

**Finding:** Single return pointers — **no stack** for nested meta. **Codex from menu** missing (`openCodexFromPlaying` only). **`goToMenu`** without confirm from pause/floor clear. **`endRun`** unused vs `goToMenu`. Browser back not integrated.

**Cross-links:** `TASKS_SIDEBAR_PARITY.md` (SIDE-003 exit), `TASKS_CROSSCUTTING.md` (timer risks).

---

## Task table

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| NAV-001 | P1 | Navigation model doc | Single diagram/table: `view`, return pointers, modal vs page. | Checked into `docs/new_design/`. | — |
| NAV-002 | P1 | `openCodexFromMenu` | Reference content from main menu like inventory. | `MainMenu` + store; `closeSubscreen` correct. | NAV-001 |
| NAV-003 | P1 | Confirm abandon run | Before `goToMenu` from Retreat / in-run Main Menu when run non-trivial. | Copy + cancel; tests. | Product |
| NAV-004 | P1 | Reset return pointers | `goToMenu` / canonical exit sets `subscreenReturnView` & `settingsReturnView` safe defaults. | No stale back targets. | — |
| NAV-005 | P2 | Deprecate or use `endRun` | One API for “exit run”. | Grep-clean; doc. | NAV-004 |
| NAV-006 | P2 | Settings from meta screens | Open settings from mode select / collection with correct `settingsReturnView`. | UX decision. | NAV-001 |
| NAV-007 | P2 | Browser Back mapping | `popstate` or doc “intentionally none”. | Defined behavior. | NAV-001 |
| NAV-008 | P1 | Modal a11y parity | `aria-modal`, focus return for in-game shell overlays. | Matches OverlayModal where possible. | A11Y-006 |
| NAV-009 | P2 | Nested meta stack | If product needs depth >1, replace single pointer with stack. | Breaking change plan. | Product |
| NAV-010 | P1 | Store/e2e matrix | inventory/codex/settings from playing; memorize/resolving/paused/levelComplete. | `useAppStore` + Playwright cases. | — |
| NAV-011 | P3 | URL / deep link stub | `view` ↔ history for web builds. | Doc or minimal impl. | Product |
| NAV-012 | P2 | Boot → menu flash | `boot` / intro / hydrate never shows wrong `data-view`. | Visual check. | App.tsx |
| NAV-013 | P1 | Sidebar exit contract | New rail exit: freeze/resume/timer rules documented. | Same as settings/inventory. | SIDE-003 |
| NAV-014 | P2 | Telemetry | open/close inventory, codex, settings-from-playing. | Optional analytics. | Product |

---

## Implementation risks (sidebar / overlays)

- **Timer contract:** Any overlay must mirror `freezeRun` + `clearAllTimers` + `resumeRunWithTimers` or lose deadlines.
- **`view` vs visual `playing`:** `App.tsx` `visualView` / `inGameShellOverlay` must stay consistent or board unmounts.
- **Single pointer:** Opening a second meta layer can clobber `subscreenReturnView`.

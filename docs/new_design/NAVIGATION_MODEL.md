# Navigation model (`NAV-001`)

Single source for how **`view`**, return pointers, and overlays interact. The app uses **Zustand** + conditional render in [`App.tsx`](../../src/renderer/App.tsx) (no React Router in the desktop shell).

## `ViewState` (see `contracts.ts`)

Core views: `boot` | `menu` | `modeSelect` | `playing` | `paused` (implicit via `run.status`) | `collection` | `inventory` | `codex` | `settings` | `gameOver` | …

## Return pointers

| Field | Meaning |
|-------|---------|
| **`subscreenReturnView`** | Where **Back** / `closeSubscreen` returns when `view` is `inventory` or `codex` (`menu` or `playing`). |
| **`settingsReturnView`** | Where **Save/Back** from `SettingsScreen` returns (`menu`, `playing`, etc.). |

## Run freeze

Opening inventory/codex/settings from **playing** calls **`freezeRun`** + **`clearAllTimers`**; closing resumes with **`resumeRunWithTimers`** when appropriate. Documented in store methods in [`useAppStore.ts`](../../src/renderer/store/useAppStore.ts).

## `goToMenu` / exit (`NAV-003`, `NAV-004`)

- **Toolbar / Retreat:** Opens confirm modal; confirm calls **`goToMenu`** (`GameScreen.tsx`).
- **`goToMenu`** clears timers, drops `run`, sets **`subscreenReturnView`** and **`settingsReturnView`** to **`menu`** (safe defaults — **`NAV-004`**).

## Codex from menu (`NAV-002`)

**`openCodexFromMenu`** sets `view: 'codex'`, `subscreenReturnView: 'menu'`. Wired from [`MainMenu`](../../src/renderer/components/MainMenu.tsx) via [`App.tsx`](../../src/renderer/App.tsx).

## Visual vs logical view

**`visualView`** / **`data-view`** may stay `playing` when settings or meta panels overlay the run so the board does not unmount (`inGameSettingsOverlay`, `inGameShellOverlay`).

## Browser back (`NAV-007`)

**Intentionally not mapped** in the Electron/desktop shell; document-only unless a web build adds `popstate`.

# Epic: Onboarding, FTUE, and reference copy

## Scope

First-run teaching, powers discovery, and **read-only** reference (`Codex`) — gameplay-adjacent but affects comprehension of mechanics.

## Implementation status

| System | Status | Notes |
|--------|--------|--------|
| Main menu “How to play” | **Shippable** | `onboardingDismissed` in save; `showHowToPlay={!saveData.onboardingDismissed}` in `App.tsx`; test in `App.test.tsx`. |
| Powers FTUE toast | **Functional** | `powersFtueSeen`; `GameScreen` fires notification (`POWERS_FTUE_TOAST`) early in a run when board exists and FTUE not seen; dismiss persists via `dismissPowersFtue`. |
| Tutorial pair markers (WebGL) | **Shippable** | `showTutorialPairMarkers` from `GameScreen` → `TileBoard` → `TileBoardScene`; **`TutorialPairMarkerPlane`** draws a small **pair-index badge** on hidden card backs when the FTUE gate applies (early floors, powers FTUE not yet seen). |
| Codex | **Shippable** | `CodexScreen.tsx` renders encyclopedia exports (`CODEX_CORE_TOPICS`, granular topic arrays, `GAME_MODE_CODEX`, `RELIC_CATALOG`, `MUTATOR_CATALOG`, `VISUAL_ENDLESS_MODE_LOCKED`, `ENCYCLOPEDIA_VERSION`) plus achievements via `game-catalog` barrel. Explicit subtitle: reference does not change gameplay. |
| Copy vs mechanics drift | **Risky** | Codex is static strings; new mechanics (e.g. pair distance hints, gambit) need periodic sync. |

## Rough edges

- **Pair markers:** WebGL uses a **compact numeric badge** on backs; DOM legacy path may differ — keep how-to copy high-level (“pair hints”) unless product demands pixel parity.
- **Codex coverage:** Does not auto-list every mutator edge case (e.g. sticky fingers block is HUD-only). Acceptable for a reference screen, not a spec.

## Primary code

- `src/renderer/App.tsx`, `GameScreen.tsx` — onboarding + FTUE + `showTutorialPairMarkers` gating.
- `src/renderer/components/TileBoardScene.tsx`, `TutorialPairMarkerPlane.tsx` — WebGL tutorial badges.
- `src/renderer/components/CodexScreen.tsx`
- `src/shared/mechanics-encyclopedia.ts` — codex copy source of truth (`ENCYCLOPEDIA_VERSION` bumps when entries change).
- `src/shared/game-catalog.ts` — re-exports encyclopedia + achievements + `get*` helpers for UI.
- `src/shared/save-data.ts` — `onboardingDismissed`, `powersFtueSeen`.

## Refinement

**Shippable** for codex shell + save-gated how-to + **WebGL tutorial pair badges** on eligible floors.

## Tasks (polish backlog)

Tracked in rollup: [GAMEPLAY_POLISH_AND_GAPS.md](./GAMEPLAY_POLISH_AND_GAPS.md) §11.

- [x] **WebGL** tutorial pair-index markers (`TutorialPairMarkerPlane`).
- [ ] When mechanics change (pair hints, gambit, sticky, etc.), sync `mechanics-encyclopedia.ts` and bump `ENCYCLOPEDIA_VERSION`; treat the version as the periodic audit hook (renderer shows it in the Codex subtitle).

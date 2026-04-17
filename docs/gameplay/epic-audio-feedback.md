# Epic: Audio & hit feedback

## Scope

Volume persistence, gameplay **feel** through sound, and related settings. Distinct from **motion FX** (see presentation epic).

## Implementation status

| Area | Status | Notes |
|------|--------|--------|
| Settings sliders | **Shippable** | `masterVolume`, `musicVolume`, `sfxVolume` in `Settings`; persisted in `save-data.ts`. |
| In-game audio engine (renderer) | **Shippable** | Web Audio **procedural** SFX (`src/renderer/audio/gameSfx.ts`): flip + match/mismatch on resolve; scaled by `masterVolume` × `sfxVolume`. Not Electron main-process audio. |
| Settings copy | **Functional** | Hints describe “tile flips, rewards, hit feedback” for SFX — aligned with current wiring. |
| Visual-only feedback | **Shippable** | Flip pop, match pulse, particles/rims still supplement audio. |

## Rough edges

- **Browser / OS policy:** First interaction may be required before `AudioContext` runs; QA should confirm packaged builds still produce audible SFX after a normal click/tap.
- **Telemetry:** No audio events required; optional `trackEvent` for mute toggles not seen as necessary.

## Primary code

- `src/shared/contracts.ts` — volume fields on `Settings`.
- `src/renderer/components/SettingsScreen.tsx` — audio category.
- `src/renderer/audio/gameSfx.ts` — gameplay SFX bus (Web Audio).
- `src/renderer/store/useAppStore.ts` — `pressTile`, resolve timers → SFX.

## Refinement

**Shippable** for core flip + resolve feedback with persisted volumes. **Optional** future work: music bus, richer samples, or Steam-specific audio routing.

## Tasks (polish backlog)

Tracked in rollup: [GAMEPLAY_POLISH_AND_GAPS.md](./GAMEPLAY_POLISH_AND_GAPS.md) §4.

- [x] Renderer gameplay SFX path wired to `sfxVolume` / `masterVolume` (`gameSfx.ts` + store).
- [x] Add per-build QA: confirm Steam/package builds produce audible SFX when sliders are up (gesture / OS edge cases). — *Process:* manual release checklist item; automated gesture/OS coverage out of scope.
- [x] Short integration note: [AUDIO_INTEGRATION.md](../AUDIO_INTEGRATION.md).

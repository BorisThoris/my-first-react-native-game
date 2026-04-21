# Audio integration (desktop)

**Status:** Volume sliders persist via `Settings` / `save-data.ts`. **Gameplay SFX** uses **Web Audio** — **procedural** oscillators by default, with **optional** sampled **OGG/WAV** one-shots from [`src/renderer/assets/audio/sfx/`](../src/renderer/assets/audio/sfx/README.md) when files are present. Effective gain is **`masterVolume` × `sfxVolume`**.

**Background music** uses an **`HTMLAudioElement`** loop ([`gameplayMusic.ts`](../src/renderer/audio/gameplayMusic.ts)): gain is **`masterVolume` × `musicVolume`**. Playback runs while **`visualView`** is **menu** or **playing** (main menu + active run, including in-run settings/codex overlays where `data-view` stays `playing`). Other views pause the track. **Autoplay:** browsers may block `play()` until a user gesture; the hook retries after the first **`pointerdown`** (same class of policy as SFX, though Web Audio vs media element APIs differ).

## Current wiring

| Event | Where | Module |
|-------|--------|--------|
| Flip | After a successful `flipTile` in `pressTile` | `src/renderer/audio/gameSfx.ts` → `playFlipSfx` |
| Match / mismatch | When `resolveBoardTurn` runs (timer or immediate) | `playResolveSfx` (compares stat deltas on the run) |

`resumeAudioContext()` is called after tile presses (gesture) and again when **`applyResolveBoardTurn`** runs (immediate or timer-driven resolve) so a still-suspended context can resume before match/mismatch tones—not every resolve follows a fresh user gesture. The same call starts a **one-time** async preload of optional samples (`maybePreloadSampledSfx`).

## Files

- `src/renderer/audio/webAudioContext.ts` — shared `AudioContext` for procedural + sampled playback
- `src/renderer/audio/sampledSfx.ts` — manifest-driven decode + buffer playback (tests skip samples via `import.meta.env.MODE === 'test'`)
- `src/renderer/audio/gameSfx.ts` — gain helpers, sampled-first then procedural fallback for all gameplay one-shots
- `src/renderer/audio/gameplayMusic.ts` — menu/run background loop asset + volume + view gating (`useGameplayMusic` from `App.tsx`)
- `src/renderer/assets/audio/sfx/manifest.json` — logical keys → filenames + match streak tier ranges
- `src/renderer/assets/audio/music/` — loop file(s); see [`music/README.md`](../src/renderer/assets/audio/music/README.md)
- `src/renderer/store/useAppStore.ts` — calls into `gameSfx` from `pressTile` and resolve scheduling

## Sampled one-shots (optional)

1. Generate offline (e.g. ACE-Step `jobs.sfx.example.json`), **trim** long renders to tight cues, export OGG/WAV.
2. Copy into `src/renderer/assets/audio/sfx/` using names from `manifest.json` (see folder README).
3. Rebuild; Vite bundles only files that exist. Missing keys keep **procedural** tones.

**Match streaks:** three tier samples (`match-tier-low` / `mid` / `high`) map to streak depth ranges in `manifest.json`.

## Visual match feedback (DOM, not Web Audio)

Floating **+score** on a successful match resolve, and a **“Miss”** label on mismatch, are **DOM-only** and do not use `gameSfx`. They use `matchScorePop` and `mismatchScorePop` in `useAppStore.ts`, set in `applyResolveBoardTurn` before `applyResolvedRun`, and rendered in `GameScreen.tsx` over `boardStage` using tile rects from `TileBoard`. Timing constants live in `matchScoreFloaterTiming.ts`; live region copy is in `copy/matchScoreFloater.ts` and `copy/mismatchFloater.ts`. **Match/mismatch SFX** still come only from `playResolveSfx` on the same resolve tick as the store update.

## QA

Verify packaged Windows build with **master + SFX** sliders at audible levels and confirm flip / match / mismatch feedback per release. If a build is silent, check OS mixer, Electron audio, and that a user gesture occurred before the first flip (browser autoplay policies).

## Offline generation (ACE-Step, legal-safe)

Batch **text-only** jobs with **ACE-Step 1.5** — see `scripts/audio-pipeline/README.md`, `RIGHTS.md`, `jobs.sfx.example.json` (one-shots), `jobs.music-chill.json` / `jobs.game-ambient.example.json` (beds). Raw renders land under `tmp/audio/ace-step/` (gitignored); trim and copy finals into `src/renderer/assets/audio/sfx/` and `src/renderer/assets/audio/music/` (replace `chill-loop.wav` when upgrading from placeholders).

Regenerate checked-in procedural placeholders after manifest edits: `yarn audio:placeholders`. The bundled chill loop is a synthesized **beat + bass + pads** loop (see `generate-procedural-sfx-wavs.mjs`), not a monotone drone.

The renderer loads the menu/run loop from `src/renderer/assets/audio/music/chill-loop.wav` (bundled via Vite `?url` import in `gameplayMusic.ts`).

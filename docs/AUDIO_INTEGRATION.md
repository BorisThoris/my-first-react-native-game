# Audio integration (desktop)

**Status:** Volume sliders persist via `Settings` / `save-data.ts`. **Gameplay SFX** uses a small **Web Audio** layer in the renderer — **procedural** tones (no binary asset files), gated by **`masterVolume` × `sfxVolume`**.

## Current wiring

| Event | Where | Module |
|-------|--------|--------|
| Flip | After a successful `flipTile` in `pressTile` | `src/renderer/audio/gameSfx.ts` → `playFlipSfx` |
| Match / mismatch | When `resolveBoardTurn` runs (timer or immediate) | `playResolveSfx` (compares stat deltas on the run) |

`resumeAudioContext()` is called after tile presses (gesture) and again when **`applyResolveBoardTurn`** runs (immediate or timer-driven resolve) so a still-suspended context can resume before match/mismatch tones—not every resolve follows a fresh user gesture.

## Files

- `src/renderer/audio/gameSfx.ts` — gain helpers, `playFlipSfx`, `playMatchSfx`, `playMismatchSfx`, `playResolveSfx`
- `src/renderer/store/useAppStore.ts` — calls into `gameSfx` from `pressTile` and resolve scheduling

## QA

Verify packaged Windows build with **master + SFX** sliders at audible levels and confirm flip / match / mismatch feedback per release. If a build is silent, check OS mixer, Electron audio, and that a user gesture occurred before the first flip (browser autoplay policies).

# Sampled gameplay SFX (optional)

[`manifest.json`](manifest.json) lists logical keys → filenames. Drop matching **OGG or WAV** files next to this README (same folder). Vite bundles only files that exist; missing files fall back to **procedural** Web Audio in [`gameSfx.ts`](../../../audio/gameSfx.ts).

## Filenames

| Key | Default file |
|-----|----------------|
| flip | `flip.wav` |
| gambitCommit | `gambit-commit.wav` |
| match-tier-low | `match-tier-low.wav` |
| match-tier-mid | `match-tier-mid.wav` |
| match-tier-high | `match-tier-high.wav` |
| mismatch | `mismatch.wav` |
| power-arm | `power-arm.wav` |
| destroy-pair | `destroy-pair.wav` |
| peek-power | `peek-power.wav` |
| stray-power | `stray-power.wav` |
| shuffle-full | `shuffle-full.wav` |
| shuffle-quick | `shuffle-quick.wav` |
| floor-clear | `floor-clear.wav` |

**Match tiers:** streak depth after a match maps to low / mid / high (`manifest.json` → `matchTierDepthRanges`).

## Pipeline

Generate offline (e.g. ACE-Step `text2music`), trim to tight one-shots, normalize, export OGG. See `scripts/audio-pipeline/jobs.sfx.example.json` and `scripts/audio-pipeline/README.md`.

# ACE-Step 1.5 — local audio batch (dev-only)

Offline music generation with [ACE-Step 1.5](https://github.com/ace-step/ACE-Step-1.5): text prompts, optional **reference / source** audio for style or cover-style tasks. Outputs go to `tmp/audio/ace-step/` (gitignored), same idea as `scripts/card-pipeline/` + SDXL.

## Prerequisites

- **Python 3.11 or 3.12** (required by upstream; use a **dedicated venv** — do not reuse the SDXL/card venv if it is 3.10).
- **NVIDIA GPU**, **CUDA 12.8** stack matching the PyTorch wheels ACE-Step pins on Windows (see upstream `pyproject.toml`).
- **24 GB VRAM** is enough for the default turbo + LM path without aggressive offload; upstream may still auto-offload depending on LM size—see their CLI logs.

## Install ACE-Step 1.5 (once per machine)

Follow the official repo: clone or install the package so `import acestep` works (pip/uv from GitHub as documented there). Typical steps:

1. Create a venv with Python 3.11+.
2. Install PyTorch with **CUDA 12.8** from the PyTorch index (match [ACE-Step-1.5](https://github.com/ace-step/ACE-Step-1.5) `pyproject.toml`).
3. `pip install` / `uv sync` the **ACE-Step 1.5** project (not the older ACE-Step repo unless you know you need it).
4. Download checkpoints: use upstream’s `acestep-download` or first launch `acestep` Gradio once so weights land under the expected **checkpoints** directory (often next to the package or under the user cache—see upstream docs).

Set `HF_TOKEN` if Hugging Face gates any weights.

## Legal / rights

Use only **reference or source audio you have the right to use** (your stems, licensed packs, etc.). Generated output may still resemble commercial styles; clear rights and labeling are your responsibility.

See **[RIGHTS.md](RIGHTS.md)** for strategy (text-only vs licensed references vs clearance). **[EVENT_MAP.md](EVENT_MAP.md)** maps Memory Dungeon Web Audio events to procedural vs ACE-Step use. **[PROMPTS.md](PROMPTS.md)** lists rights-safe caption seeds. For CC-BY reference files in `samples/`, use **[samples/ATTRIBUTION.template.txt](samples/ATTRIBUTION.template.txt)**.

## Usage

From the **game repo root**:

```bash
yarn audio:ace-step:batch:dry
yarn audio:ace-step:batch
```

Or directly:

```bash
py -3.11 scripts/audio-pipeline/batch_ace_step.py --dry-run --jobs scripts/audio-pipeline/jobs.example.json
py -3.11 scripts/audio-pipeline/batch_ace_step.py --jobs scripts/audio-pipeline/jobs.example.json
```

Copy `jobs.example.json` to e.g. `tmp/my-jobs.json`, edit captions and paths, then pass `--jobs tmp/my-jobs.json`.

The bundled `jobs.example.json` includes three jobs: **01** runs with no extra files; **02** and **03** expect audio files under `scripts/audio-pipeline/samples/` (see `samples/README.md`). Remove or edit those jobs if you do not add files yet.

### Jobs file

JSON object with a `jobs` array. Each job **must** include `id`. Other fields map to ACE-Step `GenerationParams` (see upstream `docs/en/INFERENCE.md`). Unknown keys are rejected.

Paths `reference_audio` and `src_audio` are resolved relative to the **jobs file’s directory**, then relative to the repo root.

For **`cover`**, set `task_type`: `"cover"`, `src_audio` to your loop/file, `caption` to the target style, and optionally `audio_cover_strength` (e.g. `0.5`).

### Outputs

- Rendered files under `tmp/audio/ace-step/` (default; override with `--out-dir`).
- Manifest: `tmp/audio/ace-step/generated-ace-step-last-run.json`.

## Yarn scripts

| Script | Purpose |
|--------|---------|
| `yarn audio:ace-step:batch` | Run batch (needs venv + ACE-Step installed). |
| `yarn audio:ace-step:batch:dry` | Validate jobs + print paths; no GPU import. |

Adjust `py -3.11` in `package.json` if your launcher uses a different Python alias.

### Ambient-only jobs (no sample files)

Text-only loops for menu/run beds (nothing in `samples/` required):

```bash
py -3 scripts/audio-pipeline/batch_ace_step.py --dry-run --jobs scripts/audio-pipeline/jobs.game-ambient.example.json
```

Hybrid ambience jobs — optional beds to pair with the bundled procedural chill loop:

```bash
py -3 scripts/audio-pipeline/batch_ace_step.py --dry-run --jobs scripts/audio-pipeline/jobs.hybrid-ambient.json
```

When a render is selected, trim it to a clean loop, export WAV, and replace or add files under [`src/renderer/assets/audio/music/`](../src/renderer/assets/audio/music/README.md) (see `gameplayMusic.ts` for how the menu/run loop is loaded).

### Gameplay one-shots (`jobs.sfx.example.json`)

Use [`jobs.sfx.example.json`](jobs.sfx.example.json) to batch captions for flip / match tiers / shuffle / powers / floor clear. ACE-Step outputs **long** clips — **trim** each render to a short cue in a DAW or `ffmpeg`, normalize, export **OGG**, then copy into [`src/renderer/assets/audio/sfx/`](../src/renderer/assets/audio/sfx/README.md) with filenames from [`manifest.json`](../src/renderer/assets/audio/sfx/manifest.json). Rebuild the app; missing files keep procedural `gameSfx` tones.

```bash
py -3 scripts/audio-pipeline/batch_ace_step.py --dry-run --jobs scripts/audio-pipeline/jobs.sfx.example.json
```

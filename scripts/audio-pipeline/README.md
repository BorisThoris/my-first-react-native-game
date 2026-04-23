# ACE-Step 1.5 — local audio batch (dev-only)

Offline music generation with [ACE-Step 1.5](https://github.com/ace-step/ACE-Step-1.5): text prompts, optional **reference / source** audio for style or cover-style tasks. Outputs go to `tmp/audio/ace-step/` (gitignored), same idea as `scripts/card-pipeline/` + SDXL.

## Prerequisites

- **Python 3.11 or 3.12** (required by upstream; use a **dedicated venv** — do not reuse the SDXL/card venv if it is 3.10).
- **NVIDIA GPU**, **CUDA 12.8** stack matching the PyTorch wheels ACE-Step pins on Windows (see upstream `pyproject.toml`).
- **24 GB VRAM** is enough for the default turbo + LM path without aggressive offload; upstream may still auto-offload depending on LM size—see their CLI logs.

### Windows GPU one-time setup (recommended)

Use a **dedicated venv** at the repo root so ACE-Step and CUDA PyTorch stay isolated from other Python projects:

1. From the **repository root**, run:

   ```powershell
   .\scripts\audio-pipeline\setup-audio-env.ps1
   ```

   This creates **`.venv-audio/`** (gitignored) and prints the exact follow-up steps.

2. Activate it before every batch session:

   ```powershell
   .\.venv-audio\Scripts\Activate.ps1
   ```

3. **Secrets / device**: copy **[`environment.audio.example.env`](environment.audio.example.env)** to **`scripts/audio-pipeline/environment.audio.local.env`** (gitignored), set **`HF_TOKEN`** if needed and adjust **`ACESTEP_DEVICE`** / optional **`ACESTEP_*`** vars. Load them into your shell before running `yarn audio:ace-step:*` (see comments in the example file).

4. Install **PyTorch (CUDA)** and **ACE-Step 1.5** inside this venv only — follow the URLs printed by the setup script and [Install ACE-Step 1.5](#install-ace-step-15-once-per-machine) below.

5. **`yarn audio:ace-step:*`** uses **[`run-ace-batch.mjs`](run-ace-batch.mjs)** — it prefers **`.venv-audio\Scripts\python.exe`** (or **`ACESTEP_PYTHON`**) automatically, so you **do not** need to activate the venv before Yarn unless you prefer to. Override with **`ACESTEP_PYTHON`** pointing at a full interpreter path if needed.

### One-shot machine bootstrap (Windows)

From the repo root:

```powershell
.\scripts\audio-pipeline\full-audio-setup.ps1
```

Runs **`setup-audio-env.ps1`**, **`install-acestep.ps1`**, then **`yarn audio:prep-ace-app`**. Checkpoint download remains manual — see **[ACE-Step INSTALL.md](https://github.com/ace-step/ACE-Step-1.5/blob/main/docs/en/INSTALL.md)**.

### Weights in a sibling folder (HuggingFace-style repo)

If you cloned weights into something like `../Ace-Step1.5` next to this game (folders `acestep-v15-turbo/`, `acestep-5Hz-lm-1.7B/`, `Qwen3-Embedding-0.6B/`, `vae/` at that root), set **`ACESTEP_PROJECT_ROOT`** to that **absolute** path before `yarn audio:ace-step:*`. See [`environment.audio.example.env`](environment.audio.example.env).

Upstream expects **`ACESTEP_PROJECT_ROOT/checkpoints/acestep-v15-turbo/`**. If your snapshot is **flat** (turbo at the repo root), `batch_ace_step.py` creates **`checkpoints/`** and **directory junctions** into those folders on Windows (symlinks on macOS/Linux) on first run — no duplicate downloads. If junction creation fails, enable Windows Developer Mode or run the shell elevated once, or move the folders manually under `checkpoints/`.

### Unblocking the full ACE batch (references + `acestep`)

Two things used to stall runs:

| Blocker | Fix |
|--------|-----|
| Missing **`dist/assets/sounds/*.wav`** | Jobs use **`scripts/audio-pipeline/reference-audio/`**. Either run **`yarn audio:prep-ace-app`** (procedural stubs + **`yarn audio:materialize-references`**) or copy your **entire** legacy pack with **`yarn audio:materialize-references-from-pack -- --from path\to\sounds`** (optional **`--recursive`**). Then optionally **`yarn audio:apply-reference-coverage -- --write`** so each job’s `reference_audio` is the first file that exists from `referenceSourceCoverage`. See **Legacy sound pack** below. |
| **`No module named 'acestep'`** (wrong interpreter) | Yarn routes through **`run-ace-batch.mjs`**, which runs **`batch_ace_step.py`** with **`.venv-audio`** first (or **`ACESTEP_PYTHON`**). Install packages into that venv via **`install-acestep.ps1`** or **`full-audio-setup.ps1`**. Then download checkpoints per **[ACE-Step INSTALL](https://github.com/ace-step/ACE-Step-1.5/blob/main/docs/en/INSTALL.md)**. |

Then: **`yarn audio:ace-step:app:dry`** (validates jobs; with **`acestep`** installed in **`.venv-audio`**, dry-run also validates **`GenerationParams`** keys) and **`yarn audio:ace-step:app`** for GPU renders into **`tmp/audio/ace-step/`**.

### Legacy sound pack (full folder)

Use this when you have a folder of **legacy-named** `*.wav` files (e.g. restored `dist/assets/sounds/`, same basenames as in [`jobs.memory-dungeon-app-audio.json`](jobs.memory-dungeon-app-audio.json) / `referenceSourceCoverage`).

1. **`yarn audio:materialize-references-from-pack -- --from <abs-or-rel-path>`** — copies every `*.wav` from the pack into **`reference-audio/`** (by basename). Add **`--recursive`** if the pack is nested. If `--from` is already **`reference-audio/`**, only **validates** that each job’s current `reference_audio` file exists. Set **`AUDIO_REFERENCE_PACK`** instead of `--from` if you prefer env.
2. Optional: **`yarn audio:apply-reference-coverage -- --write`** — for each of the 21 jobs, sets `reference_audio` to **`reference-audio/<first existing>`** from that job’s `referenceSourceCoverage` list (priority order). Dry-run (no `--write`) prints the plan.
3. **`yarn audio:ace-step:app:dry`** then GPU batch + **`yarn audio:install:ace-app-outputs`** as usual.

**Prep split:** **`yarn audio:prep-ace-app`** regenerates **procedural** WAVs into `src/renderer/assets/audio/**` before stub materialize — avoid it when those slots already hold finals you care about. For pack-driven references, use **materialize-from-pack** (and placeholders only to fill **missing** shipped files, if needed).

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
yarn audio:ace-step:smoke   # one short text2music job (~1 GPU minute after models load)
yarn audio:ace-step:batch
```

Or directly (same interpreter resolution as Yarn — prefers **`.venv-audio`**):

```bash
node scripts/audio-pipeline/run-ace-batch.mjs --dry-run --jobs scripts/audio-pipeline/jobs.example.json
node scripts/audio-pipeline/run-ace-batch.mjs --jobs scripts/audio-pipeline/jobs.example.json
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
| `yarn audio:ace-step:batch` | Run batch (**`run-ace-batch.mjs`** prefers **`.venv-audio`**). |
| `yarn audio:ace-step:batch:dry` | Validate jobs + print paths; no GPU import. |
| `yarn audio:ace-step:smoke` | Single job [`jobs.smoke-one.json`](jobs.smoke-one.json); quick GPU path check. |
| `yarn audio:ace-step:app` | Run full Memory Dungeon app-audio batch (gameplay, UI, menu/run loops). |
| `yarn audio:ace-step:app:wav` | Same batch; `--audio-format wav` (skip FLAC round-trip). |
| `yarn audio:ace-step:app:dry` | Validate the full app-audio jobs file (no torch). |
| `yarn audio:install:ace-app-outputs` | Copy + trim renders into `assets/audio` (needs ffmpeg). |
| `yarn audio:materialize-references-from-pack` | Copy all `*.wav` from `--from` into `reference-audio/`; validate job refs. Pass **`-- --from dir`** [`--recursive`]. |
| `yarn audio:apply-reference-coverage` | Pick `reference_audio` from `referenceSourceCoverage` (first file present). **`-- --write`** to save jobs JSON. |

Interpreter override: set **`ACESTEP_PYTHON`** to an absolute path to **`python.exe`** / **`python`**.

Adjust **`run-ace-batch.mjs`** fallbacks only if your machine lacks **`py -3`** / **`python3`** on PATH.

### Ambient-only jobs (no sample files)

Text-only loops for menu/run beds (nothing in `samples/` required):

```bash
node scripts/audio-pipeline/run-ace-batch.mjs --dry-run --jobs scripts/audio-pipeline/jobs.game-ambient.example.json
```

Hybrid ambience jobs — optional beds to pair with the bundled procedural chill loop:

```bash
node scripts/audio-pipeline/run-ace-batch.mjs --dry-run --jobs scripts/audio-pipeline/jobs.hybrid-ambient.json
```

When a render is selected, trim it to a clean loop, export WAV, and replace or add files under [`src/renderer/assets/audio/music/`](../src/renderer/assets/audio/music/README.md) (see `gameplayMusic.ts` for how the menu/run loop is loaded).

### Gameplay one-shots (`jobs.sfx.example.json`)

Use [`jobs.sfx.example.json`](jobs.sfx.example.json) to batch captions for flip / match tiers / shuffle / powers / floor clear. ACE-Step outputs **long** clips — **trim** each render to a short cue in a DAW or `ffmpeg`, normalize, export **OGG**, then copy into [`src/renderer/assets/audio/sfx/`](../src/renderer/assets/audio/sfx/README.md) with filenames from [`manifest.json`](../src/renderer/assets/audio/sfx/manifest.json). Rebuild the app; missing files keep procedural `gameSfx` tones.

```bash
node scripts/audio-pipeline/run-ace-batch.mjs --dry-run --jobs scripts/audio-pipeline/jobs.sfx.example.json
```

### Full app audio (`jobs.memory-dungeon-app-audio.json`)

Use [`jobs.memory-dungeon-app-audio.json`](jobs.memory-dungeon-app-audio.json) for the 21 shipped targets: 13 gameplay one-shots, 6 UI/menu one-shots, and 2 background loops. Reference WAVs live under **`reference-audio/`** — run **`yarn audio:prep-ace-app`** for procedural stubs, or replace with licensed originals (see [`reference-audio/README.md`](reference-audio/README.md)). Raw renders still need curation: trim one-shots, normalize, and copy finals into `src/renderer/assets/audio/sfx/`, `src/renderer/assets/audio/ui/`, and `src/renderer/assets/audio/music/`.

```bash
node scripts/audio-pipeline/run-ace-batch.mjs --dry-run --jobs scripts/audio-pipeline/jobs.memory-dungeon-app-audio.json
```

After a successful batch, install trimmed WAVs into `src/renderer/assets/audio/**` (uses job `duration` as `-t`; requires **ffmpeg** on PATH):

```bash
yarn audio:install:ace-app-outputs
```

Dry-run install: `node scripts/audio-pipeline/install-ace-app-outputs.mjs --dry-run`. Override ACE output dir: `--ace-out path/to/ace-step`.

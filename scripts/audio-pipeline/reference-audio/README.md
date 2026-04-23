# Reference audio for ACE-Step (`reference_audio`)

Job file: [`../jobs.memory-dungeon-app-audio.json`](../jobs.memory-dungeon-app-audio.json) points at WAVs in **this folder**.

## How files get here

```bash
yarn audio:materialize-references
```

That copies **procedural placeholders** from `src/renderer/assets/audio/` into the exact legacy filenames ACE expects (style guides only).

Run **`yarn audio:placeholders`** first so those sources exist.

## Licensed originals

If you still have the original **`dist/assets/sounds/`** pack, copy those WAVs **here** using the **same filenames** as in the job file (overwrite the stubs). Do not commit licensed third-party WAVs unless your policy allows it — `*.wav` in this directory is gitignored by default.

See [`../RIGHTS.md`](../RIGHTS.md).

/**
 * Offline placeholder for Comfy / file-drop card plate PNGs.
 * Writes `src/renderer/assets/generated/card-plates/manifest.json` for future texture hooks.
 *
 * Optional: set `COMFY_OUTPUT_DIR` to a folder of PNGs (not read in this stub—extend as needed).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'src/renderer/assets/generated/card-plates');
mkdirSync(root, { recursive: true });

const comfyDir = process.env.COMFY_OUTPUT_DIR ?? '';

const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    comfyOutputDir: comfyDir || null,
    plates: [] as string[],
    note: 'Add PNGs via local ComfyUI export; import URLs from this folder in tileTextures when wired.'
};

writeFileSync(join(root, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${join(root, 'manifest.json')}`);

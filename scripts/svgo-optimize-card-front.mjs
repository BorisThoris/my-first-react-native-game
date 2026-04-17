/**
 * Author-time SVG shrink for `front.svg`. Default: dry-run stats only.
 * Pass `--write` to overwrite the source file (re-verify normal map alignment after).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimize } from 'svgo';

const __dirname = dirname(fileURLToPath(import.meta.url));
const input = join(__dirname, '../src/renderer/assets/textures/cards/front.svg');
const original = readFileSync(input, 'utf8');
const result = optimize(original, { path: input, multipass: true, floatPrecision: 2 });

if ('error' in result && result.error) {
    console.error(result.error);
    process.exit(1);
}

const next = result.data;
const write = process.argv.includes('--write');

if (write) {
    writeFileSync(input, next);
    console.log(`Wrote ${input} (${original.length} -> ${next.length} chars)`);
} else {
    console.log(`Dry run: ${input} would go ${original.length} -> ${next.length} chars. Pass --write to apply.`);
}

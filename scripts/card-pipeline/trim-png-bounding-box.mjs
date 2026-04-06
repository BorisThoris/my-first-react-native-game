#!/usr/bin/env node
/**
 * Crop PNG to tight bounding box around non-background pixels.
 * Background = nearly transparent OR near-white opaque (common AI export margins).
 *
 * Usage:
 *   node scripts/card-pipeline/trim-png-bounding-box.mjs <input.png> <output.png>
 *   node scripts/card-pipeline/trim-png-bounding-box.mjs a.png b.png --pad 2 --white 250 --alpha 12
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');

function parseArgs(argv) {
    const positional = [];
    let pad = 0;
    let whiteMin = 248;
    let alphaMax = 14;

    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--pad' && argv[i + 1]) {
            pad = Math.max(0, Number(argv[++i]) || 0);
        } else if (a === '--white' && argv[i + 1]) {
            whiteMin = Math.min(255, Math.max(0, Number(argv[++i]) || 248));
        } else if (a === '--alpha' && argv[i + 1]) {
            alphaMax = Math.min(255, Math.max(0, Number(argv[++i]) || 14));
        } else if (!a.startsWith('-')) {
            positional.push(a);
        }
    }

    return { positional, pad, whiteMin, alphaMax };
}

function isBackground(r, g, b, a, whiteMin, alphaMax) {
    if (a <= alphaMax) {
        return true;
    }
    return r >= whiteMin && g >= whiteMin && b >= whiteMin;
}

function trimPng(inputPath, outputPath, { pad, whiteMin, alphaMax }) {
    const absIn = resolve(root, inputPath);
    const absOut = resolve(root, outputPath);

    const buf = readFileSync(absIn);
    const png = PNG.sync.read(buf);
    const { width, height, data } = png;

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (width * y + x) << 2;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (!isBackground(r, g, b, a, whiteMin, alphaMax)) {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (maxX < 0) {
        console.error('No content pixels found (all transparent/white). Check --white / --alpha thresholds.');
        process.exit(1);
    }

    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);

    const outW = maxX - minX + 1;
    const outH = maxY - minY + 1;

    const out = new PNG({ width: outW, height: outH });

    for (let y = 0; y < outH; y++) {
        for (let x = 0; x < outW; x++) {
            const sx = minX + x;
            const sy = minY + y;
            const si = (width * sy + sx) << 2;
            const di = (outW * y + x) << 2;
            out.data[di] = data[si];
            out.data[di + 1] = data[si + 1];
            out.data[di + 2] = data[si + 2];
            out.data[di + 3] = data[si + 3];
        }
    }

    writeFileSync(absOut, PNG.sync.write(out));
    console.log(
        `Trimmed ${width}×${height} → ${outW}×${outH} (crop [${minX},${minY}]-[${maxX},${maxY}]) → ${outputPath}`
    );
}

const { positional, pad, whiteMin, alphaMax } = parseArgs(process.argv);

if (positional.length < 2) {
    console.error(`Usage: node scripts/card-pipeline/trim-png-bounding-box.mjs <input.png> <output.png> [--pad N] [--white 248] [--alpha 14]

  Treats pixels as empty if alpha ≤ --alpha OR RGB all ≥ --white (opaque canvas margins).
  --pad adds N pixels margin around the detected content box.`);
    process.exit(1);
}

trimPng(positional[0], positional[1], { pad, whiteMin, alphaMax });

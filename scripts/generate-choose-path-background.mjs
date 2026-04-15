#!/usr/bin/env node
/**
 * Procedural wide background for Choose Your Path (memory-dungeon palette).
 * For DALL·E-quality art, use instead:
 *   OPENAI_API_KEY=... node scripts/card-pipeline/image_gen.mjs --prompt "..." --out src/renderer/assets/ui/backgrounds/bg-choose-path-stage-v1.png --resolution menu-wide
 *
 * Usage: node scripts/generate-choose-path-background.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const OUT = resolve(root, 'src/renderer/assets/ui/backgrounds/bg-choose-path-stage-v1.png');

/**
 * Mid-res procedural plate — smooth gradients compress poorly as full PNG at 1536×1024 via pngjs (~2.5MB).
 * `background-size: cover` upscales cleanly. For a larger master, run `image_gen.mjs` and overwrite this file.
 */
const W = 800;
const H = 500;

function smooth(nx, ny, r, cx, cy) {
    const dx = nx - cx;
    const dy = ny - cy;
    return Math.max(0, 1 - (dx * dx + dy * dy) / (r * r));
}

/** atan2 from bottom-center: 0° = up, + = right */
function fanAngleDeg(nx, ny) {
    const ax = nx - 0.5;
    const ay = ny - 1.02;
    return (Math.atan2(ax, -ay) * 180) / Math.PI;
}

function pathForkMask(angleDeg) {
    const targets = [-36, 0, 36];
    let m = 0;
    for (const t of targets) {
        let d = Math.abs(angleDeg - t);
        if (d > 180) {
            d = 360 - d;
        }
        m = Math.max(m, Math.exp(-(d * d) / (2 * 16 * 16)));
    }
    return m;
}

function main() {
    /* RGB only — opaque image compresses much smaller than RGBA for smooth gradients */
    const png = new PNG({ width: W, height: H, colorType: 2, inputColorType: 2, inputHasAlpha: false });

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const nx = x / W;
            const ny = y / H;
            const i = (y * W + x) * 3;

            /* Base void — cooler toward top */
            let r = 6 + ny * 14;
            let g = 7 + ny * 12;
            let b = 14 + ny * 22;

            /* Atmospheric blooms (theme gold / cyan / violet) */
            const g1 = smooth(nx, ny, 0.52, 0.5, 0.34) * 95;
            r += g1 * 0.55;
            g += g1 * 0.42;
            b += g1 * 0.14;

            const c1 = smooth(nx, ny, 0.48, 0.52, 0.22) * 55;
            r += c1 * 0.22;
            g += c1 * 0.48;
            b += c1 * 0.58;

            const v1 = smooth(nx, ny, 0.36, 0.8, 0.32) * 48;
            r += v1 * 0.42;
            g += v1 * 0.22;
            b += v1 * 0.52;

            const g2 = smooth(nx, ny, 0.4, 0.14, 0.36) * 52;
            r += g2 * 0.5;
            g += g2 * 0.38;
            b += g2 * 0.12;

            /* Subtle floor plane — brighter mist low center */
            const floorGlow = smooth(nx, ny, 0.65, 0.5, 0.92) * 28 * (1 - ny * 0.5);
            r += floorGlow * 0.35;
            g += floorGlow * 0.38;
            b += floorGlow * 0.42;

            /* Three forked “paths” — slightly cooler / darker stone bands */
            const ang = fanAngleDeg(nx, ny);
            const fork = pathForkMask(ang);
            const depth = Math.pow(Math.max(0, 1 - ny), 1.35);
            const pathShade = fork * depth * 42;
            r -= pathShade * 0.35;
            g -= pathShade * 0.32;
            b -= pathShade * 0.28;

            /* Edge vignette */
            const ve = Math.hypot(nx - 0.5, ny - 0.48) * 1.12;
            const vig = Math.min(1, ve);
            const dk = 1 - vig * 0.48;
            r *= dk;
            g *= dk;
            b *= dk;

            png.data[i] = Math.min(255, Math.max(0, r | 0));
            png.data[i + 1] = Math.min(255, Math.max(0, g | 0));
            png.data[i + 2] = Math.min(255, Math.max(0, b | 0));
        }
    }

    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, PNG.sync.write(png));
    console.log('Wrote', OUT);
}

main();

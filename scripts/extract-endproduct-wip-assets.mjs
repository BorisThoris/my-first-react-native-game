/**
 * Crops ENDPRODUCT reference PNGs using docs/wip-assets/crops.json into
 * docs/wip-assets/png/, then traces each crop to SVG in docs/wip-assets/svg/
 * via imagetracerjs.
 *
 * Usage: node scripts/extract-endproduct-wip-assets.mjs [--no-svg] [--verbose] [--emit-react]
 */
/* eslint-env node */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const require = createRequire(import.meta.url);
const ImageTracer = require('imagetracerjs');

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const WIP_ROOT = join(REPO_ROOT, 'docs', 'wip-assets');
const CROPS_PATH = join(WIP_ROOT, 'crops.json');
const OUT_PNG = join(WIP_ROOT, 'png');
const OUT_SVG = join(WIP_ROOT, 'svg');

/** Smaller / faster traces; use 'detailed' locally if you need tighter paths */
const TRACE_PRESET = 'posterized2';

/** @param {import('pngjs').PNG} src */
function cropPng(src, x, y, w, h) {
    const dst = new PNG({ width: w, height: h });
    for (let row = 0; row < h; row++) {
        for (let col = 0; col < w; col++) {
            const sx = x + col;
            const sy = y + row;
            if (sx < 0 || sy < 0 || sx >= src.width || sy >= src.height) continue;
            const si = (sy * src.width + sx) << 2;
            const di = (row * w + col) << 2;
            dst.data[di] = src.data[si];
            dst.data[di + 1] = src.data[si + 1];
            dst.data[di + 2] = src.data[si + 2];
            dst.data[di + 3] = src.data[si + 3];
        }
    }
    return dst;
}

function pngToImageData(png) {
    return {
        width: png.width,
        height: png.height,
        data: new Uint8ClampedArray(png.data)
    };
}

/**
 * @param {number} total
 * @param {number} parts
 * @returns {number[]} segment widths/heights summing to total
 */
function distribute(total, parts) {
    const base = Math.floor(total / parts);
    const out = Array(parts).fill(base);
    let rem = total - base * parts;
    for (let i = parts - 1; rem > 0; rem--, i--) {
        out[i]++;
    }
    return out;
}

/** board-a-main-gameplay.svg -> BoardAMainGameplay */
function svgFileToComponentBaseName(filename) {
    return filename
        .replace(/\.svg$/i, '')
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('');
}

/** @param {import('pngjs').PNG} png */
function gridRects(png, cols, rows) {
    const widths = distribute(png.width, cols);
    const heights = distribute(png.height, rows);
    const rects = [];
    let y = 0;
    for (let r = 0; r < rows; r++) {
        let x = 0;
        const h = heights[r];
        for (let c = 0; c < cols; c++) {
            const w = widths[c];
            rects.push({ x, y, w, h });
            x += w;
        }
        y += h;
    }
    return rects;
}

function main() {
    const args = new Set(process.argv.slice(2));
    const noSvg = args.has('--no-svg');
    const verbose = args.has('--verbose');

    const manifest = JSON.parse(readFileSync(CROPS_PATH, 'utf8'));

    if (existsSync(OUT_PNG)) rmSync(OUT_PNG, { recursive: true });
    if (existsSync(OUT_SVG)) rmSync(OUT_SVG, { recursive: true });
    mkdirSync(OUT_PNG, { recursive: true });
    mkdirSync(OUT_SVG, { recursive: true });

    let totalPng = 0;
    const index = { generatedAt: new Date().toISOString(), png: [], svg: [] };

    for (const source of manifest.sources) {
        const { file, slug, layout } = source;
        const path = join(REPO_ROOT, 'docs', file);
        const buf = readFileSync(path);
        const png = PNG.sync.read(buf);

        /** @type {{ x: number, y: number, w: number, h: number, id: string }[]} */
        let jobs = [];

        if (layout.type === 'grid') {
            const rects = gridRects(png, layout.cols, layout.rows);
            const labels = layout.labels || [];
            rects.forEach((r, i) => {
                const label = labels[i] || `cell-${i + 1}`;
                jobs.push({ ...r, id: label });
            });
        } else if (layout.type === 'rects') {
            jobs = layout.rects.map((r) => ({ ...r, id: r.id }));
        } else {
            console.error('Unknown layout type', layout.type);
            process.exit(1);
        }

        const pad = 1;
        for (const job of jobs) {
            const x = Math.max(0, job.x + pad);
            const y = Math.max(0, job.y + pad);
            const w = Math.min(png.width - x, job.w - 2 * pad);
            const h = Math.min(png.height - y, job.h - 2 * pad);
            if (w < 8 || h < 8) {
                console.warn('Skip tiny crop', slug, job.id);
                continue;
            }
            const cropped = cropPng(png, x, y, w, h);
            const safeId = job.id.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
            const name = `${slug}-${safeId}.png`;
            const pngPath = join(OUT_PNG, name);
            writeFileSync(pngPath, PNG.sync.write(cropped));
            totalPng++;
            index.png.push({ file: `png/${name}`, source: file, id: job.id });

            if (verbose) console.log('wrote', name, w, h);

            if (!noSvg) {
                const svgStr = ImageTracer.imagedataToSVG(pngToImageData(cropped), TRACE_PRESET);
                const svgName = name.replace(/\.png$/, '.svg');
                const svgPath = join(OUT_SVG, svgName);
                writeFileSync(svgPath, svgStr);
                index.svg.push({ file: `svg/${svgName}`, png: `png/${name}`, id: job.id });
            }
        }
    }

    writeFileSync(join(WIP_ROOT, 'index.json'), JSON.stringify(index, null, 2));
    console.log(`Wrote ${totalPng} PNG crops to docs/wip-assets/png/`);
    if (!noSvg) {
        console.log(`Wrote SVG traces to docs/wip-assets/svg/ (preset: ${TRACE_PRESET})`);
    }
    console.log('Wrote docs/wip-assets/index.json');

    if (args.has('--emit-react') && !noSvg) {
        const pubSvg = join(REPO_ROOT, 'public', 'wip-assets', 'svg');
        mkdirSync(pubSvg, { recursive: true });
        for (const name of readdirSync(OUT_SVG)) {
            if (!name.endsWith('.svg')) continue;
            copyFileSync(join(OUT_SVG, name), join(pubSvg, name));
        }
        const ids = index.svg.map((s) => {
            const file = s.file.replace(/^svg\//, '');
            return { file, pascal: svgFileToComponentBaseName(file) };
        });
        const compDir = join(REPO_ROOT, 'src', 'renderer', 'components', 'wip');
        mkdirSync(compDir, { recursive: true });
        const tsx = `/* Auto-generated by scripts/extract-endproduct-wip-assets.mjs --emit-react */
import type { ImgHTMLAttributes } from 'react';

function wipUrl(name: string) {
  return \`\${import.meta.env.BASE_URL}wip-assets/svg/\${name}\`;
}

${ids
    .map(
        (i) => `export function Wip${i.pascal}(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={wipUrl(${JSON.stringify(i.file)})} alt="" {...props} />;
}
`
    )
    .join('\n')}

export const wipEndproductSvgFiles = ${JSON.stringify(
            Object.fromEntries(ids.map((i) => [i.file.replace(/\.svg$/, ''), i.file]))
        )} as const;
`;
        writeFileSync(join(compDir, 'EndproductWipSvgs.tsx'), tsx);
        console.log('Copied SVG to public/wip-assets/svg/ and wrote src/renderer/components/wip/EndproductWipSvgs.tsx');
    } else if (args.has('--emit-react') && noSvg) {
        console.warn('--emit-react ignored when used with --no-svg');
    }
}

main();

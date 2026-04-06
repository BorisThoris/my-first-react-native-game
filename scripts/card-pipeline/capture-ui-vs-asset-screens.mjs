#!/usr/bin/env node
/**
 * Saves comparison screenshots: in-game board vs full decoded card PNGs.
 * Requires dev server: http://127.0.0.1:5173
 *
 *   node scripts/card-pipeline/capture-ui-vs-asset-screens.mjs
 */
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const outDir = path.join(root, 'docs', 'wip-assets', 'validation');

async function main() {
    mkdirSync(outDir, { recursive: true });
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Play' }).click();
    await page.getByRole('button', { name: 'Classic Run Procedural floors' }).click();
    await page.waitForTimeout(800);
    try {
        await page.getByRole('button', { name: 'Got it' }).click({ timeout: 5000, force: true });
    } catch {
        /* no FTUE bar */
    }

    await page.screenshot({ path: path.join(outDir, 'compare-01-game-board-hidden.png'), fullPage: true });

    await page.getByRole('button', { name: /hidden tile, row 1, column 1/i }).click({ force: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'compare-02-game-board-one-flipped.png'), fullPage: true });

    const backPath = path.join(root, 'src/renderer/assets/textures/cards/back.svg');
    const facePath = path.join(root, 'src/renderer/assets/textures/cards/front.svg');
    const backB64 = readFileSync(backPath).toString('base64');
    const faceB64 = readFileSync(facePath).toString('base64');

    await page.setViewportSize({ width: 1680, height: 2400 });
    await page.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
      body{margin:0;background:#141018;font-family:system-ui;color:#e8e0d5;padding:20px;}
      h1{font-size:15px;margin:0 0 12px;letter-spacing:0.08em;text-transform:uppercase}
      p{font-size:13px;line-height:1.5;max-width:900px;opacity:0.85;margin:0 0 20px}
      h2{font-size:12px;margin:28px 0 10px;letter-spacing:0.1em;text-transform:uppercase;opacity:0.75}
      img{display:block;max-width:min(1400px,100%);height:auto;border:1px solid rgba(255,200,120,0.3);background:#000}
    </style></head><body>
      <h1>Source assets (full file — no game UV / CSS inset)</h1>
      <p>Game uses <strong>contain</strong> (full image, letterbox if needed) on WebGL + DOM; normalize script pads API output to exact 0.74:1.08. <code>.cardBack { inset: 3% 17% }</code> still frames the panel inside each tile.</p>
      <h2>back.svg</h2>
      <img alt="back" src="data:image/svg+xml;base64,${backB64}"/>
      <h2>front.svg</h2>
      <img alt="face" src="data:image/svg+xml;base64,${faceB64}"/>
    </body></html>`);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, 'compare-03-full-asset-files.png'), fullPage: true });

    await browser.close();
    console.log('Wrote screenshots under', outDir);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

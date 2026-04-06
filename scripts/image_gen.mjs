#!/usr/bin/env node
/**
 * OpenAI Images API helper for batch asset generation.
 * Requires OPENAI_API_KEY. Writes PNG (base64 response) or downloads URL response.
 *
 * Usage:
 *   node scripts/image_gen.mjs --prompt "..." --out src/renderer/assets/ui/backgrounds/foo.png
 *   node scripts/image_gen.mjs --prompt "..." --out ./out.png --resolution card
 *   node scripts/image_gen.mjs --prompt "..." --out ./out.png --resolution 1024x1024
 *   node scripts/image_gen.mjs --model gpt-image-1 --size 1536x1024 --prompt "..." --out ./out.png
 *   node scripts/image_gen.mjs --list-resolutions
 *
 * `--size` is passed through to the API. If you pass both `--size` and `--resolution`, `--size` wins.
 * Presets are common OpenAI image sizes; confirm current model docs if a request fails.
 *
 * @see docs/new_design/ASSET_AND_ART_PIPELINE.md
 */

import { createWriteStream, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import {
    CARD_PLANE_ASPECT,
    OPENAI_GPT_IMAGE_CARD_PLANE_SIZE,
    idealCardTexturePixels
} from './cardTextureConstants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const CARD_PLANE_PRESET_KEYS = new Set(['card-plane', 'card-plane-hq']);

/** Named sizes for repeatable art passes (values must match the active model’s allowed `size` strings). */
const RESOLUTION_PRESETS = {
    /** Square — icons / legacy; not the in-game card quad aspect. */
    card: '1024x1024',
    'card-square': '1024x1024',
    square: '1024x1024',
    'square-1k': '1024x1024',
    /**
     * Portrait tile art — matches WebGL card plane (~0.685) as closely as GPT Image allows (1024×1536 ≈ 0.667).
     * Default `--quality high`. Normalize to exact pixels: `scripts/normalize-card-texture.ps1`.
     */
    'card-plane': OPENAI_GPT_IMAGE_CARD_PLANE_SIZE,
    'card-plane-hq': OPENAI_GPT_IMAGE_CARD_PLANE_SIZE,
    'menu-wide': '1536x1024',
    wide: '1536x1024',
    default: '1536x1024',
    /** GPT Image API landscape (not card-plane). */
    landscape: '1536x1024',
    /** GPT Image API portrait (taller than card-plane preset uses same token). */
    portrait: '1024x1536'
};

function resolveResolutionArg(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    if (/^\d+x\d+$/i.test(trimmed)) {
        return trimmed.toLowerCase();
    }
    const key = trimmed.toLowerCase();
    if (RESOLUTION_PRESETS[key]) {
        return RESOLUTION_PRESETS[key];
    }
    return null;
}

function printResolutionHelp() {
    const ideal = idealCardTexturePixels(2048);
    console.log(
        `Card plane aspect (game mesh): width/height = ${CARD_PLANE_ASPECT.toFixed(4)} (see tileShatter.ts / cardTextureConstants.mjs).`
    );
    console.log(`Ideal shipped PNG size at long edge 2048: ${ideal.label} (use normalize-card-texture.ps1).\n`);
    console.log('Named --resolution presets:');
    for (const [name, size] of Object.entries(RESOLUTION_PRESETS)) {
        console.log(`  ${name}\t→ ${size}`);
    }
    console.log('\nOr pass an explicit WxH size the API accepts, e.g. --resolution 1024x1024');
    console.log('\ncard-plane uses GPT Image portrait 1024×1536 + default quality high (closest API aspect to the card quad).');
}

function parseArgs(argv) {
    const out = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--prompt' && argv[i + 1]) {
            out.prompt = argv[++i];
        } else if (a === '--out' && argv[i + 1]) {
            out.out = resolve(root, argv[++i]);
        } else if (a === '--model' && argv[i + 1]) {
            out.model = argv[++i];
        } else if (a === '--size' && argv[i + 1]) {
            out.size = argv[++i];
        } else if (a === '--resolution' && argv[i + 1]) {
            out.resolution = argv[++i];
        } else if (a === '--list-resolutions') {
            out.listResolutions = true;
        } else if (a === '--quality' && argv[i + 1]) {
            out.quality = argv[++i];
        }
    }
    return out;
}

function modelSupportsImageQuality(model) {
    return typeof model === 'string' && model.startsWith('gpt-image');
}

function resolveEffectiveQuality(qualityArg, resolutionRaw) {
    if (qualityArg) {
        return qualityArg;
    }
    const key = resolutionRaw?.trim().toLowerCase();
    if (key && CARD_PLANE_PRESET_KEYS.has(key)) {
        return 'high';
    }
    return undefined;
}

async function main() {
    const parsed = parseArgs(process.argv);
    const {
        prompt,
        out,
        model = 'gpt-image-1',
        size: sizeArg,
        resolution: resolutionArg,
        listResolutions,
        quality: qualityArg
    } = parsed;

    if (listResolutions) {
        printResolutionHelp();
        process.exit(0);
    }

    const fromPreset = resolutionArg ? resolveResolutionArg(resolutionArg) : null;
    if (resolutionArg && !fromPreset) {
        console.error(`Unknown --resolution "${resolutionArg}". Try --list-resolutions.`);
        process.exit(1);
    }

    const size = sizeArg ?? fromPreset ?? '1536x1024';

    if (!prompt || !out) {
        console.error(`Usage: node scripts/image_gen.mjs --prompt "..." --out <path-relative-to-repo> [--model gpt-image-1] [--resolution <preset|WxH>] [--size WxH] [--quality low|medium|high|auto]

  --resolution   Preset name (e.g. card-plane, menu-wide) or explicit WxH for the API.
  --size         Same as API size; overrides --resolution when both are set.
  --quality      gpt-image-* only (low|medium|high|auto). card-plane defaults to high.
  --list-resolutions   Print preset table + card aspect notes.

Environment: OPENAI_API_KEY required.`);
        process.exit(1);
    }

    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) {
        console.error('Missing OPENAI_API_KEY. Set it and re-run.');
        process.exit(1);
    }

    mkdirSync(dirname(out), { recursive: true });

    const effectiveQuality = resolveEffectiveQuality(qualityArg, resolutionArg);
    if (effectiveQuality && !modelSupportsImageQuality(model)) {
        console.warn(`Ignoring --quality for model ${model} (gpt-image models only).`);
    }

    console.log(`Requesting image size: ${size} (model ${model})${effectiveQuality ? `, quality ${effectiveQuality}` : ''}`);

    const payload = {
        model,
        prompt,
        n: 1,
        size,
        response_format: 'b64_json'
    };
    if (effectiveQuality && modelSupportsImageQuality(model)) {
        payload.quality = effectiveQuality;
    }

    const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('OpenAI error', res.status, text);
        process.exit(1);
    }

    const body = await res.json();
    const item = body.data?.[0];
    const b64 = item?.b64_json;
    const url = item?.url;

    if (b64) {
        const { writeFileSync } = await import('node:fs');
        writeFileSync(out, Buffer.from(b64, 'base64'));
        console.log('Wrote', out);
        if (resolutionArg && CARD_PLANE_PRESET_KEYS.has(resolutionArg.trim().toLowerCase())) {
            const ideal = idealCardTexturePixels(2048);
            console.log(
                `Tip: exact card-plane pixels ${ideal.label}: .\\scripts\\normalize-card-texture.ps1 -InputPath <api.png> -OutputPath <out.png> -LongEdge 2048`
            );
        }
        return;
    }

    if (url) {
        const imgRes = await fetch(url);
        if (!imgRes.ok) {
            console.error('Failed to download image URL');
            process.exit(1);
        }
        await pipeline(imgRes.body, createWriteStream(out));
        console.log('Wrote', out);
        return;
    }

    console.error('Unexpected response', JSON.stringify(body).slice(0, 500));
    process.exit(1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

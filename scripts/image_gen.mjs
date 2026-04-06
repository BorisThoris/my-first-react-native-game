#!/usr/bin/env node
/**
 * OpenAI Images API helper for batch asset generation.
 * Requires OPENAI_API_KEY. Writes PNG (base64 response) or downloads URL response.
 *
 * Usage:
 *   node scripts/image_gen.mjs --prompt "..." --out src/renderer/assets/ui/backgrounds/foo.png
 *   node scripts/image_gen.mjs --model gpt-image-1 --size 1536x1024 --prompt "..." --out ./out.png
 *
 * @see docs/new_design/ASSET_AND_ART_PIPELINE.md
 */

import { createWriteStream, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

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
        }
    }
    return out;
}

async function main() {
    const { prompt, out, model = 'gpt-image-1', size = '1536x1024' } = parseArgs(process.argv);

    if (!prompt || !out) {
        console.error(`Usage: node scripts/image_gen.mjs --prompt "..." --out <path-relative-to-repo> [--model gpt-image-1] [--size 1024x1024]

Environment: OPENAI_API_KEY required.`);
        process.exit(1);
    }

    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) {
        console.error('Missing OPENAI_API_KEY. Set it and re-run.');
        process.exit(1);
    }

    mkdirSync(dirname(out), { recursive: true });

    const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            prompt,
            n: 1,
            size,
            response_format: 'b64_json'
        })
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

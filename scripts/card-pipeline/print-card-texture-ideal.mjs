#!/usr/bin/env node
import {
    CARD_PLANE_ASPECT,
    OPENAI_GPT_IMAGE_CARD_PLANE_SIZE,
    idealCardTexturePixels
} from './cardTextureConstants.mjs';

const argv = process.argv.slice(2);
const wantAiBrief = argv.includes('--ai-brief');
const numericArg = argv.find((a) => /^\d+$/.test(a));
const le = Number(numericArg) || 2048;
const ideal = idealCardTexturePixels(le);

console.log('Card plane width:height = 0.74 : 1.08');
console.log('Aspect width/height:', CARD_PLANE_ASPECT.toFixed(6));
console.log('GPT Image portrait preset for generation:', OPENAI_GPT_IMAGE_CARD_PLANE_SIZE);
console.log(`Ideal PNG dimensions (long edge ${le}):`, ideal);

if (wantAiBrief) {
    console.log('\n--- Copy for image-model prompts (resolution + aspect) ---\n');
    console.log(
        `Target final asset: ${ideal.label} pixels (width × height), aspect width/height = ${CARD_PLANE_ASPECT.toFixed(6)} (0.74 : 1.08).`
    );
    console.log(
        `If the API only allows OpenAI GPT Image portrait: generate at ${OPENAI_GPT_IMAGE_CARD_PLANE_SIZE}, then normalize with scripts/card-pipeline/normalize-card-texture.ps1 -LongEdge ${le}.`
    );
    console.log(
        'Composition: keep important ornament at least 8–10% inset from every edge; outer band soft vignette only. No text, logos, or faces.'
    );
    console.log('\nFull style + prompt templates: docs/new_design/CARD_TEXTURE_AI_BRIEF.md\n');
}

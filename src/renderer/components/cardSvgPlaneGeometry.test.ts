import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    CARD_BACK_SVG_LAYER_NAMES,
    loadSharedCardBackSvgLayerGeometries
} from './cardSvgPlaneGeometry';

const cardBackSvg = readFileSync(
    resolve(process.cwd(), 'src/renderer/assets/textures/cards/authored-card-back.svg'),
    'utf8'
);
const layeredFixtureSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 1080">
${CARD_BACK_SVG_LAYER_NAMES.map(
    (name, index) =>
        `  <g id="${name}"><rect x="${40 + index * 6}" y="${40 + index * 6}" width="${80 + index}" height="${80 + index}" fill="#c3954f"/></g>`
).join('\n')}
</svg>`;

describe('cardSvgPlaneGeometry', () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    it('loads authored card back SVG as named animation layers', async () => {
        for (const name of CARD_BACK_SVG_LAYER_NAMES) {
            expect(cardBackSvg).toContain(`id="${name}"`);
        }

        const styleProto = window.CSSStyleDeclaration.prototype as CSSStyleDeclaration & Record<string, unknown>;
        for (const name of [
            'clip-path',
            'fill',
            'fill-opacity',
            'fill-rule',
            'opacity',
            'stroke',
            'stroke-dasharray',
            'stroke-dashoffset',
            'stroke-linecap',
            'stroke-linejoin',
            'stroke-miterlimit',
            'stroke-opacity',
            'stroke-width',
            'visibility'
        ]) {
            Object.defineProperty(styleProto, name, {
                configurable: true,
                get: () => ''
            });
        }

        globalThis.fetch = vi.fn(async () =>
            new Response(layeredFixtureSvg, {
                headers: { 'content-length': String(layeredFixtureSvg.length) },
                status: 200
            })
        ) as typeof fetch;

        const layers = await loadSharedCardBackSvgLayerGeometries('test-card-back-layers.svg');

        expect(layers?.map((layer) => layer.name)).toEqual([...CARD_BACK_SVG_LAYER_NAMES]);
        for (const layer of layers ?? []) {
            expect(layer.geometry.attributes.position.count).toBeGreaterThan(0);
            layer.geometry.dispose();
        }
    });
});

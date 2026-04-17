import opentype from 'opentype.js';
import type { GraphicsQualityPreset } from '../../shared/contracts';
import { FEATURE_CARD_OPENTYPE_GLYPHS } from '../../shared/feature-flags';

let cachedFont: opentype.Font | null = null;
let loadStarted = false;
const listeners = new Set<() => void>();

export const subscribeCardRankFontLoaded = (fn: () => void): (() => void) => {
    listeners.add(fn);
    return () => {
        listeners.delete(fn);
    };
};

const notify = (): void => {
    for (const fn of listeners) {
        fn();
    }
};

/**
 * Preloads Source Sans 3 800 for vector rank drawing when enabled + high quality.
 * Safe to call multiple times; notifies subscribers once parsed.
 */
export const preloadCardRankOpentypeFont = (graphicsQuality: GraphicsQualityPreset): void => {
    if (!FEATURE_CARD_OPENTYPE_GLYPHS || graphicsQuality !== 'high' || loadStarted) {
        return;
    }
    loadStarted = true;
    void (async () => {
        try {
            const { default: fontUrl } = await import(
                '@fontsource/source-sans-3/files/source-sans-3-latin-800-normal.woff2?url'
            );
            const res = await fetch(fontUrl);
            if (!res.ok) {
                return;
            }
            const buf = await res.arrayBuffer();
            cachedFont = opentype.parse(buf);
            notify();
        } catch {
            cachedFont = null;
        }
    })();
};

/**
 * Draws centered text using opentype path when font is ready. `yCenter` matches canvas `textBaseline: middle`.
 * @returns true when drawn with opentype
 */
export const tryDrawOpentypeCenteredText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    yCenter: number,
    fontSize: number,
    fill: string,
    stroke: string,
    lineWidth: number
): boolean => {
    const font = cachedFont;
    if (!font) {
        return false;
    }
    try {
        const yBaseline = yCenter + fontSize * 0.32;
        const probe = font.getPath(text, 0, yBaseline, fontSize);
        const bb = probe.getBoundingBox();
        const x0 = x - (bb.x1 + bb.x2) * 0.5;
        const path = font.getPath(text, x0, yBaseline, fontSize);

        ctx.save();
        ctx.lineJoin = 'round';
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = stroke;
        ctx.fillStyle = fill;
        path.draw(ctx);
        ctx.restore();
        return true;
    } catch {
        return false;
    }
};

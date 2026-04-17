import type { OverlayDrawTier } from '../overlayDrawTier';

const hsla = (h: number, s: number, l: number, a: number): string =>
    `hsla(${Math.round(((h % 360) + 360) % 360)}, ${s}%, ${l}%, ${a})`;

export type NoiseStrength = 0 | 1 | 2;

/**
 * Low-res grid noise blended over existing fills (soft-light). Tier scales grid density; strength scales alpha.
 */
export const paintSoftNoiseOverlay = (
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    pw: number,
    ph: number,
    tier: OverlayDrawTier,
    strength: NoiseStrength,
    hueAnchor: number,
    next01: () => number
): void => {
    if (strength === 0) {
        return;
    }

    const grid =
        tier === 'minimal' ? 10 : tier === 'standard' ? 16 : 24;
    const alphaBase = strength === 1 ? 0.1 : 0.18;
    const cellW = pw / grid;
    const cellH = ph / grid;

    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = alphaBase;

    for (let gy = 0; gy < grid; gy++) {
        for (let gx = 0; gx < grid; gx++) {
            const v = next01();
            const hue = hueAnchor + (v - 0.5) * 48;
            const light = 38 + v * 42;
            ctx.fillStyle = hsla(hue, 32 + v * 22, light, 1);
            ctx.fillRect(px + gx * cellW, py + gy * cellH, cellW + 1, cellH + 1);
        }
    }

    ctx.restore();
};

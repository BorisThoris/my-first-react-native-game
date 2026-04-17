/**
 * Deterministic card-face motif: geometric shape + numeric rank.
 * SVG output is the canonical spec; canvas overlay in tileTextures mirrors the same layout.
 */
import type { Tile } from '../../shared/contracts';
import { getCardFaceOverlayColors, type ProgrammaticOverlayVariant } from './cardFaceOverlayPalette';
import type { OverlayDrawTier } from './overlayDrawTier';
import { FEATURE_CARD_OPENTYPE_GLYPHS } from '../../shared/feature-flags';
import { tryDrawOpentypeCenteredText } from './opentypeCardRankFont';
import { escapeXml } from './svgMarkup';

export type { ProgrammaticOverlayVariant };

export const PROGRAMMATIC_CARD_VIEWBOX = { w: 400, h: 560 } as const;

/** Layout tuned to sit in the authored `front.svg` inner panel (safe zone). */
const LAYOUT = {
    frame: { x: 24, y: 28, w: 352, h: 504, rx: 28 },
    shape: { cx: 200, cy: 196, scale: 1 },
    /** Rank text baseline area */
    number: { x: 200, y: 432, fontSize: 56 }
} as const;

const SHAPE_COUNT = 5;

/** True when we draw shape+number motif (digits-only symbols like "01".."30"). */
export const tileUsesProgrammaticFaceMotif = (tile: Tile): boolean => /^\d{1,4}$/.test(tile.symbol.trim());

const shapeKind = (tile: Tile): number => {
    if (tile.atomicVariant != null) {
        return tile.atomicVariant % SHAPE_COUNT;
    }
    return Math.abs(hashPairKey(tile.pairKey)) % SHAPE_COUNT;
};

function hashPairKey(pairKey: string): number {
    let h = 0;
    for (let i = 0; i < pairKey.length; i++) {
        h = (h * 31 + pairKey.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

function noiseSeed(tile: Tile, variant: ProgrammaticOverlayVariant): number {
    return Math.abs(hashPairKey(`${tile.id}|${tile.pairKey}|${variant}`)) % 500;
}

/** SVG path / primitive for sigil body (stroke on main layer; fill uses gradient url). */
const shapeSvgElements = (
    kind: number,
    cx: number,
    cy: number,
    s: number,
    stroke: string,
    highlightStroke: string,
    includeHighlight: boolean
): string => {
    const k = ((kind % SHAPE_COUNT) + SHAPE_COUNT) % SHAPE_COUNT;
    const sw = 3.2;
    const hi = `fill="none" stroke="${highlightStroke}" stroke-width="1.35" stroke-linejoin="round" opacity="0.9"`;

    const tail = includeHighlight;

    switch (k) {
        case 0: {
            const core = `<circle fill="url(#pgSigil)" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" cx="${cx}" cy="${cy}" r="${62 * s}" />`;
            return tail ? `${core}\n  <circle ${hi} cx="${cx}" cy="${cy}" r="${62 * s}" />` : core;
        }
        case 1: {
            const w = 112 * s;
            const h = 112 * s;
            const x = cx - w / 2;
            const y = cy - h / 2;
            const r = 14 * s;
            const core = `<rect fill="url(#pgSigil)" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" />`;
            return tail ? `${core}\n  <rect ${hi} x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" />` : core;
        }
        case 2: {
            const r = 74 * s;
            const pts = `${cx},${cy - r} ${cx + r * 0.866},${cy + r * 0.5} ${cx - r * 0.866},${cy + r * 0.5}`;
            const core = `<polygon fill="url(#pgSigil)" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" points="${pts}" />`;
            return tail ? `${core}\n  <polygon ${hi} points="${pts}" />` : core;
        }
        case 3: {
            const r = 52 * s;
            const pts = `${cx},${cy - r * 1.35} ${cx + r * 1.35},${cy} ${cx},${cy + r * 1.35} ${cx - r * 1.35},${cy}`;
            const core = `<polygon fill="url(#pgSigil)" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" points="${pts}" />`;
            return tail ? `${core}\n  <polygon ${hi} points="${pts}" />` : core;
        }
        default: {
            const n = 6;
            const r = 64 * s;
            const pts: string[] = [];
            for (let i = 0; i < n; i++) {
                const a = (Math.PI / 6 + (i * 2 * Math.PI) / n) - Math.PI / 2;
                pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
            }
            const p = pts.join(' ');
            const core = `<polygon fill="url(#pgSigil)" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" points="${p}" />`;
            return tail ? `${core}\n  <polygon ${hi} points="${p}" />` : core;
        }
    }
};

/**
 * Full SVG document for export, tests, or future rasterization — deterministic from tile + variant.
 * @param tier `full` matches golden tests; lighter tiers omit grain / emboss for exports.
 */
export const buildProgrammaticCardFaceSvg = (
    tile: Tile,
    variant: ProgrammaticOverlayVariant,
    tier: OverlayDrawTier = 'full'
): string => {
    const { w, h } = PROGRAMMATIC_CARD_VIEWBOX;
    const { frame, shape, number: num } = LAYOUT;
    const c = getCardFaceOverlayColors(variant);
    const k = shapeKind(tile);
    const inner = shapeSvgElements(
        k,
        shape.cx,
        shape.cy,
        shape.scale,
        c.sigilStroke,
        c.sigilHighlight,
        tier !== 'minimal'
    );
    const rankText = escapeXml(tile.symbol);
    const grainSeed = noiseSeed(tile, variant);
    const fx = frame.x;
    const fy = frame.y;
    const fw = frame.w;
    const fh = frame.h;

    const grainDef =
        tier === 'full'
            ? `<filter id="pgGrain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" seed="${grainSeed}" result="n"/>
      <feColorMatrix in="n" type="matrix"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0" result="g"/>
    </filter>`
            : '';
    const rankFilterDef =
        tier === 'full' || tier === 'standard'
            ? `<filter id="pgRank" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="2.2" stdDeviation="1.4" flood-color="${c.rankShadow}" flood-opacity="1"/>
    </filter>`
            : '';
    const innerRim =
        tier === 'minimal'
            ? ''
            : `  <rect x="${fx + 5}" y="${fy + 5}" width="${fw - 10}" height="${fh - 10}" rx="${frame.rx * 0.72}" ry="${frame.rx * 0.72}"
    fill="none" stroke="${c.frameInnerRim}" stroke-width="1.1" opacity="0.95"/>
`;
    const grainRect =
        tier === 'full'
            ? `  <rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff" filter="url(#pgGrain)" opacity="${Math.min(0.22, c.grainAlpha * 4)}" pointer-events="none"/>
`
            : '';
    const rankShadowText =
        tier === 'full'
            ? `  <text x="${num.x + 1.2}" y="${num.y + 2}" text-anchor="middle" dominant-baseline="middle"
    font-family="Source Sans 3, Trebuchet MS, Arial, sans-serif" font-weight="800" font-size="${num.fontSize}"
    fill="${c.rankShadow}" opacity="0.55">${rankText}</text>
`
            : '';
    const rankMainAttrs =
        tier === 'full' || tier === 'standard'
            ? ` filter="url(#pgRank)"`
            : '';
    const rankHighlightText =
        tier === 'full'
            ? `  <text x="${num.x}" y="${num.y - 0.6}" text-anchor="middle" dominant-baseline="middle"
    font-family="Source Sans 3, Trebuchet MS, Arial, sans-serif" font-weight="800" font-size="${num.fontSize}"
    fill="${c.rankFill}" opacity="0.42">${rankText}</text>
`
            : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="pgFrame" gradientUnits="userSpaceOnUse" x1="${fx}" y1="${fy}" x2="${fx}" y2="${fy + fh}">
      <stop offset="0" stop-color="${c.frameFillTop}"/>
      <stop offset="0.52" stop-color="${c.frameFillBottom}"/>
      <stop offset="1" stop-color="${c.frameFillBottom}"/>
    </linearGradient>
    <linearGradient id="pgSigil" gradientUnits="userSpaceOnUse" x1="${shape.cx - 96}" y1="${shape.cy - 96}" x2="${shape.cx + 96}" y2="${shape.cy + 96}">
      <stop offset="0" stop-color="${c.sigilFillDark}"/>
      <stop offset="0.5" stop-color="${c.sigilFillLight}"/>
      <stop offset="1" stop-color="${c.sigilFillDark}"/>
    </linearGradient>
    <radialGradient id="pgVin" gradientUnits="userSpaceOnUse" cx="${shape.cx}" cy="${shape.cy * 0.92}" r="260">
      <stop offset="0.25" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="${c.vignette}"/>
    </radialGradient>
${grainDef}
${rankFilterDef}
  </defs>
  <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${frame.rx}" ry="${frame.rx}"
    fill="url(#pgFrame)" stroke="${c.frameStroke}" stroke-width="3"/>
${innerRim}
  ${inner}
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#pgVin)" pointer-events="none"/>
${grainRect}${rankShadowText}  <text x="${num.x}" y="${num.y}" text-anchor="middle" dominant-baseline="middle"${rankMainAttrs}
    font-family="Source Sans 3, Trebuchet MS, Arial, sans-serif" font-weight="800" font-size="${num.fontSize}"
    fill="${c.rankFillMid}" stroke="${c.rankStroke}" stroke-width="2.4" paint-order="stroke fill">${rankText}</text>
${rankHighlightText}</svg>`;
};

const createOverlayRng = (tile: Tile, variant: ProgrammaticOverlayVariant): (() => number) => {
    let s = noiseSeed(tile, variant) + 1;
    return (): number => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
};

const drawFilmGrain = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    count: number,
    rgb: string,
    alpha: number,
    rng: () => number
): void => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgb(${rgb})`;
    for (let i = 0; i < count; i += 1) {
        const x = rng() * width;
        const y = rng() * height;
        const z = 0.35 + rng() * 1.1;
        ctx.fillRect(x, y, z, z);
    }
    ctx.restore();
};

/** Canvas overlay scaled to target bitmap (same visual intent as {@link buildProgrammaticCardFaceSvg}). */
export const drawProgrammaticCardFaceOverlay = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    tile: Tile,
    variant: ProgrammaticOverlayVariant,
    tier: OverlayDrawTier = 'full'
): void => {
    const { width, height } = canvas;
    const { w: vbW, h: vbH } = PROGRAMMATIC_CARD_VIEWBOX;
    const { frame, shape, number: num } = LAYOUT;
    const c = getCardFaceOverlayColors(variant);
    const k = shapeKind(tile);
    const rng = createOverlayRng(tile, variant);
    const grainMul = tier === 'full' ? 1 : tier === 'standard' ? 0.55 : 0;

    context.clearRect(0, 0, width, height);
    context.save();
    context.scale(width / vbW, height / vbH);

    const { x: fx, y: fy, w: fw, h: fh, rx } = frame;

    const frameGrad = context.createLinearGradient(fx, fy, fx, fy + fh);
    frameGrad.addColorStop(0, c.frameFillTop);
    frameGrad.addColorStop(0.52, c.frameFillBottom);
    frameGrad.addColorStop(1, c.frameFillBottom);

    context.lineJoin = 'round';
    context.lineWidth = 3;
    context.fillStyle = frameGrad;
    context.strokeStyle = c.frameStroke;
    roundRectPath(context, fx, fy, fw, fh, rx);
    context.fill();
    context.stroke();

    if (tier !== 'minimal') {
        context.save();
        context.strokeStyle = c.frameInnerRim;
        context.lineWidth = 1.1;
        roundRectPath(context, fx + 5, fy + 5, fw - 10, fh - 10, rx * 0.72);
        context.stroke();
        context.restore();
    }

    const sx1 = shape.cx - 96;
    const sy1 = shape.cy - 96;
    const sx2 = shape.cx + 96;
    const sy2 = shape.cy + 96;
    const sigilGrad = context.createLinearGradient(sx1, sy1, sx2, sy2);
    sigilGrad.addColorStop(0, c.sigilFillDark);
    sigilGrad.addColorStop(0.5, c.sigilFillLight);
    sigilGrad.addColorStop(1, c.sigilFillDark);

    context.fillStyle = sigilGrad;
    context.strokeStyle = c.sigilStroke;
    context.lineWidth = 3.2;
    drawShapeKind(context, k, shape.cx, shape.cy, shape.scale);
    context.fill();
    context.stroke();

    if (tier !== 'minimal') {
        context.strokeStyle = c.sigilHighlight;
        context.lineWidth = 1.35;
        context.globalAlpha = 0.9;
        drawShapeKind(context, k, shape.cx, shape.cy, shape.scale);
        context.stroke();
        context.globalAlpha = 1;
    }

    const vin = context.createRadialGradient(shape.cx, shape.cy * 0.92, 40, shape.cx, shape.cy * 0.92, 260);
    vin.addColorStop(0.25, 'rgba(0,0,0,0)');
    vin.addColorStop(1, c.vignette);
    context.fillStyle = vin;
    context.beginPath();
    context.rect(0, 0, vbW, vbH);
    context.fill();

    if (grainMul > 0) {
        drawFilmGrain(context, vbW, vbH, Math.round(110 * grainMul), c.grainRgb, c.grainAlpha * 0.55, rng);
    }

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const ctxLs = context as CanvasRenderingContext2D & { letterSpacing?: string };
    const prevLs = ctxLs.letterSpacing;
    if ('letterSpacing' in context) {
        ctxLs.letterSpacing = tile.symbol.length >= 3 ? '0.07em' : '0.028em';
    }
    context.font = `800 ${num.fontSize}px "Source Sans 3", "Arial", sans-serif`;

    const useOt =
        tier === 'full' &&
        FEATURE_CARD_OPENTYPE_GLYPHS &&
        tryDrawOpentypeCenteredText(context, tile.symbol, num.x, num.y, num.fontSize, c.rankFillMid, c.rankStroke, 2.4);

    if (!useOt) {
        if (tier === 'full') {
            context.fillStyle = c.rankShadow;
            context.globalAlpha = 0.55;
            context.fillText(tile.symbol, num.x + 1.2, num.y + 2);
            context.globalAlpha = 1;
        }

        context.fillStyle = c.rankFillMid;
        context.strokeStyle = c.rankStroke;
        context.lineWidth = 2.4;
        context.strokeText(tile.symbol, num.x, num.y);
        context.fillText(tile.symbol, num.x, num.y);

        if (tier === 'full') {
            context.fillStyle = c.rankFill;
            context.globalAlpha = 0.42;
            context.fillText(tile.symbol, num.x, num.y - 0.6);
            context.globalAlpha = 1;
        }
    }

    if ('letterSpacing' in context) {
        ctxLs.letterSpacing = prevLs ?? '0px';
    }

    context.restore();
};

function roundRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawShapeKind(ctx: CanvasRenderingContext2D, kind: number, cx: number, cy: number, s: number): void {
    const k = ((kind % SHAPE_COUNT) + SHAPE_COUNT) % SHAPE_COUNT;
    ctx.beginPath();
    switch (k) {
        case 0:
            ctx.arc(cx, cy, 62 * s, 0, Math.PI * 2);
            break;
        case 1: {
            const w = 112 * s;
            const h = 112 * s;
            const x = cx - w / 2;
            const y = cy - h / 2;
            const r = 14 * s;
            roundRectPath(ctx, x, y, w, h, r);
            break;
        }
        case 2: {
            const r = 74 * s;
            ctx.moveTo(cx, cy - r);
            ctx.lineTo(cx + r * 0.866, cy + r * 0.5);
            ctx.lineTo(cx - r * 0.866, cy + r * 0.5);
            ctx.closePath();
            break;
        }
        case 3: {
            const r = 52 * s;
            ctx.moveTo(cx, cy - r * 1.35);
            ctx.lineTo(cx + r * 1.35, cy);
            ctx.lineTo(cx, cy + r * 1.35);
            ctx.lineTo(cx - r * 1.35, cy);
            ctx.closePath();
            break;
        }
        default: {
            const n = 6;
            const r = 64 * s;
            for (let i = 0; i < n; i++) {
                const a = Math.PI / 6 + (i * 2 * Math.PI) / n - Math.PI / 2;
                const px = cx + r * Math.cos(a);
                const py = cy + r * Math.sin(a);
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            break;
        }
    }
}

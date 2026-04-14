/**
 * Deterministic card-face motif: geometric shape + numeric rank.
 * SVG output is the canonical spec; canvas overlay in tileTextures mirrors the same layout.
 */
import type { Tile } from '../../shared/contracts';

export type ProgrammaticOverlayVariant = 'active' | 'matched' | 'mismatch';

export const PROGRAMMATIC_CARD_VIEWBOX = { w: 400, h: 560 } as const;

const LAYOUT = {
    frame: { x: 24, y: 28, w: 352, h: 504, rx: 28 },
    shape: { cx: 200, cy: 208, scale: 1 },
    /** Rank text baseline area */
    number: { x: 200, y: 448, fontSize: 56 }
} as const;

const SHAPE_COUNT = 5;

const rankStrokeAndFill = (variant: ProgrammaticOverlayVariant): { fill: string; stroke: string } => {
    if (variant === 'matched') {
        return { fill: '#fff3c4', stroke: 'rgba(22, 12, 0, 0.92)' };
    }
    if (variant === 'mismatch') {
        return { fill: '#ffd8cf', stroke: 'rgba(28, 8, 6, 0.92)' };
    }
    return { fill: '#fffef5', stroke: 'rgba(8, 8, 14, 0.92)' };
};

const frameColors = (variant: ProgrammaticOverlayVariant): { fill: string; stroke: string } => {
    if (variant === 'matched') {
        return { fill: '#1a2838', stroke: 'rgba(255, 230, 160, 0.45)' };
    }
    if (variant === 'mismatch') {
        return { fill: '#1c2230', stroke: 'rgba(255, 190, 170, 0.42)' };
    }
    return { fill: '#162030', stroke: 'rgba(180, 220, 255, 0.35)' };
};

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

/** SVG fragment for the inner shape (no outer xmlns). */
const shapeSvgElements = (kind: number, cx: number, cy: number, s: number, fill: string, stroke: string): string => {
    const k = ((kind % SHAPE_COUNT) + SHAPE_COUNT) % SHAPE_COUNT;
    const sw = 3.2;
    const common = `fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"`;

    switch (k) {
        case 0:
            return `<circle ${common} cx="${cx}" cy="${cy}" r="${62 * s}" />`;
        case 1: {
            const w = 112 * s;
            const h = 112 * s;
            const x = cx - w / 2;
            const y = cy - h / 2;
            const r = 14 * s;
            return `<rect ${common} x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" />`;
        }
        case 2: {
            const r = 74 * s;
            const pts = `${cx},${cy - r} ${cx + r * 0.866},${cy + r * 0.5} ${cx - r * 0.866},${cy + r * 0.5}`;
            return `<polygon ${common} points="${pts}" />`;
        }
        case 3: {
            const r = 52 * s;
            const pts = `${cx},${cy - r * 1.35} ${cx + r * 1.35},${cy} ${cx},${cy + r * 1.35} ${cx - r * 1.35},${cy}`;
            return `<polygon ${common} points="${pts}" />`;
        }
        default: {
            const n = 6;
            const r = 64 * s;
            const pts: string[] = [];
            for (let i = 0; i < n; i++) {
                const a = (Math.PI / 6 + (i * 2 * Math.PI) / n) - Math.PI / 2;
                pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
            }
            return `<polygon ${common} points="${pts.join(' ')}" />`;
        }
    }
};

/**
 * Full SVG document for export, tests, or future rasterization — deterministic from tile + variant.
 */
export const buildProgrammaticCardFaceSvg = (tile: Tile, variant: ProgrammaticOverlayVariant): string => {
    const { w, h } = PROGRAMMATIC_CARD_VIEWBOX;
    const { frame, shape, number: num } = LAYOUT;
    const rank = rankStrokeAndFill(variant);
    const frm = frameColors(variant);
    const k = shapeKind(tile);
    const inner = shapeSvgElements(k, shape.cx, shape.cy, shape.scale, rank.fill, rank.stroke);
    const rankText = escapeXml(tile.symbol);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" rx="${frame.rx}" ry="${frame.rx}"
    fill="${frm.fill}" stroke="${frm.stroke}" stroke-width="3" />
  ${inner}
  <text x="${num.x}" y="${num.y}" text-anchor="middle" dominant-baseline="middle"
    font-family="Source Sans 3, Trebuchet MS, Arial, sans-serif" font-weight="800" font-size="${num.fontSize}"
    fill="${rank.fill}" stroke="${rank.stroke}" stroke-width="2" paint-order="stroke">${rankText}</text>
</svg>`;
};

const escapeXml = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Canvas overlay scaled to target bitmap (same visual intent as {@link buildProgrammaticCardFaceSvg}). */
export const drawProgrammaticCardFaceOverlay = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    tile: Tile,
    variant: ProgrammaticOverlayVariant
): void => {
    const { width, height } = canvas;
    const { w: vbW, h: vbH } = PROGRAMMATIC_CARD_VIEWBOX;
    const { frame, shape, number: num } = LAYOUT;
    const rank = rankStrokeAndFill(variant);
    const frm = frameColors(variant);
    const k = shapeKind(tile);

    context.clearRect(0, 0, width, height);
    context.save();
    context.scale(width / vbW, height / vbH);

    context.lineJoin = 'round';
    context.lineWidth = 3;
    context.fillStyle = frm.fill;
    context.strokeStyle = frm.stroke;
    roundRectPath(context, frame.x, frame.y, frame.w, frame.h, frame.rx);
    context.fill();
    context.stroke();

    context.fillStyle = rank.fill;
    context.strokeStyle = rank.stroke;
    context.lineWidth = 3.2;
    drawShapeKind(context, k, shape.cx, shape.cy, shape.scale);
    context.fill();
    context.stroke();

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `800 ${num.fontSize}px "Source Sans 3", "Arial", sans-serif`;
    context.lineWidth = 2;
    context.strokeText(tile.symbol, num.x, num.y);
    context.fillText(tile.symbol, num.x, num.y);

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

import type { CardFaceOverlayColors } from '../cardFaceOverlayPalette';
import type { OverlayDrawTier } from '../overlayDrawTier';
import type { ProceduralIllustrationSpec } from './proceduralIllustrationSpec';
import { rollProceduralIllustrationSpec } from './proceduralIllustrationSpec';
import { createIllustrationRng } from './illustrationRng';
import { deriveIllustrationSeed } from './illustrationSeed';

const hsla = (h: number, s: number, l: number, a: number): string =>
    `hsla(${Math.round(((h % 360) + 360) % 360)}, ${s}%, ${l}%, ${a})`;

const drawPolygonPath = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    sides: number,
    rotation: number
): void => {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const a = rotation + (i / sides) * Math.PI * 2 - Math.PI / 2;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
};

const drawStarPath = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    points: number,
    rotation: number
): void => {
    const n = points * 2;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
        const R = i % 2 === 0 ? outerR : innerR;
        const a = rotation + (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + R * Math.cos(a);
        const y = cy + R * Math.sin(a);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
};

const paintArchetypeBackground = (
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    pw: number,
    ph: number,
    spec: ProceduralIllustrationSpec,
    rng: ReturnType<typeof createIllustrationRng>,
    palette: CardFaceOverlayColors,
    tier: OverlayDrawTier
): void => {
    const cx = px + pw * (0.42 + rng.nextFloat01() * 0.16);
    const cy = py + ph * (0.36 + rng.nextFloat01() * 0.12);
    const h = spec.hueAccent;

    switch (spec.archetype) {
        case 'solarDisk': {
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(pw, ph) * 0.55);
            g.addColorStop(0, hsla(h, 62, 58, 0.95));
            g.addColorStop(0.45, hsla(h + 28, 48, 38, 0.88));
            g.addColorStop(1, palette.sigilFillDark);
            ctx.fillStyle = g;
            ctx.fillRect(px, py, pw, ph);
            break;
        }
        case 'voidVault': {
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(pw, ph) * 0.72);
            g.addColorStop(0, hsla(h + 180, 35, 22, 0.92));
            g.addColorStop(0.55, palette.sigilFillDark);
            g.addColorStop(1, '#050508');
            ctx.fillStyle = g;
            ctx.fillRect(px, py, pw, ph);
            const starCount = tier === 'minimal' ? 8 : tier === 'standard' ? 18 : 34;
            ctx.fillStyle = 'rgba(255,248,236,0.35)';
            for (let i = 0; i < starCount; i++) {
                const sx = px + rng.nextFloat01() * pw;
                const sy = py + rng.nextFloat01() * ph;
                const z = 0.4 + rng.nextFloat01() * 1.4;
                ctx.fillRect(sx, sy, z, z);
            }
            break;
        }
        case 'parchmentBloom': {
            const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
            g.addColorStop(0, hsla(h + 40, 28, 72, 0.55));
            g.addColorStop(0.5, hsla(h, 18, 44, 0.75));
            g.addColorStop(1, palette.sigilFillDark);
            ctx.fillStyle = g;
            ctx.fillRect(px, py, pw, ph);
            break;
        }
        case 'auroraSlash': {
            const g = ctx.createLinearGradient(px, py + ph, px + pw, py);
            g.addColorStop(0, hsla(h + 120, 55, 42, 0.55));
            g.addColorStop(0.35, hsla(h + 210, 62, 48, 0.42));
            g.addColorStop(0.65, hsla(h + 300, 48, 36, 0.48));
            g.addColorStop(1, palette.sigilFillDark);
            ctx.fillStyle = g;
            ctx.fillRect(px, py, pw, ph);
            break;
        }
        case 'twinOrbs': {
            const r = Math.min(pw, ph) * 0.28;
            const g1 = ctx.createRadialGradient(px + pw * 0.32, cy, 0, px + pw * 0.32, cy, r);
            g1.addColorStop(0, hsla(h, 58, 52, 0.75));
            g1.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g1;
            ctx.fillRect(px, py, pw, ph);
            const g2 = ctx.createRadialGradient(px + pw * 0.68, cy, 0, px + pw * 0.68, cy, r);
            g2.addColorStop(0, hsla(h + 160, 52, 48, 0.72));
            g2.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g2;
            ctx.fillRect(px, py, pw, ph);
            ctx.fillStyle = palette.sigilFillDark;
            ctx.globalAlpha = 0.42;
            ctx.fillRect(px, py, pw, ph);
            ctx.globalAlpha = 1;
            break;
        }
    }
};

const paintMotif = (
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    pw: number,
    ph: number,
    spec: ProceduralIllustrationSpec,
    rng: ReturnType<typeof createIllustrationRng>,
    palette: CardFaceOverlayColors,
    tier: OverlayDrawTier
): void => {
    const cx = px + pw / 2;
    const cy = py + ph * 0.46;
    const base = Math.min(pw, ph) * 0.22 * spec.motifScaleMul;

    ctx.lineJoin = 'round';

    const ornamentBoost =
        spec.rarityTier === 'legendary' ? 4 : spec.rarityTier === 'epic' ? 3 : spec.rarityTier === 'rare' ? 2 : 1;
    const tierCap = tier === 'minimal' ? 1 : tier === 'standard' ? 2 : 3;

    switch (spec.motif) {
        case 'polygonCore': {
            const sides = spec.motifSides;
            const rot = rng.nextFloat01() * Math.PI * 2;
            const g = ctx.createLinearGradient(px, cy - base, px + pw, cy + base);
            g.addColorStop(0, palette.sigilFillLight);
            g.addColorStop(1, palette.sigilFillDark);
            ctx.fillStyle = g;
            drawPolygonPath(ctx, cx, cy, base, sides, rot);
            ctx.fill();
            ctx.strokeStyle = palette.sigilStroke;
            ctx.lineWidth = 2.8;
            drawPolygonPath(ctx, cx, cy, base, sides, rot);
            ctx.stroke();
            break;
        }
        case 'ringStack': {
            for (let r = 0; r < spec.ringLayers; r++) {
                const rr = base * (1 - r * 0.22);
                ctx.beginPath();
                ctx.arc(cx, cy, rr, 0, Math.PI * 2);
                ctx.strokeStyle = r % 2 === 0 ? palette.sigilStroke : palette.sigilHighlight;
                ctx.lineWidth = Math.max(1.5, 3.2 - r * 0.45);
                ctx.stroke();
            }
            break;
        }
        case 'starBurst': {
            const pts = Math.min(12, Math.max(5, spec.motifSides));
            const rot = rng.nextFloat01() * Math.PI * 2;
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 1.1);
            g.addColorStop(0, palette.sigilFillLight);
            g.addColorStop(1, palette.sigilFillDark);
            ctx.fillStyle = g;
            drawStarPath(ctx, cx, cy, base, base * 0.42, pts, rot);
            ctx.fill();
            ctx.strokeStyle = palette.sigilStroke;
            ctx.lineWidth = 2.6;
            drawStarPath(ctx, cx, cy, base, base * 0.42, pts, rot);
            ctx.stroke();
            break;
        }
        case 'orbitShards': {
            const orbits = Math.min(spec.ringLayers + ornamentBoost, 3 + tierCap);
            for (let o = 0; o < orbits; o++) {
                const orbitR = base * (1.05 + o * 0.38);
                const shards = rng.nextIntInclusive(4, 9);
                for (let s = 0; s < shards; s++) {
                    const ang = (s / shards) * Math.PI * 2 + rng.nextFloat01();
                    const ox = cx + Math.cos(ang) * orbitR;
                    const oy = cy + Math.sin(ang) * orbitR * 0.92;
                    ctx.beginPath();
                    ctx.arc(ox, oy, 4 + rng.nextFloat01() * 7, 0, Math.PI * 2);
                    ctx.fillStyle = s % 3 === 0 ? palette.sigilFillLight : palette.sigilHighlight;
                    ctx.globalAlpha = 0.65;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }
            ctx.beginPath();
            ctx.arc(cx, cy, base * 0.55, 0, Math.PI * 2);
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.55);
            g.addColorStop(0, palette.sigilFillLight);
            g.addColorStop(1, palette.sigilFillDark);
            ctx.fillStyle = g;
            ctx.fill();
            ctx.strokeStyle = palette.sigilStroke;
            ctx.lineWidth = 2.4;
            ctx.stroke();
            break;
        }
    }
};

/**
 * Paint procedural “loot rolled” illustration into the given rect (pixel or viewBox units — caller space).
 */
export const drawProceduralTarotIllustration = (
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    pw: number,
    ph: number,
    pairKey: string,
    tier: OverlayDrawTier,
    palette: CardFaceOverlayColors
): void => {
    const spec = rollProceduralIllustrationSpec(pairKey, tier);
    const rng = createIllustrationRng(deriveIllustrationSeed(`${pairKey}|motif-layer`));

    paintArchetypeBackground(ctx, px, py, pw, ph, spec, rng, palette, tier);
    paintMotif(ctx, px, py, pw, ph, spec, rng, palette, tier);
};

import { CanvasTexture, LinearFilter, NoColorSpace, SRGBColorSpace } from 'three';
import type { Tile } from '../../shared/contracts';

export type FaceVariant = 'hidden' | 'active' | 'matched';
export type CubeFace = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type CubeLayer = 'shell' | 'core';

const TEXTURE_SIZE = 512;
const textureCache = new Map<string, CanvasTexture>();

const hashString = (value: string): number => {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) | 0;
    }

    return Math.abs(hash);
};

const createRng = (seed: number): (() => number) => {
    let state = seed || 1;

    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let value = Math.imul(state ^ (state >>> 15), 1 | state);
        value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
};

const canDraw = (): boolean => typeof document !== 'undefined';

const createTexture = (
    key: string,
    draw: (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
    colorSpace: typeof NoColorSpace | typeof SRGBColorSpace = SRGBColorSpace
): CanvasTexture | null => {
    const cached = textureCache.get(key);

    if (cached) {
        return cached;
    }

    if (!canDraw()) {
        return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = TEXTURE_SIZE;
    canvas.height = TEXTURE_SIZE;

    const context = canvas.getContext('2d');

    if (!context) {
        return null;
    }

    draw(context, canvas);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = colorSpace;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    textureCache.set(key, texture);

    return texture;
};

interface SurfacePalette {
    corner: string;
    edge: string;
    fill: string;
    glow: string;
    sheen: string;
    frost: string;
    accent: string;
    crack: string;
    symbol: string;
    label: string;
    rim: string;
}

const getPalette = (variant: FaceVariant, layer: CubeLayer): SurfacePalette => {
    const shell = layer === 'shell';

    if (variant === 'matched') {
        return shell
            ? {
                  corner: '#f7feff',
                  edge: '#c0ebff',
                  fill: '#def4ff',
                  glow: 'rgba(255, 255, 255, 0.46)',
                  sheen: 'rgba(255, 255, 255, 0.34)',
                  frost: 'rgba(243, 251, 255, 0.86)',
                  accent: 'rgba(186, 233, 255, 0.56)',
                  crack: 'rgba(255, 255, 255, 0.54)',
                  symbol: '#ffffff',
                  label: 'rgba(240, 248, 252, 0.96)',
                  rim: 'rgba(255, 255, 255, 0.62)'
              }
            : {
                  corner: '#ecfbff',
                  edge: '#9fc3e4',
                  fill: '#d6eaf7',
                  glow: 'rgba(201, 241, 255, 0.24)',
                  sheen: 'rgba(255, 255, 255, 0.18)',
                  frost: 'rgba(233, 245, 255, 0.68)',
                  accent: 'rgba(174, 221, 250, 0.24)',
                  crack: 'rgba(255, 255, 255, 0.22)',
                  symbol: '#f8fdff',
                  label: 'rgba(223, 238, 249, 0.9)',
                  rim: 'rgba(255, 255, 255, 0.3)'
              };
    }

    if (variant === 'active') {
        return shell
            ? {
                  corner: '#f6fdff',
                  edge: '#bfe6ff',
                  fill: '#ddf3ff',
                  glow: 'rgba(255, 255, 255, 0.42)',
                  sheen: 'rgba(255, 255, 255, 0.28)',
                  frost: 'rgba(239, 249, 255, 0.8)',
                  accent: 'rgba(182, 229, 255, 0.54)',
                  crack: 'rgba(255, 255, 255, 0.46)',
                  symbol: '#ffffff',
                  label: 'rgba(236, 247, 252, 0.94)',
                  rim: 'rgba(255, 255, 255, 0.5)'
              }
            : {
                  corner: '#eaf8ff',
                  edge: '#9cc2e1',
                  fill: '#d4e8f6',
                  glow: 'rgba(178, 224, 255, 0.2)',
                  sheen: 'rgba(255, 255, 255, 0.14)',
                  frost: 'rgba(229, 242, 252, 0.6)',
                  accent: 'rgba(175, 209, 242, 0.18)',
                  crack: 'rgba(255, 255, 255, 0.14)',
                  symbol: '#f7fcff',
                  label: 'rgba(223, 236, 248, 0.88)',
                  rim: 'rgba(255, 255, 255, 0.22)'
              };
    }

    return shell
        ? {
              corner: '#f5fcff',
              edge: '#b7dbf5',
              fill: '#d7ebf8',
              glow: 'rgba(255, 255, 255, 0.34)',
              sheen: 'rgba(255, 255, 255, 0.18)',
              frost: 'rgba(236, 247, 255, 0.74)',
              accent: 'rgba(182, 224, 255, 0.42)',
              crack: 'rgba(255, 255, 255, 0.34)',
              symbol: '#f9fdff',
              label: 'rgba(228, 240, 250, 0.84)',
              rim: 'rgba(255, 255, 255, 0.42)'
          }
        : {
              corner: '#edf8ff',
              edge: '#97bddb',
              fill: '#cfe2f2',
              glow: 'rgba(169, 213, 250, 0.16)',
              sheen: 'rgba(255, 255, 255, 0.12)',
              frost: 'rgba(229, 241, 250, 0.56)',
              accent: 'rgba(171, 204, 233, 0.16)',
              crack: 'rgba(255, 255, 255, 0.12)',
              symbol: '#f7fcff',
              label: 'rgba(218, 231, 244, 0.84)',
              rim: 'rgba(255, 255, 255, 0.18)'
          };
};

const faceRotation: Record<CubeFace, number> = {
    front: -0.18,
    back: 0.26,
    left: -0.72,
    right: 0.78,
    top: -0.34,
    bottom: 0.42
};

const faceBias: Record<CubeFace, number> = {
    front: 0.1,
    back: -0.05,
    left: -0.08,
    right: -0.03,
    top: 0.08,
    bottom: -0.1
};

const drawRoundedFrame = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, stroke: string, widthScale = 0.008): void => {
    const { width, height } = canvas;
    const edgeInset = Math.round(width * 0.06);
    const frameRadius = Math.round(width * 0.11);

    context.save();
    context.strokeStyle = stroke;
    context.lineWidth = Math.max(1, Math.round(width * widthScale));
    context.beginPath();
    context.roundRect(edgeInset, edgeInset, width - edgeInset * 2, height - edgeInset * 2, frameRadius);
    context.stroke();
    context.restore();
};

const drawSurfaceBase = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    palette: SurfacePalette,
    rng: () => number,
    face: CubeFace,
    variant: FaceVariant,
    layer: CubeLayer
): void => {
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const bias = faceBias[face];
    const shell = layer === 'shell';
    const gradient = context.createLinearGradient(0, 0, width, height);

    gradient.addColorStop(0, palette.corner);
    gradient.addColorStop(0.42 + bias * 0.06, palette.fill);
    gradient.addColorStop(1, palette.edge);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const bloom = context.createRadialGradient(width * (0.18 + rng() * 0.46), height * (0.18 + rng() * 0.42), width * 0.04, centerX, centerY, width * 0.82);
    bloom.addColorStop(0, palette.glow);
    bloom.addColorStop(0.55, palette.sheen);
    bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = bloom;
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(centerX, centerY);
    context.rotate(faceRotation[face] * (shell ? 0.82 : 0.72));
    context.translate(-centerX, -centerY);
    context.globalAlpha = shell ? 0.68 : 0.5;

    const streakCount = shell ? 8 + Math.floor(rng() * 6) : 5 + Math.floor(rng() * 4);
    for (let index = 0; index < streakCount; index += 1) {
        const bandY = height * (0.08 + rng() * 0.82);
        const bandHeight = Math.max(5, height * (0.012 + rng() * (shell ? 0.034 : 0.03)));
        const band = context.createLinearGradient(0, bandY, width, bandY + bandHeight);
        band.addColorStop(0, 'rgba(255, 255, 255, 0)');
        band.addColorStop(0.45, palette.accent);
        band.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.fillStyle = band;
        context.fillRect(-width * 0.16, bandY - bandHeight * 0.5, width * 1.32, bandHeight);
    }

    context.restore();

    context.save();
    context.globalAlpha = shell ? 0.42 : 0.26;
    const cloudCount = shell ? 8 + Math.floor(rng() * 5) : 5 + Math.floor(rng() * 3);

    for (let index = 0; index < cloudCount; index += 1) {
        const cloudX = width * (0.1 + rng() * 0.8);
        const cloudY = height * (0.1 + rng() * 0.8);
        const cloudRadius = width * (0.11 + rng() * (shell ? 0.17 : 0.13));
        const cloud = context.createRadialGradient(cloudX, cloudY, cloudRadius * 0.08, cloudX, cloudY, cloudRadius);
        cloud.addColorStop(0, index % 2 === 0 ? palette.frost : palette.sheen);
        cloud.addColorStop(0.62, index % 3 === 0 ? palette.accent : palette.frost);
        cloud.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.fillStyle = cloud;
        context.beginPath();
        context.arc(cloudX, cloudY, cloudRadius, 0, Math.PI * 2);
        context.fill();
    }

    context.restore();

    const facetCount = shell ? 10 + Math.floor(rng() * 6) : 6 + Math.floor(rng() * 4);
    context.save();
    context.globalAlpha = shell ? 0.34 : 0.22;

    for (let index = 0; index < facetCount; index += 1) {
        const centerXOffset = width * (0.12 + rng() * 0.76);
        const centerYOffset = height * (0.12 + rng() * 0.76);
        const radiusX = width * (0.08 + rng() * (shell ? 0.16 : 0.14));
        const radiusY = height * (0.06 + rng() * (shell ? 0.15 : 0.12));
        const sides = 4 + Math.floor(rng() * 4);
        const rotation = faceRotation[face] * 0.5 + (rng() - 0.5) * 1.6;

        context.beginPath();

        for (let side = 0; side < sides; side += 1) {
            const ratio = side / sides;
            const angle = rotation + ratio * Math.PI * 2;
            const pull = side % 2 === 0 ? 1 : 0.5 + rng() * 0.24;
            const x = centerXOffset + Math.cos(angle) * radiusX * pull;
            const y = centerYOffset + Math.sin(angle) * radiusY * pull;

            if (side === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }

        context.closePath();
        context.fillStyle = index % 2 === 0 ? palette.frost : palette.accent;
        context.fill();
        context.strokeStyle = palette.rim;
        context.lineWidth = Math.max(1, Math.round(width * 0.0025));
        context.stroke();
    }

    context.restore();

    context.save();
    context.globalAlpha = shell ? 0.48 : 0.3;
    context.fillStyle = palette.frost;

    const speckCount = shell ? 190 : 88;
    for (let index = 0; index < speckCount; index += 1) {
        const x = rng() * width;
        const y = rng() * height;
        const radius = 0.28 + rng() * (shell ? 1.25 : 1.48);
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
    }

    context.restore();

    context.save();
    context.strokeStyle = palette.crack;
    context.lineCap = 'round';
    context.globalAlpha = shell ? 0.38 : 0.24;

    const crackCount = shell ? 18 + Math.floor(rng() * 8) : 10 + Math.floor(rng() * 5);
    for (let index = 0; index < crackCount; index += 1) {
        const x = width * (0.08 + rng() * 0.84);
        const y = height * (0.08 + rng() * 0.84);
        const length = width * (0.06 + rng() * (shell ? 0.2 : 0.14));
        const angle = faceRotation[face] + (rng() - 0.5) * 1.7;
        context.lineWidth = Math.max(1, Math.round(width * (0.001 + rng() * 0.0018)));
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        context.stroke();
    }

    context.restore();

    drawRoundedFrame(context, canvas, palette.rim, shell ? 0.009 : 0.007);

    context.save();
    context.fillStyle = palette.rim;
    context.globalAlpha = shell ? 0.18 : 0.14;
    context.fillRect(width * 0.14, height * 0.12, width * 0.72, Math.max(3, Math.round(height * 0.012)));
    context.restore();
};

const drawGlyphs = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, tile: Tile, variant: Exclude<FaceVariant, 'hidden'>, layer: CubeLayer): void => {
    const { width, height } = canvas;
    const matched = variant === 'matched';
    const symbolSize = tile.symbol.length > 2 ? 130 : tile.symbol.length > 1 ? 152 : 182;
    const labelSize = Math.max(20, Math.round(width * 0.042));
    const plaqueX = width * 0.15;
    const plaqueY = height * 0.2;
    const plaqueWidth = width * 0.7;
    const plaqueHeight = height * 0.48;
    const plaqueRadius = Math.round(width * 0.09);
    const plaque = context.createLinearGradient(plaqueX, plaqueY, plaqueX + plaqueWidth, plaqueY + plaqueHeight);

    plaque.addColorStop(0, matched ? 'rgba(11, 43, 34, 0.3)' : 'rgba(10, 26, 45, 0.36)');
    plaque.addColorStop(0.48, matched ? 'rgba(18, 72, 54, 0.45)' : 'rgba(10, 30, 52, 0.5)');
    plaque.addColorStop(1, matched ? 'rgba(11, 43, 34, 0.24)' : 'rgba(8, 21, 38, 0.3)');

    context.save();
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = plaque;
    context.beginPath();
    context.roundRect(plaqueX, plaqueY, plaqueWidth, plaqueHeight, plaqueRadius);
    context.fill();
    context.strokeStyle = matched ? 'rgba(225, 255, 244, 0.3)' : 'rgba(232, 245, 255, 0.26)';
    context.lineWidth = Math.max(2, Math.round(width * 0.005));
    context.stroke();

    context.fillStyle = matched ? 'rgba(240, 255, 250, 0.24)' : 'rgba(247, 252, 255, 0.16)';
    context.fillRect(plaqueX + width * 0.04, plaqueY + height * 0.03, plaqueWidth - width * 0.08, Math.max(2, Math.round(height * 0.01)));

    context.shadowColor = 'rgba(2, 8, 16, 0.58)';
    context.shadowBlur = Math.round(width * 0.018);
    context.fillStyle = matched ? '#f8fff9' : '#f7fbff';
    context.strokeStyle = matched ? 'rgba(9, 47, 35, 0.7)' : 'rgba(9, 22, 39, 0.8)';
    context.lineWidth = Math.max(6, Math.round(width * 0.008));
    context.font = `900 ${symbolSize}px "Segoe UI", "Avenir Next", "Arial", sans-serif`;
    context.strokeText(tile.symbol, width / 2, height * 0.455);
    context.fillText(tile.symbol, width / 2, height * 0.46);

    context.shadowBlur = 0;
    context.strokeStyle = matched ? 'rgba(8, 38, 30, 0.44)' : 'rgba(8, 20, 36, 0.48)';
    context.lineWidth = Math.max(2, Math.round(width * 0.004));
    context.fillStyle = matched ? 'rgba(245, 255, 249, 0.92)' : 'rgba(244, 249, 255, 0.92)';
    context.font = `800 ${labelSize}px "Segoe UI", "Avenir Next", "Arial", sans-serif`;
    context.strokeText(tile.label.toUpperCase(), width / 2, height * 0.79);
    context.fillText(tile.label.toUpperCase(), width / 2, height * 0.79);

    context.fillStyle = matched ? 'rgba(167, 237, 198, 0.16)' : 'rgba(165, 198, 255, 0.16)';
    context.fillRect(width * 0.2, height * 0.13, width * 0.6, Math.max(5, Math.round(height * 0.018)));

    context.fillStyle = matched ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.07)';
    context.fillRect(width * 0.11, height * 0.18, width * 0.06, height * 0.56);

    if (layer === 'core') {
        context.fillStyle = matched ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.06)';
        context.fillRect(width * 0.18, height * 0.09, width * 0.64, Math.max(2, Math.round(height * 0.01)));
    }

    context.restore();
};

const drawNeutralGlyph = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, variant: FaceVariant, layer: CubeLayer): void => {
    const { width, height } = canvas;
    const alpha = variant === 'matched' ? 0.14 : variant === 'active' ? 0.12 : 0.1;
    const shell = layer === 'shell';

    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = 'rgba(255, 255, 255, 0.74)';
    context.fillRect(width * 0.18, height * 0.16, width * 0.64, Math.max(3, Math.round(height * 0.01)));
    context.fillRect(width * 0.18, height * 0.82, width * 0.42, Math.max(2, Math.round(height * 0.008)));

    context.strokeStyle = variant === 'matched' ? 'rgba(157, 242, 203, 0.16)' : 'rgba(161, 201, 255, 0.16)';
    context.lineWidth = Math.max(1, Math.round(width * 0.003));
    context.beginPath();
    context.moveTo(width * 0.22, height * 0.26);
    context.lineTo(width * 0.79, height * 0.71);
    context.stroke();

    context.beginPath();
    context.moveTo(width * 0.77, height * 0.23);
    context.lineTo(width * 0.31, height * 0.79);
    context.stroke();

    if (shell) {
        context.globalAlpha = alpha * 0.9;
        context.fillStyle = 'rgba(255, 255, 255, 0.14)';
        context.fillRect(width * 0.1, height * 0.08, width * 0.8, Math.max(2, Math.round(height * 0.008)));
    }

    context.restore();
};

const buildKey = (tile: Tile, face: CubeFace, variant: FaceVariant, layer: CubeLayer): string =>
    `${layer}:${variant}:${face}:${tile.id}:${tile.pairKey}:${tile.symbol}:${tile.label}`;

const drawFace = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    tile: Tile,
    face: CubeFace,
    variant: FaceVariant,
    layer: CubeLayer
): void => {
    const seed = hashString(buildKey(tile, face, variant, layer));
    const rng = createRng(seed);
    const palette = getPalette(variant, layer);

    drawSurfaceBase(context, canvas, palette, rng, face, variant, layer);

    if (layer === 'core' && face === 'front' && variant !== 'hidden') {
        drawGlyphs(context, canvas, tile, variant, layer);
    } else {
        drawNeutralGlyph(context, canvas, variant, layer);
    }
};

const drawRoughnessFace = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    tile: Tile,
    face: CubeFace,
    variant: FaceVariant,
    layer: CubeLayer
): void => {
    const seed = hashString(`${buildKey(tile, face, variant, layer)}:roughness`);
    const rng = createRng(seed);
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const shell = layer === 'shell';
    const baseValue = shell ? 208 : variant === 'matched' ? 186 : variant === 'active' ? 194 : 190;
    const faceBiasValue = face === 'front' ? 10 : face === 'top' ? 6 : face === 'back' ? -4 : face === 'bottom' ? -6 : 0;

    context.fillStyle = shade(baseValue + faceBiasValue);
    context.fillRect(0, 0, width, height);

    const broadShade = context.createLinearGradient(0, 0, width, height);
    broadShade.addColorStop(0, shade(baseValue + 22 + faceBiasValue));
    broadShade.addColorStop(0.34, shade(baseValue + 4));
    broadShade.addColorStop(1, shade(baseValue - 34 + faceBiasValue));
    context.fillStyle = broadShade;
    context.fillRect(0, 0, width, height);

    const bloom = context.createRadialGradient(width * (0.22 + rng() * 0.42), height * (0.18 + rng() * 0.44), width * 0.05, centerX, centerY, width * 0.8);
    bloom.addColorStop(0, shade(baseValue + 38));
    bloom.addColorStop(0.55, shade(baseValue + 8));
    bloom.addColorStop(1, shade(baseValue - 42));
    context.fillStyle = bloom;
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(centerX, centerY);
    context.rotate(faceRotation[face] * (shell ? 0.86 : 0.76));
    context.translate(-centerX, -centerY);
    context.globalAlpha = shell ? 0.74 : 0.58;

    const frostSwaths = shell ? 10 + Math.floor(rng() * 7) : 7 + Math.floor(rng() * 5);
    for (let index = 0; index < frostSwaths; index += 1) {
        const bandY = height * (0.08 + rng() * 0.84);
        const bandHeight = Math.max(4, height * (0.012 + rng() * (shell ? 0.03 : 0.022)));
        const band = context.createLinearGradient(0, bandY, width, bandY + bandHeight);
        band.addColorStop(0, shade(baseValue - 18 + rng() * 8));
        band.addColorStop(0.5, shade(baseValue + 34 + rng() * 14));
        band.addColorStop(1, shade(baseValue - 16 + rng() * 8));
        context.fillStyle = band;
        context.fillRect(-width * 0.18, bandY - bandHeight * 0.5, width * 1.36, bandHeight);
    }

    context.restore();

    context.save();
    context.globalAlpha = shell ? 0.46 : 0.34;
    context.strokeStyle = shade(baseValue + 50);
    context.lineCap = 'round';

    const scratchCount = shell ? 24 + Math.floor(rng() * 10) : 18 + Math.floor(rng() * 8);
    for (let index = 0; index < scratchCount; index += 1) {
        const x = width * (0.08 + rng() * 0.84);
        const y = height * (0.08 + rng() * 0.84);
        const length = width * (0.06 + rng() * (shell ? 0.18 : 0.14));
        const angle = faceRotation[face] + (rng() - 0.5) * 1.7;
        context.lineWidth = Math.max(1, Math.round(width * (0.001 + rng() * 0.0018)));
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        context.stroke();
    }

    context.restore();

    context.save();
    context.globalAlpha = shell ? 0.48 : 0.32;

    const coarseCount = shell ? 10 + Math.floor(rng() * 5) : 7 + Math.floor(rng() * 4);
    for (let index = 0; index < coarseCount; index += 1) {
        const cloudX = width * (0.1 + rng() * 0.8);
        const cloudY = height * (0.1 + rng() * 0.8);
        const cloudRadius = width * (0.1 + rng() * (shell ? 0.16 : 0.13));
        const cloud = context.createRadialGradient(cloudX, cloudY, cloudRadius * 0.1, cloudX, cloudY, cloudRadius);
        cloud.addColorStop(0, shade(baseValue + 32 + rng() * 18));
        cloud.addColorStop(0.48, shade(baseValue + 10 + rng() * 16));
        cloud.addColorStop(1, shade(baseValue - 30 - rng() * 20));
        context.fillStyle = cloud;
        context.beginPath();
        context.arc(cloudX, cloudY, cloudRadius, 0, Math.PI * 2);
        context.fill();
    }

    const facetCount = shell ? 20 + Math.floor(rng() * 8) : 12 + Math.floor(rng() * 6);
    for (let index = 0; index < facetCount; index += 1) {
        const centerXOffset = width * (0.12 + rng() * 0.76);
        const centerYOffset = height * (0.12 + rng() * 0.76);
        const radiusX = width * (0.09 + rng() * 0.18);
        const radiusY = height * (0.07 + rng() * 0.16);
        const sides = 4 + Math.floor(rng() * 4);
        const rotation = faceRotation[face] * 0.5 + (rng() - 0.5) * 1.6;
        const fillValue = index % 2 === 0 ? baseValue + 16 + rng() * 26 : baseValue - 22 + rng() * 16;

        context.beginPath();

        for (let side = 0; side < sides; side += 1) {
            const ratio = side / sides;
            const angle = rotation + ratio * Math.PI * 2;
            const pull = side % 2 === 0 ? 1 : 0.5 + rng() * 0.24;
            const x = centerXOffset + Math.cos(angle) * radiusX * pull;
            const y = centerYOffset + Math.sin(angle) * radiusY * pull;

            if (side === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }

        context.closePath();
        context.fillStyle = shade(fillValue + faceBiasValue);
        context.fill();
    }

    context.restore();

    context.save();
    context.fillStyle = shade(baseValue + 18 + faceBiasValue);
    context.globalAlpha = shell ? 0.46 : 0.3;

    const speckCount = shell ? 240 : 120;
    for (let index = 0; index < speckCount; index += 1) {
        const x = rng() * width;
        const y = rng() * height;
        const radius = 0.24 + rng() * (shell ? 1.18 : 1.36);
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
    }

    context.restore();

    context.save();
    context.fillStyle = shade(baseValue - 40 + faceBiasValue);
    context.globalAlpha = shell ? 0.16 : 0.12;
    context.fillRect(width * 0.04, height * 0.04, width * 0.92, Math.max(3, Math.round(height * 0.02)));
    context.fillRect(width * 0.08, height * 0.9, width * 0.72, Math.max(2, Math.round(height * 0.01)));
    context.restore();
};

const shade = (value: number): string => {
    const next = Math.max(0, Math.min(255, Math.round(value)));
    return `rgb(${next}, ${next}, ${next})`;
};

export const getTileFaceTexture = (
    tile: Tile,
    face: CubeFace,
    variant: FaceVariant,
    layer: CubeLayer = 'core'
): CanvasTexture | null => createTexture(buildKey(tile, face, variant, layer), (context, canvas) => drawFace(context, canvas, tile, face, variant, layer));

export const getTileFaceRoughnessTexture = (
    tile: Tile,
    face: CubeFace,
    variant: FaceVariant,
    layer: CubeLayer = 'core'
): CanvasTexture | null =>
    createTexture(
        `${buildKey(tile, face, variant, layer)}:roughness`,
        (context, canvas) => drawRoughnessFace(context, canvas, tile, face, variant, layer),
        NoColorSpace
    );

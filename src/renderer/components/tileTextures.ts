import { CanvasTexture, LinearFilter, NoColorSpace, SRGBColorSpace } from 'three';
import type { Tile } from '../../shared/contracts';
import { RENDERER_THEME } from '../styles/theme';
import referenceBackTextureUrl from '../assets/textures/cards/reference-back.png';
import edgeTextureUrl from '../assets/textures/cards/edge.png';
import panelRoughnessTextureUrl from '../assets/textures/cards/panel-roughness.png';
import edgeRoughnessTextureUrl from '../assets/textures/cards/edge-roughness.png';

export type FaceVariant = 'hidden' | 'active' | 'matched';
export type TileFace = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type TileLayer = 'bezel' | 'panel' | 'shell' | 'core';

// Backward-compatible aliases for untouched imports.
export type CubeFace = TileFace;
export type CubeLayer = 'shell' | 'core';

const TEXTURE_SIZE = 512;
const TILE_TEXTURE_VERSION = 13;
const textureCache = new Map<string, CanvasTexture>();
const textureImageUpdateListeners = new Set<() => void>();

const textureImageUrls = {
    /** Single card raster for both faces (reference-back.png). */
    cardReference: referenceBackTextureUrl,
    edge: edgeTextureUrl,
    panelRoughness: panelRoughnessTextureUrl,
    edgeRoughness: edgeRoughnessTextureUrl
} as const;

type TextureImageId = keyof typeof textureImageUrls;

interface TextureImageState {
    image: HTMLImageElement | null;
    status: 'loading' | 'loaded' | 'error';
}

const textureImages = new Map<TextureImageId, TextureImageState>();

const emitTextureImageUpdate = (): void => {
    textureImageUpdateListeners.forEach((listener) => listener());
};

/** Ensures all card PNGs are decoded so the tile board can build CanvasTextures without a first-frame hitch. */
export const preloadTileTextureImages = (): Promise<void> => {
    if (!canDraw()) {
        return Promise.resolve();
    }

    const ids = Object.keys(textureImageUrls) as TextureImageId[];

    return Promise.all(
        ids.map(
            (id) =>
                new Promise<void>((resolve) => {
                    const existing = textureImages.get(id);

                    if (existing?.status === 'loaded') {
                        resolve();
                        return;
                    }

                    if (existing?.status === 'error') {
                        resolve();
                        return;
                    }

                    const image = new Image();
                    image.decoding = 'async';

                    image.onload = () => {
                        textureImages.set(id, { image, status: 'loaded' });
                        textureCache.clear();
                        emitTextureImageUpdate();
                        resolve();
                    };

                    image.onerror = () => {
                        textureImages.set(id, { image: null, status: 'error' });
                        resolve();
                    };

                    if (!textureImages.has(id)) {
                        textureImages.set(id, { image: null, status: 'loading' });
                    }

                    image.src = textureImageUrls[id];
                })
        )
    ).then(() => undefined);
};

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

const getTextureImage = (imageId: TextureImageId): HTMLImageElement | null => {
    const current = textureImages.get(imageId);

    if (current?.status === 'loaded' && current.image && current.image.complete && current.image.naturalWidth > 0) {
        return current.image;
    }

    if (!canDraw()) {
        return null;
    }

    if (!current) {
        const image = new Image();
        image.decoding = 'async';
        textureImages.set(imageId, { image: null, status: 'loading' });
        image.onload = () => {
            textureImages.set(imageId, { image, status: 'loaded' });
            textureCache.clear();
            emitTextureImageUpdate();
        };
        image.onerror = () => {
            textureImages.set(imageId, { image: null, status: 'error' });
        };
        image.src = textureImageUrls[imageId];
    }

    return null;
};

const drawTextureImage = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    imageId: TextureImageId,
    opacity = 1
): boolean => {
    const image = getTextureImage(imageId);

    if (!image) {
        return false;
    }

    context.save();
    context.globalAlpha = opacity;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    context.restore();

    return true;
};

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

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

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

/** Sharper sampling on tilted quads; call once per WebGL context with device cap. */
export const applyAnisotropyToCachedTileTextures = (anisotropy: number): void => {
    for (const texture of textureCache.values()) {
        texture.anisotropy = anisotropy;
    }
};

type LayerSlot = 'bezel' | 'panel';

const normalizeLayer = (layer: TileLayer): LayerSlot => {
    if (layer === 'shell') {
        return 'bezel';
    }

    if (layer === 'core') {
        return 'panel';
    }

    return layer;
};

interface CardPalette {
    accent: string;
    backBase: string;
    backPattern: string;
    edge: string;
    faceBase: string;
    faceEdge: string;
    foil: string;
    glow: string;
    ink: string;
    label: string;
    line: string;
    rim: string;
    rimSoft: string;
}

const getPalette = (variant: FaceVariant, layer: LayerSlot): CardPalette => {
    const { colors } = RENDERER_THEME;
    const bezel = layer === 'bezel';

    if (variant === 'matched') {
        return bezel
            ? {
                  accent: 'rgba(255, 214, 133, 0.24)',
                  backBase: '#1a1c22',
                  backPattern: 'rgba(255, 214, 133, 0.14)',
                  edge: '#111317',
                  faceBase: '#2a2317',
                  faceEdge: '#151109',
                  foil: colors.goldBright,
                  glow: colors.glowGold,
                  ink: colors.text,
                  label: 'rgba(255, 242, 214, 0.95)',
                  line: 'rgba(255, 214, 133, 0.48)',
                  rim: 'rgba(255, 214, 133, 0.8)',
                  rimSoft: 'rgba(194, 245, 255, 0.22)'
              }
            : {
                  accent: 'rgba(255, 214, 133, 0.16)',
                  backBase: '#16202d',
                  backPattern: 'rgba(87, 220, 255, 0.22)',
                  edge: '#0b1320',
                  faceBase: '#1d1a12',
                  faceEdge: '#0c0a07',
                  foil: colors.goldBright,
                  glow: colors.glowGold,
                  ink: '#fff6de',
                  label: 'rgba(255, 242, 214, 0.92)',
                  line: 'rgba(255, 214, 133, 0.52)',
                  rim: 'rgba(255, 214, 133, 0.62)',
                  rimSoft: 'rgba(87, 220, 255, 0.28)'
              };
    }

    if (variant === 'active') {
        return bezel
            ? {
                  accent: 'rgba(87, 220, 255, 0.22)',
                  backBase: '#171b23',
                  backPattern: 'rgba(87, 220, 255, 0.16)',
                  edge: '#10141b',
                  faceBase: '#142333',
                  faceEdge: '#0b121a',
                  foil: colors.cyanBright,
                  glow: colors.glowCyan,
                  ink: '#e8fbff',
                  label: 'rgba(232, 251, 255, 0.92)',
                  line: 'rgba(87, 220, 255, 0.48)',
                  rim: 'rgba(87, 220, 255, 0.72)',
                  rimSoft: 'rgba(255, 214, 133, 0.24)'
              }
            : {
                  accent: 'rgba(87, 220, 255, 0.18)',
                  backBase: '#162333',
                  backPattern: 'rgba(87, 220, 255, 0.26)',
                  edge: '#0b1320',
                  faceBase: '#13283a',
                  faceEdge: '#0d1823',
                  foil: colors.cyanBright,
                  glow: colors.glowCyan,
                  ink: '#ebfcff',
                  label: 'rgba(227, 250, 255, 0.92)',
                  line: 'rgba(87, 220, 255, 0.5)',
                  rim: 'rgba(87, 220, 255, 0.58)',
                  rimSoft: 'rgba(255, 214, 133, 0.2)'
              };
    }

    return bezel
        ? {
              accent: 'rgba(255, 214, 133, 0.16)',
              backBase: '#27364a',
              backPattern: 'rgba(255, 214, 133, 0.2)',
              edge: '#182436',
              faceBase: '#314257',
              faceEdge: '#223246',
              foil: colors.gold,
              glow: colors.glowGoldSoft,
              ink: 'rgba(244, 241, 233, 0.9)',
              label: 'rgba(232, 226, 214, 0.86)',
              line: 'rgba(255, 214, 133, 0.44)',
              rim: 'rgba(255, 214, 133, 0.58)',
              rimSoft: 'rgba(194, 245, 255, 0.3)'
          }
        : {
              accent: 'rgba(255, 214, 133, 0.14)',
              backBase: '#30435b',
              backPattern: 'rgba(255, 214, 133, 0.28)',
              edge: '#1f3045',
              faceBase: '#3a4d67',
              faceEdge: '#27384d',
              foil: colors.gold,
              glow: colors.glowGoldSoft,
              ink: 'rgba(248, 244, 234, 0.92)',
              label: 'rgba(241, 236, 222, 0.9)',
              line: 'rgba(255, 214, 133, 0.44)',
              rim: 'rgba(255, 214, 133, 0.56)',
              rimSoft: 'rgba(87, 220, 255, 0.28)'
          };
};

const faceTilt: Record<TileFace, number> = {
    front: -0.08,
    back: 0.16,
    left: -0.24,
    right: 0.24,
    top: -0.12,
    bottom: 0.16
};

const drawRoundedRectFrame = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    stroke: string,
    lineWidth: number
): void => {
    context.save();
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.stroke();
    context.restore();
};

const drawNoise = (context: CanvasRenderingContext2D, width: number, height: number, count: number, color: string, rng: () => number): void => {
    context.save();
    context.fillStyle = color;

    for (let index = 0; index < count; index += 1) {
        const x = rng() * width;
        const y = rng() * height;
        const size = 0.3 + rng() * 1.15;
        context.fillRect(x, y, size, size);
    }

    context.restore();
};

/** Rounded panel: reference-back raster plus the same hatch / emblem treatment used on the physical back. */
const drawCardReferenceRoundPanel = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    palette: CardPalette
): { inset: number; cardWidth: number; cardHeight: number; radius: number } => {
    const { width, height } = canvas;
    const inset = width * 0.03;
    const cardWidth = width - inset * 2;
    const cardHeight = height - inset * 2;
    const radius = width * 0.075;

    const panelGradient = context.createLinearGradient(inset, inset, inset + cardWidth, inset + cardHeight);
    panelGradient.addColorStop(0, palette.backBase);
    panelGradient.addColorStop(1, palette.edge);

    context.save();
    context.beginPath();
    context.roundRect(inset, inset, cardWidth, cardHeight, radius);
    context.fillStyle = panelGradient;
    context.fill();
    context.clip();

    const hasCardTexture = drawTextureImage(context, canvas, 'cardReference', 1);
    if (hasCardTexture) {
        const tintOverlay = context.createLinearGradient(inset, inset, inset + cardWidth, inset + cardHeight);
        tintOverlay.addColorStop(0, 'rgba(11, 19, 30, 0.06)');
        tintOverlay.addColorStop(1, 'rgba(7, 12, 20, 0.1)');
        context.fillStyle = tintOverlay;
        context.fillRect(inset, inset, cardWidth, cardHeight);
    }

    context.globalAlpha = hasCardTexture ? 0.12 : 0.66;
    context.strokeStyle = palette.backPattern;
    context.lineWidth = Math.max(1, Math.round(width * 0.0026));

    const step = Math.max(20, Math.round(width * 0.08));
    for (let x = -cardHeight; x < cardWidth + cardHeight; x += step) {
        context.beginPath();
        context.moveTo(inset + x, inset);
        context.lineTo(inset + x + cardHeight, inset + cardHeight);
        context.stroke();
    }

    for (let x = 0; x < cardWidth + cardHeight; x += step) {
        context.beginPath();
        context.moveTo(inset + x, inset + cardHeight);
        context.lineTo(inset + x - cardHeight, inset);
        context.stroke();
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const ring = Math.max(width * 0.16, 54);
    const emblem = context.createRadialGradient(centerX, centerY, ring * 0.15, centerX, centerY, ring);
    emblem.addColorStop(0, palette.foil);
    emblem.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.globalAlpha = hasCardTexture ? 0.08 : 0.35;
    context.fillStyle = emblem;
    context.beginPath();
    context.arc(centerX, centerY, ring, 0, Math.PI * 2);
    context.fill();

    context.globalAlpha = hasCardTexture ? 0.28 : 0.72;
    context.strokeStyle = palette.rimSoft;
    context.lineWidth = Math.max(2, Math.round(width * 0.006));
    context.beginPath();
    context.arc(centerX, centerY, ring * 0.58, 0, Math.PI * 2);
    context.stroke();

    context.restore();

    return { inset, cardWidth, cardHeight, radius };
};

const drawCardOuterFramesAndNoise = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    palette: CardPalette,
    rng: () => number,
    metrics: { inset: number; cardWidth: number; cardHeight: number; radius: number }
): void => {
    const { width, height } = canvas;
    const { inset, cardWidth, cardHeight, radius } = metrics;

    drawRoundedRectFrame(
        context,
        inset,
        inset,
        cardWidth,
        cardHeight,
        radius,
        palette.rim,
        Math.max(2, Math.round(width * 0.005))
    );

    drawRoundedRectFrame(
        context,
        inset + width * 0.018,
        inset + width * 0.018,
        cardWidth - width * 0.036,
        cardHeight - width * 0.036,
        radius * 0.72,
        palette.rimSoft,
        Math.max(1, Math.round(width * 0.003))
    );

    drawNoise(context, width, height, 90, 'rgba(255, 255, 255, 0.06)', rng);
};

/** Same card face for back and flipped front: hidden palette for panel, hatch, and rims (no active/matched cyan rim). */
const drawCardBackPattern = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, rng: () => number): void => {
    const hiddenPanel = getPalette('hidden', 'panel');
    const metrics = drawCardReferenceRoundPanel(context, canvas, hiddenPanel);
    drawCardOuterFramesAndNoise(context, canvas, hiddenPanel, rng, metrics);
};

const drawCardFrontOverlay = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    tile: Tile,
    variant: Exclude<FaceVariant, 'hidden'>
): void => {
    const { width, height } = canvas;
    const matched = variant === 'matched';
    const symbolText = tile.symbol;
    const labelText = tile.label.toUpperCase();
    const symbolBaseSize = tile.symbol.length > 2 ? 104 : tile.symbol.length > 1 ? 122 : 142;
    const hasDistinctLabel = labelText !== symbolText.toUpperCase();
    const symbolFill = matched ? '#fff3c4' : '#fffef5';
    const symbolStroke = matched ? 'rgba(22, 12, 0, 0.92)' : 'rgba(8, 8, 14, 0.92)';
    const labelFill = matched ? '#fff8e1' : '#fffef8';
    const labelStroke = matched ? 'rgba(18, 10, 0, 0.9)' : 'rgba(6, 6, 12, 0.9)';

    context.clearRect(0, 0, width, height);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineJoin = 'round';

    let symbolSize = symbolBaseSize;
    context.font = `800 ${symbolSize}px "Segoe UI", "Segoe UI Symbol", "Segoe UI Emoji", "Arial", sans-serif`;
    const symbolMaxWidth = width * 0.38;
    while (symbolSize > 88 && context.measureText(symbolText).width > symbolMaxWidth) {
        symbolSize -= 6;
        context.font = `800 ${symbolSize}px "Segoe UI", "Segoe UI Symbol", "Segoe UI Emoji", "Arial", sans-serif`;
    }

    const symbolY = height * 0.49;
    context.shadowBlur = 0;
    context.lineWidth = Math.max(6, Math.round(width * 0.011));
    context.strokeStyle = symbolStroke;
    context.strokeText(symbolText, width / 2, symbolY);
    context.fillStyle = symbolFill;
    context.fillText(symbolText, width / 2, symbolY);

    if (hasDistinctLabel) {
        const labelFontSize = Math.max(16, Math.round(width * 0.032));
        const labelY = height * 0.78;
        context.font = `800 ${labelFontSize}px "Segoe UI", "Arial", sans-serif`;
        context.lineWidth = Math.max(3, Math.round(width * 0.005));
        context.strokeStyle = labelStroke;
        context.strokeText(labelText, width / 2, labelY);
        context.fillStyle = labelFill;
        context.fillText(labelText, width / 2, labelY);
    }
};

const drawEdgeFace = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, palette: CardPalette, face: TileFace): void => {
    const { width, height } = canvas;
    const vertical = face === 'left' || face === 'right';
    const hasEdgeTexture = drawTextureImage(context, canvas, 'edge', 0.94);

    if (!hasEdgeTexture) {
        const gradient = vertical ? context.createLinearGradient(0, 0, width, 0) : context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, palette.edge);
        gradient.addColorStop(0.55, palette.faceEdge);
        gradient.addColorStop(1, palette.edge);
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
    }

    context.fillStyle = palette.line;
    context.globalAlpha = hasEdgeTexture ? 0.2 : 0.35;
    if (vertical) {
        context.fillRect(width * 0.44, 0, width * 0.12, height);
    } else {
        context.fillRect(0, height * 0.44, width, height * 0.12);
    }
    context.globalAlpha = 1;
};

const drawCardBase = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    face: TileFace,
    palette: CardPalette,
    rng: () => number,
    layer: LayerSlot
): void => {
    const { width, height } = canvas;

    if (face !== 'front' && face !== 'back') {
        drawEdgeFace(context, canvas, palette, face);
        return;
    }

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, layer === 'bezel' ? palette.edge : palette.faceBase);
    gradient.addColorStop(0.5, layer === 'bezel' ? palette.faceEdge : palette.faceEdge);
    gradient.addColorStop(1, layer === 'bezel' ? palette.edge : palette.backBase);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(width / 2, height / 2);
    context.rotate(faceTilt[face]);
    context.translate(-width / 2, -height / 2);
    context.globalAlpha = layer === 'bezel' ? 0.36 : 0.26;

    const streaks = layer === 'bezel' ? 10 : 7;
    for (let index = 0; index < streaks; index += 1) {
        const y = height * (0.08 + rng() * 0.84);
        const band = context.createLinearGradient(0, y, width, y + height * 0.018);
        band.addColorStop(0, 'rgba(255, 255, 255, 0)');
        band.addColorStop(0.52, palette.line);
        band.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.fillStyle = band;
        context.fillRect(-width * 0.2, y, width * 1.4, height * 0.018);
    }
    context.restore();

    drawNoise(context, width, height, layer === 'bezel' ? 90 : 56, 'rgba(255, 255, 255, 0.05)', rng);
};

const buildKey = (tile: Tile, face: TileFace, variant: FaceVariant, layer: TileLayer): string =>
    `${TILE_TEXTURE_VERSION}:${layer}:${variant}:${face}:${tile.id}:${tile.pairKey}:${tile.symbol}:${tile.label}`;

/** Panel art is only authored for the back face; geometry uses the same pixels on both sides. */
const drawFace = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    tile: Tile,
    face: TileFace,
    variant: FaceVariant,
    layer: TileLayer
): void => {
    const normalizedLayer = normalizeLayer(layer);
    const palette = getPalette(variant, normalizedLayer);
    const seed = hashString(buildKey(tile, face, variant, layer));
    const rng = createRng(seed);

    const basePalette =
        normalizedLayer === 'panel' && face === 'back'
            ? getPalette('hidden', normalizedLayer)
            : palette;

    drawCardBase(context, canvas, face, basePalette, rng, normalizedLayer);

    if (normalizedLayer === 'bezel') {
        return;
    }

    if (face === 'back') {
        drawCardBackPattern(context, canvas, rng);
    }
};

const shade = (value: number): string => {
    const next = Math.max(0, Math.min(255, Math.round(value)));
    return `rgb(${next}, ${next}, ${next})`;
};

const drawRoughnessFace = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    tile: Tile,
    face: TileFace,
    variant: FaceVariant,
    layer: TileLayer
): void => {
    const normalizedLayer = normalizeLayer(layer);
    const seed = hashString(`${buildKey(tile, face, variant, layer)}:roughness`);
    const rng = createRng(seed);
    const { width, height } = canvas;
    const bezel = normalizedLayer === 'bezel';
    const front = face === 'front';
    const back = face === 'back';
    const edgeFace = !front && !back;
    const base = bezel
        ? variant === 'matched'
            ? 164
            : variant === 'active'
                ? 176
                : 184
        : variant === 'matched'
            ? 158
            : variant === 'active'
                ? 172
                : 182;
    const faceShift = front ? 8 : back ? 2 : -10;
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, shade(base + 20 + faceShift));
    gradient.addColorStop(0.5, shade(base + faceShift));
    gradient.addColorStop(1, shade(base - 28 + faceShift));
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    drawTextureImage(context, canvas, edgeFace ? 'edgeRoughness' : 'panelRoughness', edgeFace ? 0.72 : 0.82);

    context.save();
    context.globalAlpha = edgeFace ? 0.28 : bezel ? 0.44 : 0.38;
    context.fillStyle = shade(base + 24);
    const grainCount = edgeFace ? 64 : bezel ? 130 : 110;

    for (let index = 0; index < grainCount; index += 1) {
        const x = rng() * width;
        const y = rng() * height;
        const size = 0.3 + rng() * 1.05;
        context.fillRect(x, y, size, size);
    }

    context.restore();

    context.save();
    context.globalAlpha = edgeFace ? 0.26 : 0.36;
    const lineCount = edgeFace ? 5 : 9;
    for (let index = 0; index < lineCount; index += 1) {
        const y = height * (0.1 + rng() * 0.8);
        const lineHeight = Math.max(2, height * (0.0025 + rng() * 0.0025));
        const line = context.createLinearGradient(0, y, width, y + lineHeight);
        line.addColorStop(0, shade(base - 18));
        line.addColorStop(0.5, shade(base + 18 + rng() * 10));
        line.addColorStop(1, shade(base - 18));
        context.fillStyle = line;
        context.fillRect(-width * 0.2, y, width * 1.4, lineHeight);
    }
    context.restore();

    if (front || back) {
        context.save();
        context.globalAlpha = 0.2;
        context.fillStyle = shade(base - 24);
        context.fillRect(width * 0.08, height * 0.08, width * 0.84, Math.max(2, Math.round(height * 0.01)));
        context.fillRect(width * 0.12, height * 0.9, width * 0.64, Math.max(2, Math.round(height * 0.008)));
        context.restore();
    }
};

export const getTileFaceTexture = (
    tile: Tile,
    face: TileFace,
    variant: FaceVariant,
    layer: TileLayer = 'panel'
): CanvasTexture | null => {
    const normalized = normalizeLayer(layer);
    const renderFace: TileFace = normalized === 'panel' && face === 'front' ? 'back' : face;

    return createTexture(buildKey(tile, renderFace, variant, layer), (context, canvas) =>
        drawFace(context, canvas, tile, renderFace, variant, layer)
    );
};

export const getTileFaceRoughnessTexture = (
    tile: Tile,
    face: TileFace,
    variant: FaceVariant,
    layer: TileLayer = 'panel'
): CanvasTexture | null =>
    createTexture(
        `${buildKey(tile, face, variant, layer)}:roughness`,
        (context, canvas) => drawRoughnessFace(context, canvas, tile, face, variant, layer),
        NoColorSpace
    );

export const getTileFaceOverlayTexture = (
    tile: Tile,
    variant: Exclude<FaceVariant, 'hidden'>
): CanvasTexture | null =>
    createTexture(
        `${buildKey(tile, 'front', variant, 'panel')}:overlay`,
        (context, canvas) => drawCardFrontOverlay(context, canvas, tile, variant)
    );

export const getCardBackStaticTexture = (): CanvasTexture | null =>
    createTexture('static-card-back', (context, canvas) => {
        const rendered = drawTextureImage(context, canvas, 'cardReference', 1);

        if (!rendered) {
            const fallback = context.createLinearGradient(0, 0, canvas.width, canvas.height);
            fallback.addColorStop(0, '#2b394f');
            fallback.addColorStop(1, '#182233');
            context.fillStyle = fallback;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
    });

export const subscribeTextureImageUpdates = (listener: () => void): (() => void) => {
    textureImageUpdateListeners.add(listener);

    return () => {
        textureImageUpdateListeners.delete(listener);
    };
};

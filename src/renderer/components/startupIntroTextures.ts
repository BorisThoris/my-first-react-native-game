import {
    CanvasTexture,
    ClampToEdgeWrapping,
    LinearFilter,
    NoColorSpace,
    SRGBColorSpace
} from 'three';

export interface RelicTextureSet {
    alphaTexture: CanvasTexture;
    aspectRatio: number;
    colorTexture: CanvasTexture;
    dispose: () => void;
    height: number;
    heightTexture: CanvasTexture;
    width: number;
}

const TEXTURE_WIDTH = 1024;
const OUTPUT_PADDING_RATIO = 0.008;
const CROP_PADDING_RATIO = 0.016;
const BASE_ALPHA_THRESHOLD = 6;
const CROP_SCAN_FACTORS = [0.24, 0.18, 0.14, 0.1, 0.07, 0.05] as const;
const MAX_FULL_FRAME_RATIO = 0.92;
const MIN_CROP_AREA_RATIO = 0.1;
const MIN_CROP_DIMENSION_RATIO = 0.22;

const createCanvas = (width: number, height: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    return canvas;
};

const getContext2D = (canvas: HTMLCanvasElement): CanvasRenderingContext2D | null => {
    try {
        return canvas.getContext('2d', { willReadFrequently: true }) ?? canvas.getContext('2d');
    } catch {
        return null;
    }
};

const loadImage = async (source: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load intro asset: ${source}`));
        image.src = source;
    });

const drawContainedCanvas = (
    context: CanvasRenderingContext2D,
    sourceCanvas: HTMLCanvasElement,
    width: number,
    height: number
): void => {
    const paddingX = width * OUTPUT_PADDING_RATIO;
    const paddingY = height * OUTPUT_PADDING_RATIO;
    const availableWidth = width - paddingX * 2;
    const availableHeight = height - paddingY * 2;
    const scale = Math.min(availableWidth / sourceCanvas.width, availableHeight / sourceCanvas.height);
    const drawWidth = sourceCanvas.width * scale;
    const drawHeight = sourceCanvas.height * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    context.clearRect(0, 0, width, height);
    context.drawImage(sourceCanvas, x, y, drawWidth, drawHeight);
};

const renderSourceCanvas = (image: HTMLImageElement): HTMLCanvasElement | null => {
    const canvas = createCanvas(image.width, image.height);
    const context = getContext2D(canvas);

    if (!context) {
        return null;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas;
};

const scanVisibleBounds = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    alphaThreshold: number
): {
    height: number;
    width: number;
    x: number;
    y: number;
} | null => {
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const offset = (y * width + x) * 4;

            if (data[offset + 3] < alphaThreshold) {
                continue;
            }

            if (x < minX) {
                minX = x;
            }

            if (x > maxX) {
                maxX = x;
            }

            if (y < minY) {
                minY = y;
            }

            if (y > maxY) {
                maxY = y;
            }
        }
    }

    if (maxX < minX || maxY < minY) {
        return null;
    }

    return {
        height: maxY - minY + 1,
        width: maxX - minX + 1,
        x: minX,
        y: minY
    };
};

const padBounds = (
    bounds: {
        height: number;
        width: number;
        x: number;
        y: number;
    },
    sourceWidth: number,
    sourceHeight: number
): {
    height: number;
    width: number;
    x: number;
    y: number;
} => {
    const pad = Math.max(6, Math.round(Math.max(sourceWidth, sourceHeight) * CROP_PADDING_RATIO));
    const boundedX = Math.max(0, bounds.x - pad);
    const boundedY = Math.max(0, bounds.y - pad);
    const boundedMaxX = Math.min(sourceWidth - 1, bounds.x + bounds.width - 1 + pad);
    const boundedMaxY = Math.min(sourceHeight - 1, bounds.y + bounds.height - 1 + pad);

    return {
        height: boundedMaxY - boundedY + 1,
        width: boundedMaxX - boundedX + 1,
        x: boundedX,
        y: boundedY
    };
};

const getVisibleBounds = (
    canvas: HTMLCanvasElement
): {
    height: number;
    width: number;
    x: number;
    y: number;
} | null => {
    const context = getContext2D(canvas);

    if (!context) {
        return null;
    }

    try {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;
        let maxAlpha = 0;

        for (let index = 3; index < data.length; index += 4) {
            if (data[index] > maxAlpha) {
                maxAlpha = data[index];
            }
        }

        if (maxAlpha < BASE_ALPHA_THRESHOLD) {
            return null;
        }

        const thresholds = Array.from(
            new Set(
                CROP_SCAN_FACTORS.map((factor) => Math.max(BASE_ALPHA_THRESHOLD, Math.round(maxAlpha * factor)))
            )
        ).sort((left, right) => right - left);
        let bestBounds: ReturnType<typeof scanVisibleBounds> = null;
        let bestAreaRatio = Number.POSITIVE_INFINITY;

        for (const threshold of thresholds) {
            const bounds = scanVisibleBounds(data, canvas.width, canvas.height, threshold);

            if (!bounds) {
                continue;
            }

            const widthRatio = bounds.width / canvas.width;
            const heightRatio = bounds.height / canvas.height;
            const areaRatio = (bounds.width * bounds.height) / (canvas.width * canvas.height);
            const isDenseCandidate =
                widthRatio >= MIN_CROP_DIMENSION_RATIO &&
                heightRatio >= MIN_CROP_DIMENSION_RATIO &&
                areaRatio >= MIN_CROP_AREA_RATIO;

            if (isDenseCandidate && areaRatio < bestAreaRatio) {
                bestBounds = bounds;
                bestAreaRatio = areaRatio;
            }

            if (
                isDenseCandidate &&
                widthRatio <= MAX_FULL_FRAME_RATIO &&
                heightRatio <= MAX_FULL_FRAME_RATIO
            ) {
                return padBounds(bounds, canvas.width, canvas.height);
            }
        }

        if (bestBounds) {
            return padBounds(bestBounds, canvas.width, canvas.height);
        }

        return null;
    } catch {
        return null;
    }
};

const cropCanvas = (sourceCanvas: HTMLCanvasElement): HTMLCanvasElement => {
    const bounds = getVisibleBounds(sourceCanvas);

    if (!bounds) {
        return sourceCanvas;
    }

    if (bounds.x === 0 && bounds.y === 0 && bounds.width === sourceCanvas.width && bounds.height === sourceCanvas.height) {
        return sourceCanvas;
    }

    const canvas = createCanvas(bounds.width, bounds.height);
    const context = getContext2D(canvas);

    if (!context) {
        return sourceCanvas;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sourceCanvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);

    return canvas;
};

const buildColorCanvas = (image: HTMLImageElement, width: number): HTMLCanvasElement | null => {
    const sourceCanvas = renderSourceCanvas(image);

    if (!sourceCanvas) {
        return null;
    }

    const croppedCanvas = cropCanvas(sourceCanvas);
    const height = Math.max(320, Math.round(width / (croppedCanvas.width / croppedCanvas.height)));
    const canvas = createCanvas(width, height);
    const context = getContext2D(canvas);

    if (!context) {
        return null;
    }

    drawContainedCanvas(context, croppedCanvas, width, height);

    return canvas;
};

const buildMaskCanvas = (sourceCanvas: HTMLCanvasElement): HTMLCanvasElement | null => {
    const canvas = createCanvas(sourceCanvas.width, sourceCanvas.height);
    const context = getContext2D(canvas);
    const sourceContext = getContext2D(sourceCanvas);

    if (!context || !sourceContext) {
        return null;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sourceCanvas, 0, 0);

    try {
        const imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        const { data } = imageData;

        for (let index = 0; index < data.length; index += 4) {
            const alpha = data[index + 3] / 255;
            const luminance =
                (data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722) * alpha;
            data[index] = luminance;
            data[index + 1] = luminance;
            data[index + 2] = luminance;
            data[index + 3] = 255;
        }

        context.putImageData(imageData, 0, 0);
    } catch {
        return sourceCanvas;
    }

    return canvas;
};

const buildHeightCanvas = (maskCanvas: HTMLCanvasElement): HTMLCanvasElement | null => {
    const canvas = createCanvas(maskCanvas.width, maskCanvas.height);
    const context = getContext2D(canvas);

    if (!context) {
        return null;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    try {
        context.filter = 'blur(14px) saturate(1.15)';
    } catch {
        context.filter = 'none';
    }

    context.globalAlpha = 0.95;
    context.drawImage(maskCanvas, 0, 0);
    context.filter = 'none';
    context.globalAlpha = 1;
    context.drawImage(maskCanvas, 0, 0);

    try {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;

        for (let index = 0; index < data.length; index += 4) {
            const boosted = Math.min(255, data[index] * 1.18);
            data[index] = boosted;
            data[index + 1] = boosted;
            data[index + 2] = boosted;
            data[index + 3] = 255;
        }

        context.putImageData(imageData, 0, 0);
    } catch {
        return canvas;
    }

    return canvas;
};

const createTexture = (canvas: HTMLCanvasElement, colorSpace: typeof SRGBColorSpace | typeof NoColorSpace): CanvasTexture => {
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = colorSpace;
    texture.generateMipmaps = false;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    texture.needsUpdate = true;

    return texture;
};

export const hasWebGLSupport = (): boolean => {
    if (typeof document === 'undefined') {
        return false;
    }

    try {
        const probe = document.createElement('canvas');
        return Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl') ?? probe.getContext('experimental-webgl'));
    } catch {
        return false;
    }
};

export const loadRelicTextures = async (svgSource: string): Promise<RelicTextureSet> => {
    if (typeof document === 'undefined') {
        throw new Error('Document is unavailable for intro texture creation.');
    }

    const image = await loadImage(svgSource);
    const width = TEXTURE_WIDTH;
    const colorCanvas = buildColorCanvas(image, width);

    if (!colorCanvas) {
        throw new Error('Unable to build intro color texture.');
    }

    const aspectRatio = colorCanvas.width / colorCanvas.height;
    const height = colorCanvas.height;

    const alphaCanvas = buildMaskCanvas(colorCanvas);
    const heightCanvas = alphaCanvas ? buildHeightCanvas(alphaCanvas) : null;

    if (!alphaCanvas || !heightCanvas) {
        throw new Error('Unable to build intro relief textures.');
    }

    const colorTexture = createTexture(colorCanvas, SRGBColorSpace);
    const alphaTexture = createTexture(alphaCanvas, NoColorSpace);
    const heightTexture = createTexture(heightCanvas, NoColorSpace);

    return {
        alphaTexture,
        aspectRatio,
        colorTexture,
        dispose: () => {
            colorTexture.dispose();
            alphaTexture.dispose();
            heightTexture.dispose();
        },
        height,
        heightTexture,
        width
    };
};

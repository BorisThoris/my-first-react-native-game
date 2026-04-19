/**
 * Preloads raster URLs from {@link CARD_ILLUSTRATION_REGISTRY} so face overlays can draw
 * tarot panels via {@link drawIllustrationInCanvasOverlay} without waiting on first decode.
 */

const imagesByUrl = new Map<string, HTMLImageElement>();

export const preloadCardIllustrationImages = (urls: readonly string[]): Promise<void> =>
    Promise.all(urls.map((url) => loadCardIllustrationImage(url))).then(() => undefined);

function loadCardIllustrationImage(url: string): Promise<void> {
    const existing = imagesByUrl.get(url);
    if (existing?.naturalWidth) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = (): void => {
            imagesByUrl.set(url, img);
            resolve();
        };
        img.onerror = (): void => {
            resolve();
        };
        img.src = url;
    });
}

/** Resolved asset URL → decoded image, if preload succeeded. */
export const getCardIllustrationImageByUrl = (url: string): HTMLImageElement | null =>
    imagesByUrl.get(url) ?? null;

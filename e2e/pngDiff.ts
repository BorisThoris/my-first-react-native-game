import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export const countPngPixelDiffs = (a: Buffer, b: Buffer): { diffPixels: number; width: number; height: number } => {
    const imgA = PNG.sync.read(a);
    const imgB = PNG.sync.read(b);

    if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
        throw new Error(`PNG size mismatch: ${imgA.width}x${imgA.height} vs ${imgB.width}x${imgB.height}`);
    }

    const { width, height } = imgA;
    const diff = Buffer.alloc(width * height * 4);
    const diffPixels = pixelmatch(imgA.data, imgB.data, diff, width, height, {
        threshold: 0.22,
        includeAA: true
    });

    return { diffPixels, width, height };
};

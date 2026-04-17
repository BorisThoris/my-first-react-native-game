import { vi } from 'vitest';

const createGradientStub = (): CanvasGradient =>
    ({
        addColorStop: vi.fn()
    }) as unknown as CanvasGradient;

const createCanvasContextStub = (canvas: HTMLCanvasElement): CanvasRenderingContext2D =>
    ({
        arc: vi.fn(),
        beginPath: vi.fn(),
        canvas,
        clearRect: vi.fn(),
        clip: vi.fn(),
        closePath: vi.fn(),
        createImageData: vi.fn((width: number, height: number) => ({
            colorSpace: 'srgb',
            data: new Uint8ClampedArray(width * height * 4),
            height,
            width
        })),
        createLinearGradient: vi.fn(() => createGradientStub()),
        createRadialGradient: vi.fn(() => createGradientStub()),
        drawImage: vi.fn(),
        fill: vi.fn(),
        fillRect: vi.fn(),
        fillStyle: '#000000',
        fillText: vi.fn(),
        filter: 'none',
        getImageData: vi.fn((x: number, y: number, width: number, height: number) => ({
            colorSpace: 'srgb',
            data: new Uint8ClampedArray(width * height * 4),
            height,
            width
        })),
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
        lineJoin: 'miter',
        lineTo: vi.fn(),
        lineWidth: 1,
        measureText: vi.fn((text: string) => ({ width: text.length * 12 })),
        moveTo: vi.fn(),
        putImageData: vi.fn(),
        quadraticCurveTo: vi.fn(),
        restore: vi.fn(),
        rotate: vi.fn(),
        roundRect: vi.fn(),
        save: vi.fn(),
        scale: vi.fn(),
        setTransform: vi.fn(),
        stroke: vi.fn(),
        strokeRect: vi.fn(),
        strokeStyle: '#000000',
        strokeText: vi.fn(),
        textAlign: 'center',
        textBaseline: 'middle',
        translate: vi.fn()
    }) as unknown as CanvasRenderingContext2D;

export const installCanvas2dMock = (): (() => void) => {
    const contexts = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>();
    const getContextMock = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
        contextId: string
    ) {
        if (contextId !== '2d') {
            return null;
        }
        const canvas = this as HTMLCanvasElement;
        const existing = contexts.get(canvas);
        if (existing) {
            return existing;
        }
        const context = createCanvasContextStub(canvas);
        contexts.set(canvas, context);
        return context;
    });

    return () => {
        getContextMock.mockRestore();
    };
};

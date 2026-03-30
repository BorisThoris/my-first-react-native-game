import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MainMenuBackground from './MainMenuBackground';

const initSpy = vi.fn(async () => {});
const startSpy = vi.fn();
const stopSpy = vi.fn();
const renderSpy = vi.fn();
const destroySpy = vi.fn();
const tickerAddSpy = vi.fn();
const tickerRemoveSpy = vi.fn();
const textureDestroySpy = vi.fn();

class MockContainer {
    children: Array<MockContainer | MockSprite> = [];
    destroy = vi.fn();

    addChild<T extends MockContainer | MockSprite>(child: T): T {
        this.children.push(child);
        return child;
    }

    removeChildren(): Array<MockContainer | MockSprite> {
        const children = [...this.children];
        this.children = [];
        return children;
    }
}

class MockSprite {
    alpha = 1;
    anchor = { set: vi.fn() };
    destroy = vi.fn();
    height = 0;
    rotation = 0;
    tint = 0;
    width = 0;
    x = 0;
    y = 0;

    constructor(public texture: { destroy: typeof textureDestroySpy; height: number; width: number }) {}
}

class MockApplication {
    canvas = document.createElement('canvas');
    destroy = destroySpy;
    init = initSpy;
    render = renderSpy;
    stage = new MockContainer();
    start = startSpy;
    stop = stopSpy;
    ticker = {
        add: tickerAddSpy,
        remove: tickerRemoveSpy
    };
}

vi.mock('pixi.js', () => ({
    Application: MockApplication,
    Container: MockContainer,
    Sprite: MockSprite,
    Texture: {
        from: vi.fn((source: HTMLCanvasElement) => ({
            destroy: textureDestroySpy,
            height: source.height || 1,
            width: source.width || 1
        }))
    }
}));

const createGradient = () => ({
    addColorStop: vi.fn()
});

beforeEach(() => {
    initSpy.mockClear();
    startSpy.mockClear();
    stopSpy.mockClear();
    renderSpy.mockClear();
    destroySpy.mockClear();
    tickerAddSpy.mockClear();
    tickerRemoveSpy.mockClear();
    textureDestroySpy.mockClear();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
        ((contextId: string) => {
            if (contextId !== '2d') {
                return null;
            }

            const gradient = createGradient();

            return {
                beginPath: vi.fn(),
                createLinearGradient: vi.fn(() => gradient),
                createRadialGradient: vi.fn(() => gradient),
                fillRect: vi.fn(),
                lineTo: vi.fn(),
                moveTo: vi.fn(),
                stroke: vi.fn()
            } as unknown as CanvasRenderingContext2D;
        }) as typeof HTMLCanvasElement.prototype.getContext
    );
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('MainMenuBackground', () => {
    it('initializes Pixi with a transparent auto-resizing canvas and destroys it on unmount', async () => {
        const { unmount } = render(<MainMenuBackground height={720} reduceMotion={false} width={1280} />);

        await waitFor(() => {
            expect(initSpy).toHaveBeenCalledTimes(1);
        });

        expect(initSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                autoDensity: true,
                autoStart: false,
                backgroundAlpha: 0,
                resizeTo: expect.any(HTMLElement)
            })
        );
        expect(tickerAddSpy).toHaveBeenCalledTimes(1);
        expect(startSpy).toHaveBeenCalledTimes(1);

        unmount();

        expect(destroySpy).toHaveBeenCalledWith({ removeView: true }, { children: true });
    });

    it('builds a static scene when reduced motion is enabled', async () => {
        render(<MainMenuBackground height={720} reduceMotion width={1280} />);

        await waitFor(() => {
            expect(initSpy).toHaveBeenCalledTimes(1);
        });

        expect(tickerAddSpy).not.toHaveBeenCalled();
        expect(startSpy).not.toHaveBeenCalled();
        expect(renderSpy).toHaveBeenCalled();
    });

    it('falls back to the static CSS background when Pixi initialization fails', async () => {
        initSpy.mockImplementationOnce(async () => {
            throw new Error('renderer unavailable');
        });

        const { container } = render(<MainMenuBackground height={720} reduceMotion={false} width={1280} />);

        await waitFor(() => {
            expect(container.querySelector('[data-render-status="fallback"]')).not.toBeNull();
        });

        expect(startSpy).not.toHaveBeenCalled();
        expect(tickerAddSpy).not.toHaveBeenCalled();
    });
});

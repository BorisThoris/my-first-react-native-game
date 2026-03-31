import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformTiltProvider } from '../platformTilt/PlatformTiltProvider';
import StartupIntro from './StartupIntro';
import { getIntroExitDurationMs } from './startupIntroConfig';

const mockHasWebGLSupport = vi.fn();
const mockLoadRelicTextures = vi.fn();

vi.mock('./startupIntroTextures', () => ({
    hasWebGLSupport: () => mockHasWebGLSupport(),
    loadRelicTextures: (source: string) => mockLoadRelicTextures(source)
}));

vi.mock('./tileTextures', () => ({
    preloadTileTextureImages: vi.fn(() => Promise.resolve())
}));

const renderIntro = (ui: ReactElement): ReturnType<typeof render> =>
    render(<PlatformTiltProvider>{ui}</PlatformTiltProvider>);

describe('StartupIntro', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockHasWebGLSupport.mockReset();
        mockLoadRelicTextures.mockReset();
        mockHasWebGLSupport.mockReturnValue(false);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('auto completes after the full runtime by default', () => {
        const onComplete = vi.fn();

        renderIntro(<StartupIntro onComplete={onComplete} reduceMotion={false} />);

        expect(screen.getByRole('dialog', { name: /startup relic intro/i })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: /obsidian relic sigil/i })).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(4199);
        });

        expect(onComplete).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('uses the shortened reduced-motion runtime and supports keyboard skip', () => {
        const onComplete = vi.fn();

        renderIntro(<StartupIntro onComplete={onComplete} reduceMotion={true} />);

        act(() => {
            vi.advanceTimersByTime(1399);
        });

        expect(onComplete).not.toHaveBeenCalled();

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(onComplete).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(getIntroExitDurationMs(true));
        });

        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('skips when the intro overlay is clicked', () => {
        const onComplete = vi.fn();

        renderIntro(<StartupIntro onComplete={onComplete} reduceMotion={false} />);

        fireEvent.pointerDown(screen.getByRole('dialog', { name: /startup relic intro/i }), {
            button: 0,
            pointerType: 'mouse'
        });

        expect(onComplete).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(getIntroExitDurationMs(false));
        });

        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('falls back cleanly when 3D texture generation fails', async () => {
        const onComplete = vi.fn();
        mockHasWebGLSupport.mockReturnValue(true);
        mockLoadRelicTextures.mockRejectedValueOnce(new Error('svg texture parse failed'));

        renderIntro(<StartupIntro onComplete={onComplete} reduceMotion={false} />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockLoadRelicTextures).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('img', { name: /obsidian relic sigil/i })).toBeInTheDocument();
    });
});

describe('StartupIntro motion CTA', () => {
    let requestPermissionSpy: ReturnType<typeof vi.fn>;
    const originalDeviceOrientation = window.DeviceOrientationEvent;
    const originalMatchMedia = window.matchMedia;

    beforeEach(() => {
        mockHasWebGLSupport.mockReturnValue(false);
        requestPermissionSpy = vi.fn(() => Promise.resolve('granted'));

        const MockCtor = function MockDeviceOrientation() {
            return new Event('deviceorientation');
        } as unknown as typeof DeviceOrientationEvent;

        (MockCtor as unknown as { requestPermission: typeof requestPermissionSpy }).requestPermission = requestPermissionSpy;
        (globalThis as unknown as { DeviceOrientationEvent: typeof DeviceOrientationEvent }).DeviceOrientationEvent = MockCtor;
        window.DeviceOrientationEvent = MockCtor;

        window.matchMedia = vi.fn((query: string) => {
            const coarse = query.includes('pointer: coarse');

            return {
                matches: coarse,
                media: query,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn(),
                onchange: null
            } as MediaQueryList;
        }) as typeof window.matchMedia;
    });

    afterEach(() => {
        (globalThis as unknown as { DeviceOrientationEvent?: typeof DeviceOrientationEvent }).DeviceOrientationEvent =
            originalDeviceOrientation;
        window.DeviceOrientationEvent = originalDeviceOrientation;
        window.matchMedia = originalMatchMedia;
    });

    it('shows Enable motion when permission is promptable and invokes requestPermission without completing the intro', async () => {
        const onComplete = vi.fn();

        renderIntro(<StartupIntro onComplete={onComplete} reduceMotion={false} />);

        const cta = await screen.findByTestId('intro-motion-cta');

        expect(cta).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(cta);
            await Promise.resolve();
        });

        expect(requestPermissionSpy).toHaveBeenCalledTimes(1);
        expect(onComplete).not.toHaveBeenCalled();
    });

    it('lets a normal overlay pointer-down still complete the intro after exit timing', () => {
        vi.useFakeTimers();

        const onComplete = vi.fn();

        renderIntro(<StartupIntro onComplete={onComplete} reduceMotion={false} />);

        fireEvent.pointerDown(screen.getByRole('dialog', { name: /startup relic intro/i }), {
            button: 0,
            pointerType: 'mouse'
        });

        act(() => {
            vi.advanceTimersByTime(getIntroExitDurationMs(false));
        });

        expect(onComplete).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });
});

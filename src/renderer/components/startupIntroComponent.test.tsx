import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StartupIntro from './StartupIntro';
import { getIntroExitDurationMs } from './startupIntroConfig';

const mockHasWebGLSupport = vi.fn();
const mockLoadRelicTextures = vi.fn();

vi.mock('./startupIntroTextures', () => ({
    hasWebGLSupport: () => mockHasWebGLSupport(),
    loadRelicTextures: (source: string) => mockLoadRelicTextures(source)
}));

describe('StartupIntro', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockHasWebGLSupport.mockReset();
        mockLoadRelicTextures.mockReset();
        mockHasWebGLSupport.mockReturnValue(false);
    });

    it('auto completes after the full runtime by default', () => {
        const onComplete = vi.fn();

        render(<StartupIntro onComplete={onComplete} reduceMotion={false} />);

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

        render(<StartupIntro onComplete={onComplete} reduceMotion={true} />);

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

        render(<StartupIntro onComplete={onComplete} reduceMotion={false} />);

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

        render(<StartupIntro onComplete={onComplete} reduceMotion={false} />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockLoadRelicTextures).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('img', { name: /obsidian relic sigil/i })).toBeInTheDocument();
    });
});

import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { musicGainFromSettings, useGameplayMusic } from './gameplayMusic';

class MockAudioElement {
    static instances: MockAudioElement[] = [];

    loop = false;
    preload = '';
    volume = 1;
    play = vi.fn(() => Promise.resolve());
    pause = vi.fn();
    load = vi.fn();
    removeAttribute = vi.fn();

    constructor(_src?: string) {
        MockAudioElement.instances.push(this);
    }
}

const installMockAudio = (): void => {
    MockAudioElement.instances = [];
    vi.stubGlobal('Audio', MockAudioElement);
};

afterEach(() => {
    vi.unstubAllGlobals();
    MockAudioElement.instances = [];
});

describe('musicGainFromSettings', () => {
    it('multiplies clamped master and music volumes', () => {
        expect(musicGainFromSettings(0.5, 0.25)).toBe(0.125);
        expect(musicGainFromSettings(2, 0.5)).toBe(0.5);
        expect(musicGainFromSettings(-1, 0.5)).toBe(0);
    });
});

describe('useGameplayMusic', () => {
    it('plays the fallback loop when active and unsuppressed', async () => {
        installMockAudio();

        renderHook(() =>
            useGameplayMusic({
                active: true,
                masterVolume: 0.8,
                musicVolume: 0.5
            })
        );

        const audio = MockAudioElement.instances[0];
        expect(audio?.loop).toBe(true);
        expect(audio?.preload).toBe('auto');
        expect(audio?.volume).toBe(0.4);
        await waitFor(() => expect(audio?.play).toHaveBeenCalledTimes(1));
    });

    it('pauses the fallback loop while external music is suppressing it', async () => {
        installMockAudio();

        const { rerender } = renderHook(
            ({ suppressed }) =>
                useGameplayMusic({
                    active: true,
                    masterVolume: 1,
                    musicVolume: 1,
                    suppressed
                }),
            { initialProps: { suppressed: false } }
        );

        const audio = MockAudioElement.instances[0];
        await waitFor(() => expect(audio?.play).toHaveBeenCalledTimes(1));

        rerender({ suppressed: true });

        expect(audio?.pause).toHaveBeenCalledTimes(1);
    });
});

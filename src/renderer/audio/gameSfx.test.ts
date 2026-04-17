import { afterEach, describe, expect, it, vi } from 'vitest';
import { __resetGameSfxEngineForTests, playFlipSfx, playMatchSfx, sfxGainFromSettings } from './gameSfx';

describe('gameSfx', () => {
    const oscillators: { addEventListener: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[] = [];

    afterEach(() => {
        __resetGameSfxEngineForTests();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        oscillators.length = 0;
    });

    it('respects mute instantly (does not schedule nodes)', () => {
        const createOscillator = vi.fn(() => {
            const o = {
                type: 'sine' as OscillatorType,
                frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
                connect: vi.fn(),
                start: vi.fn(),
                stop: vi.fn(),
                addEventListener: vi.fn()
            };
            oscillators.push(o);
            return o;
        });
        const createGain = vi.fn(() => ({
            gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
            connect: vi.fn()
        }));

        vi.stubGlobal(
            'AudioContext',
            class {
                currentTime = 0;
                destination = {};
                createOscillator = createOscillator;
                createGain = createGain;
                close = (): Promise<void> => Promise.resolve();
            }
        );

        playFlipSfx(sfxGainFromSettings(1, 0));
        expect(createOscillator).not.toHaveBeenCalled();
    });

    it('steals oldest match voice when polyphony is exceeded', () => {
        const stops: string[] = [];
        const createOscillator = vi.fn(() => {
            const id = `osc-${stops.length}`;
            const o = {
                id,
                type: 'sine' as OscillatorType,
                frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
                connect: vi.fn(),
                start: vi.fn(),
                stop: vi.fn(() => {
                    stops.push(id);
                }),
                addEventListener: vi.fn()
            };
            oscillators.push(o);
            return o;
        });
        const createGain = vi.fn(() => ({
            gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
            connect: vi.fn()
        }));

        vi.stubGlobal(
            'AudioContext',
            class {
                currentTime = 0;
                destination = {};
                createOscillator = createOscillator;
                createGain = createGain;
                close = (): Promise<void> => Promise.resolve();
            }
        );

        const g = sfxGainFromSettings(1, 1);
        for (let i = 0; i < 5; i += 1) {
            playMatchSfx(g);
        }
        expect(stops.length).toBeGreaterThanOrEqual(1);
    });
});

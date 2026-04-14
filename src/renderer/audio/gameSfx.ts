import type { RunState } from '../../shared/contracts';

/**
 * Lightweight gameplay SFX using Web Audio (no asset files). Respects master × SFX volume from settings.
 * Call `resumeAudioContext()` once after a user gesture if the browser suspended the context.
 */
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!audioContext) {
        try {
            audioContext = new AudioContext();
        } catch {
            return null;
        }
    }
    return audioContext;
};

export const resumeAudioContext = (): void => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        void ctx.resume();
    }
};

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Effective linear gain from settings (0–1 each). */
export const sfxGainFromSettings = (masterVolume: number, sfxVolume: number): number =>
    clamp01(masterVolume) * clamp01(sfxVolume);

const playTone = (options: {
    frequency: number;
    durationSec: number;
    gain: number;
    type: OscillatorType;
    frequencyEnd?: number;
}): void => {
    if (options.gain <= 0.001) {
        return;
    }
    const ctx = getAudioContext();
    if (!ctx) {
        return;
    }
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = options.type;
    osc.frequency.setValueAtTime(options.frequency, ctx.currentTime);
    if (options.frequencyEnd != null && options.frequencyEnd !== options.frequency) {
        osc.frequency.exponentialRampToValueAtTime(
            Math.max(20, options.frequencyEnd),
            ctx.currentTime + options.durationSec
        );
    }
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(options.gain * 0.35, ctx.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + options.durationSec);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + options.durationSec + 0.02);
};

export const playFlipSfx = (gain: number): void => {
    playTone({ frequency: 520, durationSec: 0.05, gain, type: 'sine' });
};

export const playMatchSfx = (gain: number): void => {
    playTone({ frequency: 660, frequencyEnd: 880, durationSec: 0.14, gain, type: 'triangle' });
};

export const playMismatchSfx = (gain: number): void => {
    playTone({ frequency: 180, frequencyEnd: 120, durationSec: 0.18, gain, type: 'sawtooth' });
};

/** After `resolveBoardTurn`: play match vs mismatch feedback from stat deltas. */
export const playResolveSfx = (before: RunState, after: RunState, gain: number): void => {
    if (gain <= 0.001) {
        return;
    }
    if (after.stats.matchesFound > before.stats.matchesFound) {
        playMatchSfx(gain);
    } else if (after.stats.tries > before.stats.tries) {
        playMismatchSfx(gain);
    }
};

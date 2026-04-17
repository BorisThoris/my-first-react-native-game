import type { RunState } from '../../shared/contracts';

/**
 * Lightweight gameplay SFX using Web Audio (no asset files). Respects master × SFX volume from settings.
 * Call `resumeAudioContext()` once after a user gesture if the browser suspended the context.
 */
let audioContext: AudioContext | null = null;

/** Clears scheduling state between Vitest cases (Web Audio singleton otherwise sticks to the first mock). */
export const __resetGameSfxEngineForTests = (): void => {
    silenceAllVoices();
    if (audioContext && typeof audioContext.close === 'function') {
        void audioContext.close().catch(() => undefined);
    }
    audioContext = null;
};

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

type SfxCategory = 'flip' | 'match' | 'mismatch';

interface ScheduledVoice {
    category: SfxCategory;
    gain: GainNode;
    osc: OscillatorNode;
    startTime: number;
}

/** Max simultaneous one-shots per category (cascade bursts steal the oldest voice). */
const MAX_POLYPHONY: Record<SfxCategory, number> = {
    flip: 5,
    match: 4,
    mismatch: 4
};

const activeVoices: ScheduledVoice[] = [];

const removeVoice = (voice: ScheduledVoice): void => {
    const i = activeVoices.indexOf(voice);
    if (i >= 0) {
        activeVoices.splice(i, 1);
    }
};

const stopVoice = (voice: ScheduledVoice): void => {
    try {
        voice.osc.stop();
    } catch {
        /* already stopped */
    }
    try {
        voice.osc.disconnect();
        voice.gain.disconnect();
    } catch {
        /* ignore */
    }
    removeVoice(voice);
};

const stealOldestInCategory = (category: SfxCategory): void => {
    const cap = MAX_POLYPHONY[category];
    let inCat = activeVoices.filter((v) => v.category === category);
    while (inCat.length >= cap) {
        inCat.sort((a, b) => a.startTime - b.startTime);
        const oldest = inCat[0];
        if (!oldest) {
            break;
        }
        stopVoice(oldest);
        inCat = activeVoices.filter((v) => v.category === category);
    }
};

const silenceAllVoices = (): void => {
    while (activeVoices.length > 0) {
        const v = activeVoices[0];
        if (v) {
            stopVoice(v);
        }
    }
};

const playTone = (
    options: {
        frequency: number;
        durationSec: number;
        gain: number;
        type: OscillatorType;
        frequencyEnd?: number;
        category: SfxCategory;
    }
): void => {
    if (options.gain <= 0.001) {
        silenceAllVoices();
        return;
    }
    const ctx = getAudioContext();
    if (!ctx) {
        return;
    }
    stealOldestInCategory(options.category);
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
    const voice: ScheduledVoice = {
        category: options.category,
        osc,
        gain: g,
        startTime: ctx.currentTime
    };
    activeVoices.push(voice);
    const cleanupMs = (options.durationSec + 0.05) * 1000;
    osc.addEventListener('ended', () => {
        removeVoice(voice);
    });
    globalThis.setTimeout(() => {
        removeVoice(voice);
    }, cleanupMs + 50);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + options.durationSec + 0.02);
};

export const playFlipSfx = (gain: number): void => {
    playTone({ frequency: 520, durationSec: 0.05, gain, type: 'sine', category: 'flip' });
};

export const playMatchSfx = (gain: number): void => {
    playTone({
        frequency: 660,
        frequencyEnd: 880,
        durationSec: 0.14,
        gain,
        type: 'triangle',
        category: 'match'
    });
};

export const playMismatchSfx = (gain: number): void => {
    playTone({
        frequency: 180,
        frequencyEnd: 120,
        durationSec: 0.18,
        gain,
        type: 'sawtooth',
        category: 'mismatch'
    });
};

/** After `resolveBoardTurn`: play match vs mismatch feedback from stat deltas. */
export const playResolveSfx = (before: RunState, after: RunState, gain: number): void => {
    if (gain <= 0.001) {
        silenceAllVoices();
        return;
    }
    if (after.stats.matchesFound > before.stats.matchesFound) {
        playMatchSfx(gain);
    } else if (after.stats.tries > before.stats.tries) {
        playMismatchSfx(gain);
    }
};

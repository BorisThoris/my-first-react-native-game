#!/usr/bin/env node
/**
 * Writes short PCM WAV one-shots + a chill bed so the repo ships audible placeholders
 * when ACE-Step is not installed. Replace with ACE-Step exports + trim when available.
 *
 * Chill loop aesthetic (aligned with shipped art — see `src/renderer/styles/theme.ts`,
 * `assets/ui/brand-crest.svg`, card illustrations): **dark vault + torch gold/ember warmth +
 * cyan/violet crystal accents**. Pad-forward, warm low pulse, **muted “cloth” backbeat**
 * (no piercing snare). Optional soft arps read as faint crystal sparkle.
 *
 *   node scripts/audio-pipeline/generate-procedural-sfx-wavs.mjs
 *   yarn audio:placeholders
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');
const sfxDir = path.join(repoRoot, 'src/renderer/assets/audio/sfx');
const musicDir = path.join(repoRoot, 'src/renderer/assets/audio/music');

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/** @param {Float32Array} samples Mono -1..1 @param {number} sampleRate */
function writeWav(outPath, samples, sampleRate) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * 2;
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    let off = 44;
    for (let i = 0; i < samples.length; i += 1) {
        buffer.writeInt16LE(Math.round(clamp(samples[i], -1, 1) * 32767), off);
        off += 2;
    }

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buffer);
}

function sineTone(sr, durSec, freq, gain) {
    const n = Math.floor(sr * durSec);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i += 1) {
        const env = Math.sin((Math.PI * i) / Math.max(1, n - 1));
        const t = i / sr;
        out[i] = gain * env * Math.sin(2 * Math.PI * freq * t);
    }
    return out;
}

function twoTone(sr, durSec, f0, f1, gain) {
    const n = Math.floor(sr * durSec);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i += 1) {
        const env = Math.sin((Math.PI * i) / Math.max(1, n - 1));
        const t = i / sr;
        out[i] = gain * env * (0.55 * Math.sin(2 * Math.PI * f0 * t) + 0.45 * Math.sin(2 * Math.PI * f1 * t));
    }
    return out;
}

/** Deterministic white noise [-1,1] for snare/hats (reproducible builds). */
function noiseSample(seedRef) {
    seedRef.v = (seedRef.v * 1103515245 + 12345) >>> 0;
    return (seedRef.v / 0x7fffffff) * 2 - 1;
}

/** Warm sub kick — softer click than club kicks; dungeon pulse not EDM slap. */
function mixKick(buffer, offset, sr) {
    const len = Math.floor(sr * 0.098);
    const seedRef = { v: offset >>> 0 };
    for (let i = 0; i < len && offset + i < buffer.length; i += 1) {
        const t = i / sr;
        const progress = i / len;
        const env = Math.pow(1 - progress, 2.9) * 0.94;
        const f = 172 * Math.pow(52 / 172, progress);
        const clickMs = sr * 0.0028;
        const click =
            i < Math.floor(clickMs) ? noiseSample(seedRef) * 0.1 * (1 - i / Math.max(1, clickMs)) : 0;
        buffer[offset + i] += click + env * 0.48 * Math.sin(2 * Math.PI * f * t);
    }
}

/**
 * Muted backbeat — low-passed noise + soft low-mid thunk (no bright snare crack / ringing highs).
 */
function mixSoftBackbeat(buffer, offset, sr) {
    const len = Math.min(Math.floor(sr * 0.078), buffer.length - offset);
    const seedRef = { v: (offset + 999) >>> 0 };
    let lp1 = 0;
    let lp2 = 0;
    for (let i = 0; i < len; i += 1) {
        const progress = i / len;
        const env = Math.pow(1 - progress, 2.4);
        const white = noiseSample(seedRef);
        lp1 = lp1 * 0.86 + white * 0.14;
        lp2 = lp2 * 0.82 + lp1 * 0.18;
        const thunk = env * 0.045 * Math.sin(2 * Math.PI * 208 * (i / sr));
        buffer[offset + i] += lp2 * env * 0.095 + thunk;
    }
}

/** Soft hat burst — quieter, duller decay (sits under pads). */
function mixSoftHat(buffer, offset, sr, velocity) {
    const len = Math.min(Math.floor(sr * 0.048), buffer.length - offset);
    const seedRef = { v: (offset + 2048) >>> 0 };
    let lp = 0;
    for (let i = 0; i < len; i += 1) {
        const env = Math.pow(1 - i / len, 6);
        lp = lp * 0.72 + noiseSample(seedRef) * 0.28;
        buffer[offset + i] += lp * env * velocity * 0.28;
    }
}

/** Soft sub-bass “thump” — short rounded envelope (no long sine plateau → fewer giant waveform peaks). */
function mixBassNote(buffer, offset, sr, freqHz, durSec, velocity) {
    const len = Math.min(Math.floor(sr * durSec), buffer.length - offset);
    if (len < 2) return;
    const peakIdx = Math.max(1, Math.floor(len * 0.14));
    const BASS_GAIN = 0.14;
    for (let i = 0; i < len; i += 1) {
        const t = i / sr;
        let env;
        if (i < peakIdx) {
            env = Math.sin((i / peakIdx) * (Math.PI / 2));
        } else {
            env = Math.exp((-6.2 * (i - peakIdx)) / Math.max(len - peakIdx, 1));
        }
        buffer[offset + i] += velocity * env * BASS_GAIN * Math.sin(2 * Math.PI * freqHz * t);
    }
}

/** Warm pad: stacked detuned sines — slower attack/release (“relic chamber”). */
function mixPadChord(buffer, startSample, sr, durationSamples, freqs, gain) {
    const len = Math.min(durationSamples, buffer.length - startSample);
    const seeds = freqs.map((_, j) => j * 9973);
    for (let i = 0; i < len; i += 1) {
        let s = 0;
        const att = Math.min(1, i / Math.max(1, sr * 0.72));
        const rel = Math.min(1, (len - i) / Math.max(1, sr * 0.52));
        const zone = att * rel;
        for (let k = 0; k < freqs.length; k += 1) {
            const detune = 1 + (seeds[k] % 7) * 0.00012;
            const f = freqs[k] * detune;
            const t = (startSample + i) / sr;
            s += Math.sin(2 * Math.PI * f * t + k * 0.7);
        }
        buffer[startSample + i] += gain * zone * (s / freqs.length) * 0.24;
    }
}

/** Short decay pluck for sparse crystal arp layer. */
function mixPluck(buffer, offset, sr, freqHz, gain, durSec) {
    const len = Math.min(Math.floor(sr * durSec), buffer.length - offset);
    for (let i = 0; i < len; i += 1) {
        const env = Math.exp(-8.5 * (i / Math.max(1, len - 1)));
        const t = i / sr;
        buffer[offset + i] += gain * env * Math.sin(2 * Math.PI * freqHz * t);
    }
}

/** Very light stepped arpeggio on chord tones (cyan/crystal suggestion, low blend). */
function mixSparseArp(buffer, barStart, sr, barSamples, chordFreqs, mixGain) {
    const steps = 8;
    const stepSamples = Math.floor(barSamples / steps);
    const pattern = [0, 2, 1, 2, 0, 1, 2, 1];
    for (let s = 0; s < steps; s += 1) {
        const idx = pattern[s % pattern.length];
        const f = chordFreqs[idx] * 2;
        const off = barStart + s * stepSamples;
        mixPluck(buffer, off, sr, f, mixGain * 0.055, (stepSamples * 1.6) / sr);
    }
}

/**
 * Chill loop: 4/4 @ BPM — kick 1&3, soft backbeat 2&4, sparse hats, bass, pads + light arp.
 * Integer samples/quarter for seamless loop at bar boundaries.
 */
function generateChillLoop(sr, bpm, bars) {
    const spq = Math.round((sr * 60) / bpm);
    if (Math.abs(spq - (sr * 60) / bpm) > 1e-6) {
        throw new Error(`Pick bpm so ${sr}*60/bpm is integral (got ${(sr * 60) / bpm})`);
    }
    const totalSamples = bars * 4 * spq;
    const buffer = new Float32Array(totalSamples);

    // Am | F | C | G — roots (Hz) for bass; pads as chord stacks (fundamentals + thirds + fifths).
    const progression = [
        { root: 55, pad: [110, 130.81, 164.81] }, // Am
        { root: 43.65, pad: [87.31, 130.81, 174.61] }, // F
        { root: 65.41, pad: [130.81, 164.81, 196] }, // C
        { root: 49, pad: [98, 123.47, 146.83] } // G
    ];

    const barSamples = 4 * spq;

    for (let bar = 0; bar < bars; bar += 1) {
        const chord = progression[bar % 4];
        const barStart = bar * barSamples;

        mixPadChord(buffer, barStart, sr, barSamples, chord.pad, 1.02);
        mixSparseArp(buffer, barStart, sr, barSamples, chord.pad, 0.92);

        for (let q = 0; q < 4; q += 1) {
            const qs = barStart + q * spq;

            if (q === 0 || q === 2) {
                mixKick(buffer, qs, sr);
            }
            if (q === 1 || q === 3) {
                mixSoftBackbeat(buffer, qs, sr);
            }

            mixSoftHat(buffer, qs, sr, 0.056);
            const half = Math.floor(spq / 2);
            if (q < 3) {
                mixSoftHat(buffer, qs + half, sr, 0.028);
            }
            if (bar % 2 === 0 && q === 0) {
                mixSoftHat(buffer, qs + Math.floor(spq * 0.25), sr, 0.022);
            }

            /* Shorter notes + lower velocities — bass stays felt, not dominant in the mix. */
            const bassDur = (spq * 0.48) / sr;
            const rootHz = chord.root;
            const fifthHz = rootHz * 1.498307;
            if (q === 0) {
                mixBassNote(buffer, qs, sr, rootHz, bassDur, 0.52);
            } else if (q === 1) {
                mixBassNote(buffer, qs, sr, fifthHz, bassDur * 0.88, 0.44);
            } else if (q === 2) {
                mixBassNote(buffer, qs, sr, rootHz * 1.02, bassDur, 0.48);
            } else {
                mixBassNote(buffer, qs + Math.floor(spq * 0.1), sr, rootHz * 1.25992, bassDur * 0.68, 0.4);
            }
        }
    }

    /** Pull down isolated spikes before peak-normalize so the waveform isn’t “all peaks”. */
    const gentleCompress = (samples, thresh, ratio) => {
        for (let i = 0; i < samples.length; i += 1) {
            const x = samples[i];
            const ax = Math.abs(x);
            if (ax <= thresh) continue;
            const sign = x < 0 ? -1 : 1;
            samples[i] = sign * (thresh + (ax - thresh) * ratio);
        }
    };
    gentleCompress(buffer, 0.38, 0.52);

    let peak = 1e-6;
    for (let i = 0; i < buffer.length; i += 1) {
        peak = Math.max(peak, Math.abs(buffer[i]));
    }
    const norm = 0.88 / peak;
    for (let i = 0; i < buffer.length; i += 1) {
        const x = buffer[i] * norm;
        buffer[i] = Math.tanh(x * 1.08) / 1.08;
    }

    return buffer;
}

const SR = 44100;

/** @type {Record<string, Float32Array>} */
const sfx = {
    'flip.wav': sineTone(SR, 0.055, 520, 0.35),
    'gambit-commit.wav': twoTone(SR, 0.075, 880, 1120, 0.28),
    'match-tier-low.wav': twoTone(SR, 0.14, 612, 820, 0.33),
    'match-tier-mid.wav': twoTone(SR, 0.16, 720, 980, 0.34),
    'match-tier-high.wav': twoTone(SR, 0.18, 880, 1180, 0.36),
    'mismatch.wav': twoTone(SR, 0.2, 180, 110, 0.32),
    'power-arm.wav': twoTone(SR, 0.08, 392, 556, 0.3),
    'destroy-pair.wav': twoTone(SR, 0.24, 132, 88, 0.38),
    'peek-power.wav': twoTone(SR, 0.11, 1040, 1380, 0.28),
    'stray-power.wav': twoTone(SR, 0.15, 380, 240, 0.32),
    'shuffle-full.wav': twoTone(SR, 0.18, 190, 510, 0.34),
    'shuffle-quick.wav': sineTone(SR, 0.045, 440, 0.3),
    'floor-clear.wav': twoTone(SR, 0.22, 300, 1080, 0.28)
};

fs.mkdirSync(sfxDir, { recursive: true });
fs.mkdirSync(musicDir, { recursive: true });

for (const [name, samples] of Object.entries(sfx)) {
    writeWav(path.join(sfxDir, name), samples, SR);
    console.log('wrote', name);
}

// Music at 44.1kHz; BPM where (sr*60)/bpm is integral (gapless loop). Slower ~vault lounge pace.
const MUSIC_SR = 44100;
const MUSIC_BPM = 72;
const MUSIC_BARS = 16;
const bed = generateChillLoop(MUSIC_SR, MUSIC_BPM, MUSIC_BARS);
writeWav(path.join(musicDir, 'chill-loop.wav'), bed, MUSIC_SR);
console.log(
    'wrote chill-loop.wav',
    `(${MUSIC_BARS} bars @ ${MUSIC_BPM} BPM, ~${(bed.length / MUSIC_SR).toFixed(1)}s, replace with ACE-Step when ready)`
);

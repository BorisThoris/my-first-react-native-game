/**
 * Shared procedural chill-loop DSP: drum/pad layers + full mix + loop-safe timing.
 * Used by `generate-procedural-sfx-wavs.mjs`.
 */

import fs from 'fs';
import path from 'path';

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/** Mono 16-bit PCM WAV writer. */
export function writePcmWavFile(outPath, samples, sampleRate) {
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

/** Deterministic white noise [-1,1] for snare/hats (reproducible builds). */
export function noiseSample(seedRef) {
    seedRef.v = (seedRef.v * 1103515245 + 12345) >>> 0;
    return (seedRef.v / 0x7fffffff) * 2 - 1;
}

/** Warm sub kick — sine sweep only (no HF click), eased attack so it doesn’t spike normalisation. */
export function mixKick(buffer, offset, sr) {
    const len = Math.floor(sr * 0.098);
    for (let i = 0; i < len && offset + i < buffer.length; i += 1) {
        const t = i / sr;
        const progress = i / len;
        const env = Math.pow(1 - progress, 2.9) * 0.94;
        const f = 168 * Math.pow(50 / 168, progress);
        const attackEase = Math.min(1, i / Math.max(1, sr * 0.0045));
        buffer[offset + i] += attackEase * env * 0.32 * Math.sin(2 * Math.PI * f * t);
    }
}

/** Muted backbeat — low-passed noise + soft low-mid thunk. */
export function mixSoftBackbeat(buffer, offset, sr) {
    const len = Math.min(Math.floor(sr * 0.105), buffer.length - offset);
    const seedRef = { v: (offset + 999) >>> 0 };
    let lp1 = 0;
    let lp2 = 0;
    let lp3 = 0;
    for (let i = 0; i < len; i += 1) {
        const progress = i / len;
        const env = Math.pow(1 - progress, 2.5);
        const white = noiseSample(seedRef);
        lp1 = lp1 * 0.9 + white * 0.1;
        lp2 = lp2 * 0.88 + lp1 * 0.12;
        lp3 = lp3 * 0.86 + lp2 * 0.14;
        const thunk = env * 0.028 * Math.sin(2 * Math.PI * 146 * (i / sr));
        const hollow = env * 0.012 * Math.sin(2 * Math.PI * 292 * (i / sr));
        buffer[offset + i] += lp3 * env * 0.047 + thunk + hollow;
    }
}

/** Soft hat burst — heavily dulled noise. */
export function mixSoftHat(buffer, offset, sr, velocity) {
    const len = Math.min(Math.floor(sr * 0.056), buffer.length - offset);
    const seedRef = { v: (offset + 2048) >>> 0 };
    let lp = 0;
    for (let i = 0; i < len; i += 1) {
        const env = Math.pow(1 - i / len, 6.5);
        lp = lp * 0.88 + noiseSample(seedRef) * 0.12;
        buffer[offset + i] += lp * env * velocity * 0.12;
    }
}

/** Soft sub-bass “thump”. */
export function mixBassNote(buffer, offset, sr, freqHz, durSec, velocity) {
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

/** Warm pad: stacked detuned sines. */
export function mixPadChord(buffer, startSample, sr, durationSamples, freqs, gain) {
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

/** Short decay pluck. */
export function mixPluck(buffer, offset, sr, freqHz, gain, durSec) {
    const len = Math.min(Math.floor(sr * durSec), buffer.length - offset);
    for (let i = 0; i < len; i += 1) {
        const env = Math.exp(-8.5 * (i / Math.max(1, len - 1)));
        const t = i / sr;
        buffer[offset + i] += gain * env * Math.sin(2 * Math.PI * freqHz * t);
    }
}

/** Sparse stepped arpeggio. */
export function mixSparseArp(buffer, barStart, sr, barSamples, chordFreqs, mixGain) {
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

/** Am | F | C | G — roots + pad chord stacks (same as chill-loop music). */
export function getChillChordProgression() {
    return [
        { root: 55, pad: [110, 130.81, 164.81, 220] },
        { root: 43.65, pad: [87.31, 130.81, 174.61, 261.63] },
        { root: 36.71, pad: [73.42, 110, 146.83, 220] },
        { root: 41.2, pad: [82.41, 123.47, 164.81, 246.94] }
    ];
}

export function assertIntegralSamplesPerQuarter(sr, bpm) {
    const spq = Math.round((sr * 60) / bpm);
    if (Math.abs(spq - (sr * 60) / bpm) > 1e-6) {
        throw new Error(`Pick bpm so ${sr}*60/bpm is integral (got ${(sr * 60) / bpm})`);
    }
    return spq;
}

/** Same dynamics as full chill-loop mix (for per-stem consistency). */
export function normaliseChillBuffer(buffer) {
    const gentleCompress = (samples, thresh, ratio) => {
        for (let i = 0; i < samples.length; i += 1) {
            const x = samples[i];
            const ax = Math.abs(x);
            if (ax <= thresh) continue;
            const sign = x < 0 ? -1 : 1;
            samples[i] = sign * (thresh + (ax - thresh) * ratio);
        }
    };
    gentleCompress(buffer, 0.26, 0.38);
    gentleCompress(buffer, 0.42, 0.58);

    let peak = 1e-6;
    for (let i = 0; i < buffer.length; i += 1) {
        peak = Math.max(peak, Math.abs(buffer[i]));
    }
    const norm = 0.86 / peak;
    for (let i = 0; i < buffer.length; i += 1) {
        const x = buffer[i] * norm;
        buffer[i] = Math.tanh(x * 1.02) / 1.02;
    }
}

/** Full chill loop (all layers summed) — matches previous monolithic generator. */
export function renderChillLoopFull(sr, bpm, bars) {
    assertIntegralSamplesPerQuarter(sr, bpm);
    const spq = Math.round((sr * 60) / bpm);
    const barSamples = 4 * spq;
    const totalSamples = bars * barSamples;
    const buffer = new Float32Array(totalSamples);
    const progression = getChillChordProgression();

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

            mixSoftHat(buffer, qs, sr, 0.038);
            const half = Math.floor(spq / 2);
            if (q < 3) {
                mixSoftHat(buffer, qs + half, sr, 0.019);
            }
            if (bar % 2 === 0 && q === 0) {
                mixSoftHat(buffer, qs + Math.floor(spq * 0.25), sr, 0.014);
            }

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

    normaliseChillBuffer(buffer);
    return buffer;
}

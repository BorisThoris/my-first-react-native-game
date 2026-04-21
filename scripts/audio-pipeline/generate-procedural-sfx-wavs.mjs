#!/usr/bin/env node
/**
 * Writes short PCM WAV one-shots + a chill bed so the repo ships audible placeholders
 * when ACE-Step is not installed. Replace with ACE-Step exports + trim when available.
 *
 *   node scripts/audio-pipeline/generate-procedural-sfx-wavs.mjs
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

/** Mix exponential sine-sweep kick (four-on-the-floor friendly). */
function mixKick(buffer, offset, sr) {
    const len = Math.floor(sr * 0.095);
    const seedRef = { v: offset >>> 0 };
    for (let i = 0; i < len && offset + i < buffer.length; i += 1) {
        const t = i / sr;
        const progress = i / len;
        const env = Math.pow(1 - progress, 2.8) * 0.92;
        const f = 185 * Math.pow(58 / 185, progress);
        const click = i < Math.floor(sr * 0.004) ? noiseSample(seedRef) * 0.35 * (1 - i / Math.max(1, sr * 0.004)) : 0;
        buffer[offset + i] += click + env * 0.52 * Math.sin(2 * Math.PI * f * t);
    }
}

/** Mix noise-body snare with a little tonal ring. */
function mixSnare(buffer, offset, sr) {
    const len = Math.min(Math.floor(sr * 0.14), buffer.length - offset);
    const seedRef = { v: (offset + 999) >>> 0 };
    for (let i = 0; i < len; i += 1) {
        const progress = i / len;
        const env = Math.pow(1 - progress, 1.35);
        const body = noiseSample(seedRef) * env * 0.38;
        const tone = env * 0.08 * Math.sin(2 * Math.PI * 330 * (i / sr));
        buffer[offset + i] += body + tone;
    }
}

/** Closed hat: band-limited noise burst. */
function mixHat(buffer, offset, sr, velocity) {
    const len = Math.min(Math.floor(sr * 0.035), buffer.length - offset);
    const seedRef = { v: (offset + 2048) >>> 0 };
    for (let i = 0; i < len; i += 1) {
        const env = Math.pow(1 - i / len, 4);
        const n = noiseSample(seedRef);
        buffer[offset + i] += n * env * velocity * 0.65;
    }
}

/** Soft sub-bass note (sine). */
function mixBassNote(buffer, offset, sr, freqHz, durSec, velocity) {
    const len = Math.min(Math.floor(sr * durSec), buffer.length - offset);
    for (let i = 0; i < len; i += 1) {
        const t = i / sr;
        const attack = Math.min(1, i / Math.max(1, sr * 0.012));
        const release = Math.min(1, (len - i) / Math.max(1, sr * 0.045));
        const env = attack * release;
        buffer[offset + i] += velocity * env * 0.42 * Math.sin(2 * Math.PI * freqHz * t);
    }
}

/** Warm pad: stacked detuned sines with slow attack (per chord zone). */
function mixPadChord(buffer, startSample, sr, durationSamples, freqs, gain) {
    const len = Math.min(durationSamples, buffer.length - startSample);
    const seeds = freqs.map((_, j) => j * 9973);
    for (let i = 0; i < len; i += 1) {
        let s = 0;
        const att = Math.min(1, i / Math.max(1, sr * 0.55));
        const rel = Math.min(1, (len - i) / Math.max(1, sr * 0.4));
        const zone = att * rel;
        for (let k = 0; k < freqs.length; k += 1) {
            const detune = 1 + (seeds[k] % 7) * 0.00015;
            const f = freqs[k] * detune;
            const t = (startSample + i) / sr;
            s += Math.sin(2 * Math.PI * f * t + k * 0.7);
        }
        buffer[startSample + i] += gain * zone * (s / freqs.length) * 0.22;
    }
}

/**
 * Chill loop: 4/4 @ BPM, kick on 1&3, snare backbeat, 8th hats, walking bass, pad chords.
 * Length `bars` — integer samples per quarter so the WAV loops seamlessly at bar boundaries.
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

    for (let bar = 0; bar < bars; bar += 1) {
        const chord = progression[bar % 4];
        const barStart = bar * 4 * spq;

        mixPadChord(buffer, barStart, sr, 4 * spq, chord.pad, 0.95);

        for (let beat = 0; beat < 4; beat += 1) {
            const beatStart = barStart + beat * spq;
            if (beat === 0 || beat === 2) {
                mixKick(buffer, beatStart, sr);
            }
            if (beat === 1 || beat === 3) {
                mixSnare(buffer, beatStart, sr);
            }
            for (let h = 0; h < 8; h += 1) {
                const swing = h % 2 === 1 ? Math.round(sr * 0.011) : 0;
                const hatOff = beatStart + Math.round((h * spq) / 2) + swing;
                const accent = h % 4 === 0 ? 0.14 : h % 2 === 0 ? 0.1 : 0.065;
                mixHat(buffer, hatOff, sr, accent);
            }

            const bassDur = (spq * 0.92) / sr;
            const rootHz = chord.root;
            const fifthHz = rootHz * 1.498307; // just-ish fifth
            if (beat === 0) {
                mixBassNote(buffer, beatStart, sr, rootHz, bassDur, 1);
            } else if (beat === 1) {
                mixBassNote(buffer, beatStart, sr, fifthHz, bassDur * 0.92, 0.88);
            } else if (beat === 2) {
                mixBassNote(buffer, beatStart, sr, rootHz * 1.02, bassDur, 0.92);
            } else {
                mixBassNote(buffer, beatStart + Math.floor(spq * 0.12), sr, rootHz * 1.25992, bassDur * 0.75, 0.78); // octave bounce hint
            }
        }
    }

    let peak = 1e-6;
    for (let i = 0; i < buffer.length; i += 1) {
        peak = Math.max(peak, Math.abs(buffer[i]));
    }
    const norm = 0.92 / peak;
    for (let i = 0; i < buffer.length; i += 1) {
        const x = buffer[i] * norm;
        buffer[i] = Math.tanh(x * 1.15) / 1.15;
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

// Music at 44.1kHz; BPM chosen so samples/beat is integer for gapless loop.
const MUSIC_SR = 44100;
const MUSIC_BPM = 80;
const MUSIC_BARS = 8;
const bed = generateChillLoop(MUSIC_SR, MUSIC_BPM, MUSIC_BARS);
writeWav(path.join(musicDir, 'chill-loop.wav'), bed, MUSIC_SR);
console.log(
    'wrote chill-loop.wav',
    `(${MUSIC_BARS} bars @ ${MUSIC_BPM} BPM, ~${(bed.length / MUSIC_SR).toFixed(1)}s, replace with ACE-Step when ready)`
);

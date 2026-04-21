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

function chillBed(sr, seconds) {
    const n = Math.floor(sr * seconds);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i += 1) {
        const t = i / sr;
        const lfo = 0.45 + 0.55 * Math.sin(2 * Math.PI * 0.07 * t);
        const g = 0.055 * lfo;
        out[i] =
            g *
            (Math.sin(2 * Math.PI * 128 * t) +
                0.55 * Math.sin(2 * Math.PI * 192 * t) +
                0.35 * Math.sin(2 * Math.PI * 256 * t + 0.4));
    }
    return out;
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

const musicSr = 22050;
const bed = chillBed(musicSr, 48);
writeWav(path.join(musicDir, 'chill-loop.wav'), bed, musicSr);
console.log('wrote chill-loop.wav (replace with ACE-Step export when ready)');

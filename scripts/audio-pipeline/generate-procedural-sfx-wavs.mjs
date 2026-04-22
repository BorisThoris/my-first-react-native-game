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
import { renderChillLoopFull, writePcmWavFile } from './proceduralBeatPrimitives.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');
const sfxDir = path.join(repoRoot, 'src/renderer/assets/audio/sfx');
const musicDir = path.join(repoRoot, 'src/renderer/assets/audio/music');

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
    writePcmWavFile(path.join(sfxDir, name), samples, SR);
    console.log('wrote', name);
}

const MUSIC_SR = 44100;
const MUSIC_BPM = 72;
const MUSIC_BARS = 16;
const bed = renderChillLoopFull(MUSIC_SR, MUSIC_BPM, MUSIC_BARS);
writePcmWavFile(path.join(musicDir, 'chill-loop.wav'), bed, MUSIC_SR);
console.log(
    'wrote chill-loop.wav',
    `(${MUSIC_BARS} bars @ ${MUSIC_BPM} BPM, ~${(bed.length / MUSIC_SR).toFixed(1)}s, replace with ACE-Step when ready)`
);

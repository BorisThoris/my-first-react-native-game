#!/usr/bin/env node
/**
 * Copy ACE-Step batch outputs from tmp/audio/ace-step/<jobId>/ into src/renderer/assets/audio/*
 * using trim duration from jobs.memory-dungeon-app-audio.json (first N seconds; loops use full job duration).
 *
 * Requires ffmpeg on PATH for trim + PCM WAV export. Without ffmpeg, copies the newest render as-is (may be long).
 *
 * Usage:
 *   node scripts/audio-pipeline/install-ace-app-outputs.mjs
 *   node scripts/audio-pipeline/install-ace-app-outputs.mjs --ace-out tmp/audio/ace-step --dry-run
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

/** job id -> path under repo root (must match manifests). */
const JOB_INSTALL_PATHS = {
    flip: 'src/renderer/assets/audio/sfx/flip.wav',
    'gambit-commit': 'src/renderer/assets/audio/sfx/gambit-commit.wav',
    'match-tier-low': 'src/renderer/assets/audio/sfx/match-tier-low.wav',
    'match-tier-mid': 'src/renderer/assets/audio/sfx/match-tier-mid.wav',
    'match-tier-high': 'src/renderer/assets/audio/sfx/match-tier-high.wav',
    mismatch: 'src/renderer/assets/audio/sfx/mismatch.wav',
    'power-arm': 'src/renderer/assets/audio/sfx/power-arm.wav',
    'destroy-pair': 'src/renderer/assets/audio/sfx/destroy-pair.wav',
    'peek-power': 'src/renderer/assets/audio/sfx/peek-power.wav',
    'stray-power': 'src/renderer/assets/audio/sfx/stray-power.wav',
    'shuffle-full': 'src/renderer/assets/audio/sfx/shuffle-full.wav',
    'shuffle-quick': 'src/renderer/assets/audio/sfx/shuffle-quick.wav',
    'floor-clear': 'src/renderer/assets/audio/sfx/floor-clear.wav',
    'ui-click': 'src/renderer/assets/audio/ui/ui-click.wav',
    'ui-confirm': 'src/renderer/assets/audio/ui/ui-confirm.wav',
    'ui-back': 'src/renderer/assets/audio/ui/ui-back.wav',
    'ui-counter': 'src/renderer/assets/audio/ui/ui-counter.wav',
    'menu-open': 'src/renderer/assets/audio/ui/menu-open.wav',
    'run-start': 'src/renderer/assets/audio/ui/run-start.wav',
    'intro-sting': 'src/renderer/assets/audio/ui/intro-sting.wav',
    'pause-open': 'src/renderer/assets/audio/ui/pause-open.wav',
    'pause-resume': 'src/renderer/assets/audio/ui/pause-resume.wav',
    'game-over-open': 'src/renderer/assets/audio/ui/game-over-open.wav',
    'ui-copy': 'src/renderer/assets/audio/ui/ui-copy.wav',
    'relic-offer-open': 'src/renderer/assets/audio/sfx/relic-offer-open.wav',
    'relic-pick': 'src/renderer/assets/audio/sfx/relic-pick.wav',
    'wager-arm': 'src/renderer/assets/audio/sfx/wager-arm.wav',
    'menu-loop': 'src/renderer/assets/audio/music/menu-loop.wav',
    'run-loop': 'src/renderer/assets/audio/music/run-loop.wav'
};

function parseArgs() {
    const argv = process.argv.slice(2);
    let aceOut = path.join(repoRoot, 'tmp', 'audio', 'ace-step');
    let jobsFile = path.join(repoRoot, 'scripts', 'audio-pipeline', 'jobs.memory-dungeon-app-audio.json');
    let dryRun = false;
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--ace-out' && argv[i + 1]) {
            aceOut = path.resolve(argv[i + 1]);
            i += 1;
        } else if (argv[i] === '--jobs' && argv[i + 1]) {
            jobsFile = path.resolve(argv[i + 1]);
            i += 1;
        } else if (argv[i] === '--dry-run') {
            dryRun = true;
        }
    }
    return { aceOut, jobsFile, dryRun };
}

function loadJobDurations(jobsPath) {
    const raw = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
    const list = Array.isArray(raw) ? raw : raw.jobs;
    if (!Array.isArray(list)) {
        throw new Error('jobs file must be an array or { jobs: [] }');
    }
    /** @type {Record<string, number>} */
    const out = {};
    for (const e of list) {
        if (e && typeof e.id === 'string' && typeof e.duration === 'number') {
            out[e.id] = e.duration;
        }
    }
    return out;
}

function newestMediaFile(jobDir) {
    if (!fs.existsSync(jobDir)) {
        return null;
    }
    const names = fs.readdirSync(jobDir);
    let best = null;
    let bestT = 0;
    for (const name of names) {
        if (!/\.(flac|wav|mp3|ogg)$/i.test(name)) {
            continue;
        }
        const p = path.join(jobDir, name);
        const st = fs.statSync(p);
        if (st.mtimeMs >= bestT) {
            bestT = st.mtimeMs;
            best = p;
        }
    }
    return best;
}

function hasFfmpeg() {
    const r = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
    return r.status === 0;
}

function main() {
    const { aceOut, jobsFile, dryRun } = parseArgs();
    const durations = loadJobDurations(jobsFile);
    const ffmpegOk = hasFfmpeg();

    if (!ffmpegOk) {
        console.warn('install-ace-app-outputs: ffmpeg not found on PATH; will copy files without trim.');
    }

    let ok = 0;
    let skip = 0;

    for (const [jobId, relDest] of Object.entries(JOB_INSTALL_PATHS)) {
        const jobDir = path.join(aceOut, jobId);
        const src = newestMediaFile(jobDir);
        const dest = path.join(repoRoot, relDest);
        const dur = durations[jobId];
        if (!src) {
            console.warn(`skip ${jobId}: no render in ${jobDir}`);
            skip += 1;
            continue;
        }
        if (dur === undefined) {
            console.warn(`skip ${jobId}: no duration in jobs file`);
            skip += 1;
            continue;
        }

        if (dryRun) {
            console.log(`[dry-run] ${jobId}: ${src} -> ${relDest} (trim ${dur}s)`);
            ok += 1;
            continue;
        }

        fs.mkdirSync(path.dirname(dest), { recursive: true });

        if (ffmpegOk) {
            const r = spawnSync(
                'ffmpeg',
                [
                    '-y',
                    '-i',
                    src,
                    '-t',
                    String(dur),
                    '-ac',
                    '2',
                    '-ar',
                    '48000',
                    '-c:a',
                    'pcm_s16le',
                    dest
                ],
                { encoding: 'utf8' }
            );
            if (r.status !== 0) {
                console.error(`ffmpeg failed for ${jobId}:\n${r.stderr || r.stdout}`);
                skip += 1;
                continue;
            }
        } else {
            fs.copyFileSync(src, dest);
        }

        console.log('installed', jobId, '->', path.relative(repoRoot, dest));
        ok += 1;
    }

    console.log(`install-ace-app-outputs: ${ok} ok, ${skip} skipped`);
    if (skip > 0) {
        process.exitCode = 1;
    }
}

main();

#!/usr/bin/env node
/**
 * Copy every *.wav from a legacy sound pack into reference-audio/ (by basename), then
 * verify each job's reference_audio file exists (see jobs.memory-dungeon-app-audio.json).
 *
 * Usage:
 *   node scripts/audio-pipeline/materialize-reference-audio-from-pack.mjs --from C:\path\to\sounds
 *   node scripts/audio-pipeline/materialize-reference-audio-from-pack.mjs --from ..\pack --recursive
 *
 * If --from resolves to the same directory as reference-audio/, skips copying and only validates.
 *
 * Env: AUDIO_REFERENCE_PACK — default for --from when omitted.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');
const defaultJobsFile = path.join(__dirname, 'jobs.memory-dungeon-app-audio.json');
const outDir = path.join(__dirname, 'reference-audio');

/** @param {string} dir @param {boolean} recursive @param {string[]} acc */
function collectWavFiles(dir, recursive, acc = []) {
    if (!fs.existsSync(dir)) {
        return acc;
    }
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            if (recursive) {
                collectWavFiles(p, recursive, acc);
            }
        } else if (ent.isFile() && /\.wav$/i.test(ent.name)) {
            acc.push(p);
        }
    }
    return acc;
}

/** @param {string} jobsPath @returns {{ basenames: Set<string>, jobCount: number }} */
function requiredReferenceBasenames(jobsPath) {
    const raw = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
    const list = Array.isArray(raw) ? raw : raw.jobs;
    if (!Array.isArray(list)) {
        throw new Error('jobs file must be an array or { jobs: [] }');
    }
    const req = new Set();
    let jobCount = 0;
    for (const j of list) {
        if (j && typeof j.reference_audio === 'string') {
            jobCount += 1;
            req.add(path.basename(j.reference_audio));
        }
    }
    return { basenames: req, jobCount };
}

function parseArgs() {
    const argv = process.argv.slice(2);
    let from = process.env.AUDIO_REFERENCE_PACK || '';
    let jobsFile = defaultJobsFile;
    let recursive = false;
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--from' && argv[i + 1]) {
            from = argv[i + 1];
            i += 1;
        } else if (argv[i] === '--jobs' && argv[i + 1]) {
            jobsFile = path.resolve(argv[i + 1]);
            i += 1;
        } else if (argv[i] === '--recursive') {
            recursive = true;
        }
    }
    return {
        from: from ? path.resolve(from) : '',
        jobsFile,
        recursive
    };
}

function main() {
    const { from, jobsFile, recursive } = parseArgs();
    if (!from) {
        console.error(
            'materialize-reference-audio-from-pack: set --from <dir> or AUDIO_REFERENCE_PACK (folder of legacy *.wav files).'
        );
        process.exit(1);
    }

    const { basenames: required, jobCount } = requiredReferenceBasenames(jobsFile);
    const sameDir = path.resolve(from) === path.resolve(outDir);

    fs.mkdirSync(outDir, { recursive: true });

    if (!sameDir) {
        if (!fs.existsSync(from)) {
            console.error(`materialize-reference-audio-from-pack: pack directory does not exist:\n  ${from}`);
            process.exit(1);
        }
        const wavs = collectWavFiles(from, recursive);
        if (wavs.length === 0) {
            console.error(`materialize-reference-audio-from-pack: no *.wav under:\n  ${from}${recursive ? ' (recursive)' : ''}`);
            process.exit(1);
        }
        const seen = new Map();
        let copied = 0;
        for (const src of wavs) {
            const base = path.basename(src);
            if (seen.has(base)) {
                console.warn(`duplicate basename in pack (keeping first): ${base}\n  was: ${seen.get(base)}\n  saw: ${src}`);
                continue;
            }
            seen.set(base, src);
            const dst = path.join(outDir, base);
            fs.copyFileSync(src, dst);
            copied += 1;
        }
        console.log(`materialize-reference-audio-from-pack: copied ${copied} wav(s) -> ${path.relative(repoRoot, outDir)}`);
    } else {
        console.log('materialize-reference-audio-from-pack: --from is reference-audio/; skipping copy, validating only.');
    }

    const missing = [...required].filter((b) => !fs.existsSync(path.join(outDir, b)));
    if (missing.length > 0) {
        console.error(
            `materialize-reference-audio-from-pack: missing reference file(s) required by jobs (${path.relative(repoRoot, jobsFile)}):`
        );
        for (const b of missing.sort()) {
            console.error(`  ${b}`);
        }
        process.exit(1);
    }

    console.log(
        `materialize-reference-audio-from-pack: OK — ${jobCount} job(s), ${required.size} unique reference file(s), all present in ${path.relative(repoRoot, outDir)}`
    );
}

main();

#!/usr/bin/env node
/**
 * For each app-audio job, set reference_audio to reference-audio/<first existing file>
 * in that job's referenceSourceCoverage list (order = priority).
 *
 * Default: print planned changes only. Use --write to update the jobs JSON on disk.
 *
 * Run after materialize-reference-audio-from-pack so reference-audio/ reflects your pack.
 *
 * Usage:
 *   node scripts/audio-pipeline/apply-reference-coverage-priority.mjs
 *   node scripts/audio-pipeline/apply-reference-coverage-priority.mjs --write
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');
const defaultJobsFile = path.join(__dirname, 'jobs.memory-dungeon-app-audio.json');
const defaultRefDir = path.join(__dirname, 'reference-audio');

function parseArgs() {
    const argv = process.argv.slice(2);
    let jobsFile = defaultJobsFile;
    let refDir = defaultRefDir;
    let write = false;
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--jobs' && argv[i + 1]) {
            jobsFile = path.resolve(argv[i + 1]);
            i += 1;
        } else if (argv[i] === '--reference-dir' && argv[i + 1]) {
            refDir = path.resolve(argv[i + 1]);
            i += 1;
        } else if (argv[i] === '--write') {
            write = true;
        }
    }
    return { jobsFile, refDir, write };
}

function main() {
    const { jobsFile, refDir, write } = parseArgs();
    const raw = fs.readFileSync(jobsFile, 'utf8');
    const data = JSON.parse(raw);
    const jobs = data.jobs;
    const coverage = data.referenceSourceCoverage;
    if (!Array.isArray(jobs) || typeof coverage !== 'object' || coverage === null) {
        console.error('apply-reference-coverage-priority: expected jobs array and referenceSourceCoverage object');
        process.exit(1);
    }

    /** @type {string[]} */
    const lines = [];
    let changeCount = 0;
    let warnCount = 0;
    let fatalMissing = false;

    for (const job of jobs) {
        if (!job || typeof job.id !== 'string') {
            continue;
        }
        const list = coverage[job.id];
        if (!Array.isArray(list) || list.length === 0) {
            lines.push(`[skip] ${job.id}: no referenceSourceCoverage entry`);
            warnCount += 1;
            fatalMissing = true;
            continue;
        }
        let picked = null;
        for (const name of list) {
            if (typeof name !== 'string') {
                continue;
            }
            const p = path.join(refDir, path.basename(name));
            if (fs.existsSync(p)) {
                picked = path.basename(name);
                break;
            }
        }
        if (!picked) {
            lines.push(`[warn] ${job.id}: none of [${list.join(', ')}] exist under ${path.relative(repoRoot, refDir)}`);
            warnCount += 1;
            fatalMissing = true;
            continue;
        }
        const nextRef = `reference-audio/${picked}`;
        if (job.reference_audio === nextRef) {
            lines.push(`[ok]   ${job.id}: already ${nextRef}`);
        } else {
            lines.push(`[set]  ${job.id}: ${job.reference_audio} -> ${nextRef}`);
            changeCount += 1;
            if (write) {
                job.reference_audio = nextRef;
            }
        }
    }

    console.log(lines.join('\n'));
    if (fatalMissing) {
        console.error('apply-reference-coverage-priority: fix reference-audio/ (run materialize-from-pack) or coverage lists before --write.');
        process.exit(1);
    }

    if (write) {
        if (changeCount > 0) {
            fs.writeFileSync(jobsFile, `${JSON.stringify(data, null, 4)}\n`, 'utf8');
        }
        console.log(
            `apply-reference-coverage-priority: ${changeCount > 0 ? 'wrote' : 'no changes — skipped write'} ${path.relative(repoRoot, jobsFile)} (${changeCount} reference_audio update(s)).`
        );
    } else {
        console.log(
            `apply-reference-coverage-priority: dry-run (${changeCount} would change). Pass --write to apply.${warnCount ? ` Warnings: ${warnCount}` : ''}`
        );
    }
}

main();

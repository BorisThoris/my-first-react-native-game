#!/usr/bin/env node
/**
 * Populate scripts/audio-pipeline/reference-audio/ from the legacy pack under
 * src/renderer/assets/audio/dont_modify/ so ACE-Step jobs use stable authored references
 * instead of previously generated shipped outputs.
 *
 * Run after updating jobs.memory-dungeon-app-audio.json or when the legacy pack changes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');
const outDir = path.join(__dirname, 'reference-audio');
const jobsPath = path.join(__dirname, 'jobs.memory-dungeon-app-audio.json');
const dontModifyDir = path.join(repoRoot, 'src', 'renderer', 'assets', 'audio', 'dont_modify');

function requiredReferenceBasenames() {
    const raw = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
    const list = Array.isArray(raw) ? raw : raw.jobs;
    if (!Array.isArray(list)) {
        throw new Error('jobs file must be an array or { jobs: [] }');
    }

    const names = new Set();
    for (const job of list) {
        if (job && typeof job.reference_audio === 'string') {
            names.add(path.basename(job.reference_audio));
        }
    }
    return [...names].sort((a, b) => a.localeCompare(b));
}

function main() {
    if (!fs.existsSync(dontModifyDir)) {
        console.error(`materialize-reference-audio: missing dont_modify pack:\n  ${dontModifyDir}`);
        process.exit(1);
    }

    fs.mkdirSync(outDir, { recursive: true });

    const required = requiredReferenceBasenames();
    const missing = [];
    let copied = 0;

    for (const basename of required) {
        const src = path.join(dontModifyDir, basename);
        if (!fs.existsSync(src)) {
            missing.push(basename);
            continue;
        }
        const dst = path.join(outDir, basename);
        fs.copyFileSync(src, dst);
        copied += 1;
        console.log('copied', path.relative(repoRoot, src), '->', path.relative(repoRoot, dst));
    }

    if (missing.length > 0) {
        console.error('materialize-reference-audio: missing legacy reference file(s) in dont_modify:');
        for (const basename of missing) {
            console.error(`  ${basename}`);
        }
        process.exit(1);
    }

    console.log(`materialize-reference-audio: OK (${copied} file(s) in ${path.relative(repoRoot, outDir)})`);
}

main();

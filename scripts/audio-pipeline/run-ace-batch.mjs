#!/usr/bin/env node
/**
 * Runs batch_ace_step.py with the same Python that has ACE-Step installed.
 *
 * Resolution order:
 *   1. ACESTEP_PYTHON (absolute path to python.exe / python binary)
 *   2. .venv-audio at repo root (Scripts/python.exe or bin/python)
 *   3. Windows: py -3
 *   4. python3, then python
 *
 * Forward all CLI args to batch_ace_step.py, e.g. --dry-run --jobs path/to/jobs.json
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const batchScript = path.join(repoRoot, 'scripts', 'audio-pipeline', 'batch_ace_step.py');
const forwarded = process.argv.slice(2);
const siblingAceStepRoot = path.resolve(repoRoot, '..', 'Ace-Step1.5');

function primeAceStepProjectRoot() {
    if (process.env.ACESTEP_PROJECT_ROOT?.trim()) {
        return;
    }
    if (fs.existsSync(siblingAceStepRoot)) {
        process.env.ACESTEP_PROJECT_ROOT = siblingAceStepRoot;
    }
}

/** @returns {{ cmd: string; args: string[] }[]} */
function pythonAttempts() {
    const out = [];

    const envPy = process.env.ACESTEP_PYTHON?.trim();
    if (envPy && fs.existsSync(envPy)) {
        out.push({ cmd: envPy, args: [batchScript, ...forwarded] });
    }

    const win = process.platform === 'win32';
    const venvPy = win
        ? path.join(repoRoot, '.venv-audio', 'Scripts', 'python.exe')
        : path.join(repoRoot, '.venv-audio', 'bin', 'python');
    if (fs.existsSync(venvPy)) {
        out.push({ cmd: venvPy, args: [batchScript, ...forwarded] });
    }

    if (win) {
        out.push({ cmd: 'py', args: ['-3', batchScript, ...forwarded] });
    }

    out.push({ cmd: 'python3', args: [batchScript, ...forwarded] });
    out.push({ cmd: 'python', args: [batchScript, ...forwarded] });

    return out;
}

function main() {
    if (!fs.existsSync(batchScript)) {
        console.error('run-ace-batch: missing', batchScript);
        process.exit(1);
    }

    primeAceStepProjectRoot();

    const attempts = pythonAttempts();
    const tried = new Set();

    for (const { cmd, args } of attempts) {
        const key = `${cmd}\0${args.join('\0')}`;
        if (tried.has(key)) continue;
        tried.add(key);

        const r = spawnSync(cmd, args, {
            stdio: 'inherit',
            cwd: repoRoot,
            env: process.env,
            shell: false
        });

        if (r.error) {
            if (r.error.code === 'ENOENT') {
                continue;
            }
            console.error(r.error.message);
            process.exit(1);
        }

        process.exit(r.status ?? 1);
    }

    console.error(
        'run-ace-batch: no Python interpreter found. Run scripts/audio-pipeline/setup-audio-env.ps1, set ACESTEP_PYTHON, or install python3 on PATH.'
    );
    process.exit(1);
}

main();

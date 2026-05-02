#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const runner = path.resolve(repoRoot, '..', 'cross-repo-libs', 'packages', 'ai-image', 'scripts', 'image_gen.mjs');

const result = spawnSync(process.execPath, [runner, 'openai', ...process.argv.slice(2)], {
    cwd: repoRoot,
    env: {
        ...process.env,
        CROSS_AI_REPO_ROOT: repoRoot
    },
    stdio: 'inherit',
    shell: false
});

if (result.error) {
    console.error(result.error.message);
    process.exit(1);
}

process.exit(result.status ?? 1);

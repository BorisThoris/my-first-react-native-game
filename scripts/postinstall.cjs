const path = require('node:path');
const { spawnSync } = require('node:child_process');

if (process.env.CF_PAGES) {
    console.log('Skipping electron-builder install-app-deps on Cloudflare Pages.');
    process.exit(0);
}

const cwd = path.join(__dirname, '..');
// `shell: true` avoids Windows spawn EINVAL with `npx.cmd` when paths or stdio interact badly.
const result = spawnSync('npx', ['electron-builder', 'install-app-deps'], {
    cwd,
    stdio: 'inherit',
    shell: true
});

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 0);

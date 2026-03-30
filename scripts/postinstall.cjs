const { spawnSync } = require('node:child_process');

if (process.env.CF_PAGES) {
    console.log('Skipping electron-builder install-app-deps on Cloudflare Pages.');
    process.exit(0);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['electron-builder', 'install-app-deps'], {
    stdio: 'inherit'
});

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 0);

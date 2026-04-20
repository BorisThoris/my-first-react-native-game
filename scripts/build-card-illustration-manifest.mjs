/**
 * Verifies that every illustration file under `assets/cards/illustrations` is referenced
 * from `cardIllustrationRegistry.ts` (so preload + bundler keep URLs in sync).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const illustrationsDir = path.join(root, 'src/renderer/assets/cards/illustrations');
const registryPath = path.join(root, 'src/renderer/cardFace/cardIllustrationRegistry.ts');
const facePanelRasterUrlsPath = path.join(root, 'src/renderer/cardFace/facePanelRasterUrls.ts');

if (!fs.existsSync(illustrationsDir)) {
    console.error('Missing illustrations directory:', illustrationsDir);
    process.exit(1);
}

if (!fs.existsSync(registryPath)) {
    console.error('Missing registry file:', registryPath);
    process.exit(1);
}

const files = fs
    .readdirSync(illustrationsDir)
    .filter((f) => /\.(webp|png|jpe?g|svg)$/i.test(f) && !f.startsWith('.'));

let registrySrc = fs.readFileSync(registryPath, 'utf8');
if (fs.existsSync(facePanelRasterUrlsPath)) {
    registrySrc += fs.readFileSync(facePanelRasterUrlsPath, 'utf8');
}

const orphanFiles = files.filter((f) => {
    const base = f.replace(/\.[^.]+$/i, '');
    return !registrySrc.includes(f) && !registrySrc.includes(base);
});

if (orphanFiles.length > 0) {
    // eslint-disable-next-line no-console
    console.error('Unreferenced illustration file(s) (add import + registry entry):', orphanFiles);
    process.exit(1);
}

// eslint-disable-next-line no-console
console.log(`OK: card illustrations (${files.length} file(s)) match ${path.relative(root, registryPath)}.`);

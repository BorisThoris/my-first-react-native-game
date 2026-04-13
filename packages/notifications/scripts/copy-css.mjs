import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'src', 'notification-host.css');
const dest = join(root, 'dist', 'notification-host.css');
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);

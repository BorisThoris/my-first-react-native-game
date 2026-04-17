/**
 * REF-093: Fail if a Vitest file uses `.test.ts` but contains JSX-like markup (PascalCase opening tags at line start).
 * Rename those files to `.test.tsx`. Pure logic tests stay `.ts`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const walk = (dir, acc = []) => {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
        if (name.name === 'node_modules' || name.name === 'dist' || name.name === '.tsbuild') {
            continue;
        }
        const p = path.join(dir, name.name);
        if (name.isDirectory()) {
            walk(p, acc);
        } else if (name.isFile() && name.name.endsWith('.test.ts') && !name.name.endsWith('.test.tsx')) {
            acc.push(p);
        }
    }
    return acc;
};

/** PascalCase JSX element at the beginning of a line (after optional whitespace). */
const jsxPascal = /(?:^|\n)\s*<[A-Z][A-Za-z0-9]*/g;

const offenders = [];
for (const file of walk(path.join(root, 'src'))) {
    const text = fs.readFileSync(file, 'utf8');
    if (jsxPascal.test(text)) {
        offenders.push(path.relative(root, file));
    }
}

if (offenders.length > 0) {
    console.error(
        'REF-093: These .test.ts files appear to contain JSX; rename to .test.tsx:\n' + offenders.join('\n')
    );
    process.exit(1);
}

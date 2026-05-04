/* eslint-env node */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { PNG } from 'pngjs';

const REPO_ROOT = resolve(import.meta.dirname, '..');
const auditRootOverride = process.env.GAMEPLAY_AUDIT_ROOT?.trim() || process.env.VISUAL_CAPTURE_ROOT?.trim();
const AUDIT_ROOT = auditRootOverride
    ? resolve(REPO_ROOT, auditRootOverride)
    : join(REPO_ROOT, 'test-results', 'gameplay-visual-audit');

const REVIEW_CATEGORIES = [
    'overflow/clipping',
    'text density or scale',
    'CTA hierarchy',
    'modal close/back placement',
    'HUD/canvas overlap',
    'mobile touch target crowding',
    'modal/action dock theme mismatch',
    'gameplay feedback visibility'
];

const SCENARIO_LABELS = {
    '01-gameplay-idle': 'Gameplay idle',
    '02-card-hover-focus': 'Card hover/focus',
    '03-mismatch-resolve': 'Mismatch resolve',
    '04-match-resolve': 'Match resolve',
    '05-pause-modal': 'Pause modal',
    '06-run-settings-modal': 'Run settings modal',
    '07-in-run-inventory': 'In-run inventory',
    '08-in-run-codex': 'In-run codex',
    '09-floor-cleared': 'Floor cleared',
    '10-shop': 'Shop',
    '11-achievement-toast': 'Achievement toast',
    '12-game-over': 'Game over'
};

function isDirectory(path) {
    try {
        return statSync(path).isDirectory();
    } catch {
        return false;
    }
}

function pngDimensions(path) {
    const png = PNG.sync.read(readFileSync(path));
    return `${png.width}x${png.height}`;
}

function listViewportDirs() {
    if (!existsSync(AUDIT_ROOT)) {
        return [];
    }
    return readdirSync(AUDIT_ROOT)
        .filter((name) => isDirectory(join(AUDIT_ROOT, name)))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function listPngs(viewportDir) {
    const dir = join(AUDIT_ROOT, viewportDir);
    return readdirSync(dir)
        .filter((file) => file.endsWith('.png'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function scenarioTitle(fileName) {
    const slug = basename(fileName, '.png');
    return SCENARIO_LABELS[slug] ?? slug;
}

function buildMarkdown() {
    const relRoot = relative(REPO_ROOT, AUDIT_ROOT).replace(/\\/g, '/') || '.';
    const sections = [
        '# Gameplay Visual Audit',
        '',
        `Generated from Playwright captures under \`${relRoot}\`.`,
        '',
        '## Weakest Points',
        '',
        '- [ ] Review desktop screenshots for HUD/canvas balance, gameplay feedback clarity, and modal hierarchy.',
        '- [ ] Review mobile screenshots for touch target crowding, clipped text, and modal action placement.',
        '- [ ] Convert confirmed defects into `docs/visual-capture/improvement-workqueue/UI-*.md` tasks.',
        ''
    ];

    const viewportDirs = listViewportDirs();
    if (viewportDirs.length === 0) {
        sections.push('_No captures found. Run `yarn capture:gameplay-audit` first._');
        return sections.join('\n');
    }

    for (const viewport of viewportDirs) {
        const files = listPngs(viewport);
        sections.push(`## ${viewport}`);
        sections.push('');
        if (files.length === 0) {
            sections.push('_No PNGs captured for this viewport._');
            sections.push('');
            continue;
        }

        sections.push('| File | Dimensions | Screen |');
        sections.push('| --- | --- | --- |');
        for (const file of files) {
            const dims = pngDimensions(join(AUDIT_ROOT, viewport, file));
            sections.push(`| [\`${file}\`](./${viewport}/${file}) | ${dims} | ${scenarioTitle(file)} |`);
        }
        sections.push('');

        for (const file of files) {
            sections.push(`### ${scenarioTitle(file)}`);
            sections.push('');
            sections.push(`![${scenarioTitle(file)}](./${viewport}/${file})`);
            sections.push('');
            sections.push('#### Review Checklist');
            sections.push('');
            for (const category of REVIEW_CATEGORIES) {
                sections.push(`- [ ] ${category}`);
            }
            sections.push('');
            sections.push('#### Candidate Tasks');
            sections.push('');
            sections.push('- [ ] If a defect is visible here, write a concrete UI task with viewport, screenshot, and acceptance criteria.');
            sections.push('');
        }
    }

    return sections.join('\n');
}

mkdirSync(AUDIT_ROOT, { recursive: true });
writeFileSync(join(AUDIT_ROOT, 'AUDIT.md'), buildMarkdown(), 'utf8');
console.log(`Wrote ${relative(REPO_ROOT, join(AUDIT_ROOT, 'AUDIT.md')).replace(/\\/g, '/')}`);

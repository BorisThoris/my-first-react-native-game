/**
 * Build a module import graph (src/ → src/) using the TypeScript program API.
 * For CLI: `node scripts/graph-project.mjs > tmp/project-graph.json`
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(__dirname, '..');

/**
 * @param {string} repoRoot
 * @param {{ onlySrcEdges?: boolean }} [opts]
 * @returns {{ nodes: { id: string, label: string, path: string, layer: string }[], edges: { id: string, source: string, target: string }[], stats: { fileCount: number, edgeCount: number } }}
 */
export function buildProjectGraphData(repoRoot, opts) {
    const onlySrc = opts?.onlySrcEdges !== false;
    const configPath = path.join(repoRoot, 'tsconfig.json');
    if (!fs.existsSync(configPath)) {
        throw new Error(`tsconfig not found: ${configPath}`);
    }
    const readJson = (p) => {
        const t = ts.readConfigFile(p, (f) => fs.readFileSync(f, 'utf8'));
        if (t.error) {
            throw new Error(t.error.messageText);
        }
        return t.config;
    };
    const raw = readJson(configPath);
    const parsed = ts.parseJsonConfigFileContent(raw, ts.sys, repoRoot, undefined, path.basename(configPath));
    const program = ts.createProgram({
        rootNames: parsed.fileNames,
        options: parsed.options,
        projectReferences: parsed.projectReferences
    });
    const compilerOptions = program.getCompilerOptions();
    const srcRoot = path.join(repoRoot, 'src');
    const srcRootLower = path.normalize(srcRoot + path.sep).toLowerCase();

    /** @type {Set<string>} */
    const fileIds = new Set();
    /** @type {{ id: string, source: string, target: string }[]} */
    const edges = [];
    const seenEdge = new Set();

    const toId = (abs) => {
        const n = path.normalize(abs);
        return path.relative(repoRoot, n).split(path.sep).join('/');
    };
    const inProjectSrc = (abs) => {
        const n = path.normalize(abs).toLowerCase();
        return n.startsWith(srcRootLower) && (n.endsWith('.ts') || n.endsWith('.tsx')) && !n.endsWith('.d.ts');
    };

    for (const sf of program.getSourceFiles()) {
        if (sf.isDeclarationFile || !inProjectSrc(sf.fileName)) {
            continue;
        }
        fileIds.add(toId(sf.fileName));

        const fromId = toId(sf.fileName);
        ts.forEachChild(sf, (node) => {
            if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) {
                return;
            }
            const spec = node.moduleSpecifier;
            if (!spec || !ts.isStringLiteralLike(spec)) {
                return;
            }
            const name = spec.text;
            if (name.startsWith('node:') || name[0] !== '.' && !name.startsWith('@/')) {
                if (!name.startsWith('@cross-repo') && !name.startsWith('.')) {
                    return;
                }
            }
            const { resolvedModule } = ts.resolveModuleName(
                name,
                sf.fileName,
                compilerOptions,
                ts.sys
            );
            if (!resolvedModule || !resolvedModule.resolvedFileName) {
                return;
            }
            const toAbs = path.normalize(resolvedModule.resolvedFileName);
            if (onlySrc && !inProjectSrc(toAbs)) {
                return;
            }
            if (!inProjectSrc(toAbs)) {
                return;
            }
            const toIdN = toId(toAbs);
            fileIds.add(toIdN);
            const key = `${fromId}->${toIdN}`;
            if (seenEdge.has(key) || fromId === toIdN) {
                return;
            }
            seenEdge.add(key);
            edges.push({
                id: key,
                source: fromId,
                target: toIdN
            });
        });
    }

    const nodes = [...fileIds].sort().map((id) => {
        const p = id.replaceAll('/', path.sep);
        const layer = id.startsWith('src/main/')
            ? 'main'
            : id.startsWith('src/shared/')
              ? 'shared'
              : id.startsWith('src/renderer/')
                ? 'renderer'
                : 'other';
        return {
            id,
            label: id.split('/').pop() || id,
            path: p,
            layer
        };
    });

    return {
        nodes,
        edges,
        stats: { fileCount: nodes.length, edgeCount: edges.length }
    };
}

const main = () => {
    const out = buildProjectGraphData(defaultRepoRoot);
    process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
};

const thisFile = fileURLToPath(import.meta.url);
if (path.normalize(thisFile) === path.normalize(path.resolve(process.argv[1] ?? ''))) {
    main();
}

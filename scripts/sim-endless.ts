/**
 * REF-098: Fast, deterministic endless schedule sampler (mutator / floor-tag counts).
 * Run: yarn sim:endless [--floors=10000] [--seed=42]
 */
import { writeFileSync } from 'node:fs';
import { GAME_RULES_VERSION } from '../src/shared/contracts';
import { pickFloorScheduleEntry } from '../src/shared/floor-mutator-schedule';

const argv = process.argv.slice(2);
const numArg = (name: string, def: number): number => {
    const raw = argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
    return raw != null ? Number(raw) : def;
};

const floors = Math.max(1, Math.floor(numArg('floors', 10_000)));
const runSeed = Math.floor(numArg('seed', 42_001));

const mutatorCounts: Record<string, number> = {};
const floorTagCounts: Record<string, number> = {};

for (let level = 1; level <= floors; level++) {
    const { mutators, floorTag } = pickFloorScheduleEntry(runSeed, GAME_RULES_VERSION, level, 'endless');
    floorTagCounts[floorTag] = (floorTagCounts[floorTag] ?? 0) + 1;
    for (const m of mutators) {
        mutatorCounts[m] = (mutatorCounts[m] ?? 0) + 1;
    }
}

const lines = [
    'kind,key,count',
    ...Object.entries(floorTagCounts).map(([k, v]) => `floorTag,${k},${v}`),
    ...Object.entries(mutatorCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `mutator,${k},${v}`)
];

const csv = lines.join('\n') + '\n';
process.stdout.write(csv);

const out = argv.find((a) => a.startsWith('--out='))?.split('=')[1];
if (out) {
    writeFileSync(out, csv, 'utf8');
}

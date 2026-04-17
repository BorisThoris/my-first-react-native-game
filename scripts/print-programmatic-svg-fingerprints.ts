import { createHash } from 'crypto';
import { buildProgrammaticCardFaceSvg } from '../src/renderer/cardFace/programmaticCardFace';

const baseTile = (symbol: string, atomicVariant: number) => ({
    id: 't1',
    pairKey: '1-0',
    state: 'hidden' as const,
    symbol,
    label: symbol,
    atomicVariant
});

const fp = (svg: string): string => createHash('sha256').update(svg).digest('hex').slice(0, 20);

const variants = ['active', 'matched', 'mismatch'] as const;
const symbols = ['01', '12', '30'];
const atomicVariants = [0, 1, 4];

for (const symbol of symbols) {
    for (const variant of variants) {
        for (const atomicVariant of atomicVariants) {
            const key = `${symbol}-${variant}-${atomicVariant}`;
            const svg = buildProgrammaticCardFaceSvg(baseTile(symbol, atomicVariant), variant);
            console.log(`'${key}': '${fp(svg)}',`);
        }
    }
}

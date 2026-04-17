import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ILLUSTRATION_REGRESSION_PAIR_KEYS } from './illustrationRegressionPairKeys';

describe('illustrationRegressionPairKeys', () => {
    it('matches e2e illustration regression fixture pairKeys', () => {
        const fixturePath = path.resolve(process.cwd(), 'e2e/fixtures/tile-card-face-illustration-regression.json');
        const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as { pairKeys: readonly string[] };
        expect([...ILLUSTRATION_REGRESSION_PAIR_KEYS]).toEqual([...fixture.pairKeys]);
    });
});

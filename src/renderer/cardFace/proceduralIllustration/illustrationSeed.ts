import { hashPairKey } from '../../../shared/hashPairKey';
import { ILLUSTRATION_GEN_SCHEMA_VERSION } from './illustrationSchemaVersion';

/**
 * 32-bit deterministic seed for procedural card illustrations (same pairKey ⇒ same rolls).
 * Mixed with schema version so bumping rolls changes outputs globally.
 */
export const deriveIllustrationSeed = (pairKey: string): number => {
    let x = hashPairKey(pairKey) >>> 0;
    x ^= (ILLUSTRATION_GEN_SCHEMA_VERSION * 0x9e3779b9) >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;
    return x >>> 0;
};

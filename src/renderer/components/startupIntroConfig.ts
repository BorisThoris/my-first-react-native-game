export type IntroPreset = 'royal-sheen' | 'ember-fire' | 'molten-liquify' | 'arcane-pulse';
export type IntroPlaybackState = 'pending' | 'playing' | 'done';

export interface IntroSeed {
    entropy: number;
    hourBucket: string;
    sessionSeed: number;
}

export interface ResolvedIntroVariant {
    durationMs: number;
    preset: IntroPreset;
    seed: IntroSeed;
}

interface WeightedPreset {
    preset: IntroPreset;
    weight: number;
}

const FULL_PRESET_WEIGHTS: WeightedPreset[] = [
    { preset: 'royal-sheen', weight: 0.35 },
    { preset: 'ember-fire', weight: 0.25 },
    { preset: 'molten-liquify', weight: 0.2 },
    { preset: 'arcane-pulse', weight: 0.2 }
];

const REDUCED_MOTION_WEIGHTS: WeightedPreset[] = [
    { preset: 'royal-sheen', weight: 0.58 },
    { preset: 'arcane-pulse', weight: 0.42 }
];

export const DEFAULT_INTRO_DURATION_MS = 4200;
export const REDUCED_MOTION_INTRO_DURATION_MS = 1800;
export const DEFAULT_INTRO_ENTER_DURATION_MS = 520;
export const REDUCED_MOTION_INTRO_ENTER_DURATION_MS = 220;
export const DEFAULT_INTRO_EXIT_DURATION_MS = 460;
export const REDUCED_MOTION_INTRO_EXIT_DURATION_MS = 220;

const FALLBACK_SEED = 0xa341316c;

export const getIntroDurationMs = (reduceMotion: boolean): number =>
    reduceMotion ? REDUCED_MOTION_INTRO_DURATION_MS : DEFAULT_INTRO_DURATION_MS;

export const getIntroEnterDurationMs = (reduceMotion: boolean): number =>
    reduceMotion ? REDUCED_MOTION_INTRO_ENTER_DURATION_MS : DEFAULT_INTRO_ENTER_DURATION_MS;

export const getIntroExitDurationMs = (reduceMotion: boolean): number =>
    reduceMotion ? REDUCED_MOTION_INTRO_EXIT_DURATION_MS : DEFAULT_INTRO_EXIT_DURATION_MS;

export const getLocalHourBucket = (value: Date): string =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}-${String(
        value.getHours()
    ).padStart(2, '0')}`;

const coerceDate = (value?: Date | number): Date => {
    if (value instanceof Date) {
        return value;
    }

    return new Date(value ?? Date.now());
};

const getRuntimeEntropy = (): number => {
    try {
        if (typeof globalThis.crypto?.getRandomValues === 'function') {
            const buffer = new Uint32Array(1);
            globalThis.crypto.getRandomValues(buffer);
            return buffer[0] >>> 0;
        }
    } catch {
        return Date.now() >>> 0;
    }

    return Date.now() >>> 0;
};

export const hashString32 = (value: string): number => {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
};

export const mixSeed32 = (value: number): number => {
    let mixed = value >>> 0;
    mixed ^= mixed >>> 16;
    mixed = Math.imul(mixed, 0x85ebca6b);
    mixed ^= mixed >>> 13;
    mixed = Math.imul(mixed, 0xc2b2ae35);
    mixed ^= mixed >>> 16;

    return mixed >>> 0;
};

export const createSeededRandom = (seed: number): (() => number) => {
    let state = seed >>> 0 || FALLBACK_SEED;

    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let randomValue = state;
        randomValue = Math.imul(randomValue ^ (randomValue >>> 15), randomValue | 1);
        randomValue ^= randomValue + Math.imul(randomValue ^ (randomValue >>> 7), randomValue | 61);

        return ((randomValue ^ (randomValue >>> 14)) >>> 0) / 4294967296;
    };
};

export const createIntroSeed = ({
    entropy,
    now
}: {
    entropy?: number;
    now?: Date | number;
} = {}): IntroSeed => {
    const timestamp = coerceDate(now);
    const hourBucket = getLocalHourBucket(timestamp);
    const bucketHash = hashString32(hourBucket);
    const runtimeEntropy = entropy ?? getRuntimeEntropy();
    const minuteFragment = ((timestamp.getMinutes() & 0xff) << 8) | (timestamp.getSeconds() & 0xff);
    const mixed = mixSeed32(bucketHash ^ runtimeEntropy ^ minuteFragment);

    return {
        entropy: runtimeEntropy >>> 0,
        hourBucket,
        sessionSeed: mixed || FALLBACK_SEED
    };
};

export const pickWeightedIntroPreset = (seed: number, reduceMotion: boolean): IntroPreset => {
    const table = reduceMotion ? REDUCED_MOTION_WEIGHTS : FULL_PRESET_WEIGHTS;
    const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
    const roll = createSeededRandom(seed)() * totalWeight;
    let cursor = 0;

    for (const entry of table) {
        cursor += entry.weight;

        if (roll <= cursor) {
            return entry.preset;
        }
    }

    return table[table.length - 1].preset;
};

export const getIntroPresetIndex = (preset: IntroPreset): number => {
    switch (preset) {
        case 'royal-sheen':
            return 0;
        case 'ember-fire':
            return 1;
        case 'molten-liquify':
            return 2;
        case 'arcane-pulse':
            return 3;
        default:
            return 0;
    }
};

export const resolveIntroVariant = ({
    entropy,
    now,
    reduceMotion = false
}: {
    entropy?: number;
    now?: Date | number;
    reduceMotion?: boolean;
} = {}): ResolvedIntroVariant => {
    const seed = createIntroSeed({ entropy, now });

    return {
        durationMs: getIntroDurationMs(reduceMotion),
        preset: pickWeightedIntroPreset(seed.sessionSeed, reduceMotion),
        seed
    };
};

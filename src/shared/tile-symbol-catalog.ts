/** Read-only tile face symbols for gallery + gameplay (pair generation imports from here). */

/** Inclusive last floor level for the numeric (two-digit rank) symbol band. */
export const SYMBOL_BAND_LAST_LEVEL_NUMERIC = 8;
/** Inclusive last floor level for the letter / digit-mixed band before callsigns. */
export const SYMBOL_BAND_LAST_LEVEL_LETTER = 16;

export interface TileSymbolEntry {
    symbol: string;
    label: string;
}

export const LETTER_SYMBOLS: TileSymbolEntry[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '1',
    '2',
    '3',
    '4'
].map((value) => ({ symbol: value, label: value }));

export const NUMBER_SYMBOLS: TileSymbolEntry[] = Array.from({ length: 30 }, (_value, index) => {
    const next = String(index + 1).padStart(2, '0');
    return { symbol: next, label: next };
});

export const CALLSIGN_SYMBOLS: TileSymbolEntry[] = [
    ['AL', 'Alder'],
    ['BR', 'Briar'],
    ['CR', 'Crown'],
    ['DK', 'Dusk'],
    ['EL', 'Ember'],
    ['FL', 'Flare'],
    ['GL', 'Gale'],
    ['HR', 'Harbor'],
    ['IV', 'Ivory'],
    ['JN', 'Juniper'],
    ['KT', 'Kestrel'],
    ['LN', 'Lantern'],
    ['MR', 'Meteor'],
    ['NV', 'Nova'],
    ['OR', 'Oracle'],
    ['PR', 'Prism'],
    ['QT', 'Quartz'],
    ['RV', 'Raven'],
    ['SL', 'Signal'],
    ['TR', 'Torrent'],
    ['UL', 'Umber'],
    ['VL', 'Velvet'],
    ['WR', 'Whisper'],
    ['XR', 'Xylo'],
    ['YS', 'Yonder'],
    ['ZT', 'Zephyr'],
    ['C1', 'Cipher'],
    ['D2', 'Drift'],
    ['E3', 'Echo'],
    ['F4', 'Fathom']
].map(([symbol, label]) => ({ symbol, label }));

/** Symbol bands for gallery / mutators. Default level play rotates bands by floor (see {@link getSymbolSetIndexForLevel}). */
export const TILE_SYMBOL_SETS = [NUMBER_SYMBOLS, LETTER_SYMBOLS, CALLSIGN_SYMBOLS] as const;

export const ALL_TILE_SYMBOLS_FOR_GALLERY: TileSymbolEntry[] = [
    ...LETTER_SYMBOLS,
    ...NUMBER_SYMBOLS,
    ...CALLSIGN_SYMBOLS
];

/** Staged band index: numeric glyphs early, mixed letters mid, callsigns later (caps at last band). */
export const getSymbolSetIndexForLevel = (level: number): number => {
    const L = Math.max(1, Math.floor(level));
    if (L <= SYMBOL_BAND_LAST_LEVEL_NUMERIC) {
        return 0;
    }
    if (L <= SYMBOL_BAND_LAST_LEVEL_LETTER) {
        return 1;
    }
    return 2;
};

export const getSymbolSetForLevel = (level: number): readonly TileSymbolEntry[] =>
    TILE_SYMBOL_SETS[getSymbolSetIndexForLevel(level)];

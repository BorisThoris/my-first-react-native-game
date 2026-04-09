/** Read-only tile face symbols for gallery + gameplay (pair generation imports from here). */

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

/** Symbol bands for gallery / mutators. Default level play uses numeric ranks only (see {@link getSymbolSetForLevel}). */
export const TILE_SYMBOL_SETS = [NUMBER_SYMBOLS, LETTER_SYMBOLS, CALLSIGN_SYMBOLS] as const;

export const ALL_TILE_SYMBOLS_FOR_GALLERY: TileSymbolEntry[] = [
    ...LETTER_SYMBOLS,
    ...NUMBER_SYMBOLS,
    ...CALLSIGN_SYMBOLS
];

/** Index of the band used by {@link getSymbolSetForLevel} (always numeric — no letter/callsign rotation). */
export const getSymbolSetIndexForLevel = (_level: number): number => 0;

export const getSymbolSetForLevel = (_level: number): readonly TileSymbolEntry[] => NUMBER_SYMBOLS;

/**
 * Central list for in-run keyboard help (GameScreen overlay). Keep labels concise; match actual handlers.
 */
export const GAMEPLAY_SHORTCUT_ROWS: ReadonlyArray<{ id: string; keys: string; description: string }> = [
    { id: 'pause', keys: 'P', description: 'Pause or resume the run' },
    { id: 'help', keys: '? or F1', description: 'Open this keyboard shortcuts list' }
];

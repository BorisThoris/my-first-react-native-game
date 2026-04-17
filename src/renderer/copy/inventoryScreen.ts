/**
 * User-visible strings for Inventory (run snapshot). Centralized for a11y review and future i18n.
 * Perfect Memory wording matches `ACH_PERFECT_CLEAR` in mechanics-encyclopedia and `powersUsedThisRun` in contracts.
 */
export const inventoryScreenCopy = {
    perfectMemoryPowersHint: (achievementsEnabled: boolean, powersUsedThisRun: boolean): string => {
        const rules =
            'Perfect Memory unlocks when your last cleared level had zero mismatches and you never used disallowed powers that run: shuffle (full-board or row/region), destroy pair, peek, undo resolve, gambit, stray remove, flash pair, or wild match. Pins are allowed.';
        if (!achievementsEnabled) {
            return `${rules} Achievements are off for this run — Perfect Memory is not tracked.`;
        }
        if (powersUsedThisRun) {
            return `${rules} A disallowed power was already used — Perfect Memory will not unlock this run.`;
        }
        return `${rules} Avoid those powers through the end of the run to stay eligible.`;
    }
};

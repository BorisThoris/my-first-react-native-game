/**
 * Match-score floater live region (`aria-live`). Centralized for a11y review and future i18n.
 */
export function matchScoreFloaterLiveRegionText(amount: number): string {
    return `Plus ${amount.toLocaleString()} points`;
}

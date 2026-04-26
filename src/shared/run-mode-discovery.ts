import type { RunModeDefinition } from './run-mode-catalog';

export interface RunModeDiscoveryRow {
    id: string;
    title: string;
    availability: RunModeDefinition['availability'];
    startLabel: string;
    selectedCopy: string;
    lockedReason: string | null;
    browseHint: string;
}

export interface RunModeDiscoveryState {
    browseHint: string;
    emptyState: string | null;
    searchState: string;
    selectedModeHint: string;
}

export const buildRunModeDiscoveryRows = (modes: readonly RunModeDefinition[]): RunModeDiscoveryRow[] =>
    modes.map((mode) => {
        const lockedReason =
            mode.availability === 'locked'
                ? mode.availabilityDetail ?? 'Locked for this build; requirements are not met yet.'
                : null;
        return {
            id: mode.id,
            title: mode.title,
            availability: mode.availability,
            startLabel: mode.availability === 'available' ? `Start ${mode.title}` : `View ${mode.title} details`,
            selectedCopy:
                mode.availability === 'available'
                    ? `${mode.title} is playable now. Open details or start from this card.`
                    : `${mode.title} is locked: ${lockedReason}`,
            lockedReason,
            browseHint: 'Use search, page controls, or horizontal browse to compare modes.'
        };
    });

export const filterRunModesForDiscovery = (
    modes: readonly RunModeDefinition[],
    query: string
): readonly RunModeDefinition[] => {
    const q = query.trim().toLowerCase();
    if (!q) {
        return modes;
    }
    return modes.filter((mode) =>
        [
            mode.title,
            mode.shortDescription,
            mode.promise,
            mode.eligibilityNote,
            mode.availabilityDetail,
            mode.challengeGateSummary
        ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(q))
    );
};

export const buildRunModeDiscoveryState = ({
    availableModeCount,
    filteredCount,
    pageCount,
    pageIndex,
    query
}: {
    availableModeCount: number;
    filteredCount: number;
    pageCount: number;
    pageIndex: number;
    query: string;
}): RunModeDiscoveryState => {
    const trimmed = query.trim();
    const hasQuery = trimmed.length > 0;
    if (filteredCount === 0) {
        return {
            selectedModeHint: 'Start selected mode from a card or open details first.',
            browseHint: hasQuery ? 'Clear the search to browse all modes.' : 'Use search or browse controls to compare modes.',
            searchState: hasQuery ? `No results for “${trimmed}”.` : `${availableModeCount} playable mode(s) available.`,
            emptyState: hasQuery ? `No modes match “${trimmed}”.` : 'No modes available in this build.'
        };
    }
    return {
        selectedModeHint: 'Start selected mode from the highlighted card or open details for rules.',
        browseHint: pageCount > 1 ? `Page ${pageIndex + 1} of ${pageCount} · use dots, drag, or search.` : 'All matching modes are visible.',
        searchState: hasQuery ? `${filteredCount} result(s) for “${trimmed}”.` : `${availableModeCount} playable mode(s) available.`,
        emptyState: null
    };
};

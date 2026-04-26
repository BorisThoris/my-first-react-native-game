import type { SaveData, RunSummary } from './contracts';
import { getProfileSummaryRows } from './profile-summary';
import { getObjectiveBoardItems } from './objective-board';
import { getSocialPlayScopeRows } from './social-play-scope';

export type MainMenuHubQualityId = 'mode_entry' | 'profile_strip' | 'return_loop' | 'trust_boundary';

export interface MainMenuHubQualityRow {
    id: MainMenuHubQualityId;
    label: string;
    value: string;
    description: string;
    aboveFold: boolean;
    localOnly: true;
}

export const getMainMenuHubQualityRows = (
    save: SaveData,
    lastRunSummary: RunSummary | null
): MainMenuHubQualityRow[] => {
    const profileRows = getProfileSummaryRows(save);
    const objectives = getObjectiveBoardItems(save);
    const shippedSocial = getSocialPlayScopeRows().find((row) => row.status === 'shipped');
    const profileLevel = profileRows.find((row) => row.id === 'profile_level')?.value ?? '1';
    const bestScore = profileRows.find((row) => row.id === 'best_score')?.value ?? '0';
    const activeObjective = objectives.find((row) => row.status === 'active') ?? objectives[0];

    return [
        {
            id: 'mode_entry',
            label: 'Mode entry',
            value: 'Play',
            description: 'Primary hub action routes to Choose Path for every playable local mode.',
            aboveFold: true,
            localOnly: true
        },
        {
            id: 'profile_strip',
            label: 'Profile strip',
            value: `Level ${profileLevel} · ${bestScore} best`,
            description: activeObjective
                ? `Next goal: ${activeObjective.title} (${activeObjective.progress.current}/${activeObjective.progress.target}).`
                : 'Profile progress is driven by local saves.',
            aboveFold: true,
            localOnly: true
        },
        {
            id: 'return_loop',
            label: 'Return loop',
            value: lastRunSummary ? `Last floor ${lastRunSummary.highestLevel}` : 'No recent run',
            description: lastRunSummary
                ? 'Recent descent summary stays visible so game-over returns have context.'
                : 'Start a run to create local history.',
            aboveFold: false,
            localOnly: true
        },
        {
            id: 'trust_boundary',
            label: 'Trust boundary',
            value: shippedSocial?.title ?? 'Share-only social layer',
            description: 'No mandatory account, fake community feed, or online leaderboard promise appears in the hub.',
            aboveFold: true,
            localOnly: true
        }
    ];
};

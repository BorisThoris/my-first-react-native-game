import type { SaveData } from './contracts';

export type DailyArchiveScope = 'daily' | 'weekly' | 'season';

export interface DailyArchiveIdentity {
    scope: DailyArchiveScope;
    key: string;
    archiveType?: DailyArchiveScope;
    archiveKey?: string;
    status?: 'completed' | 'active';
    title: string;
    description: string;
    localOnly: true;
    onlineLeaderboardDeferred: true;
    comparisonString: string;
    sourceFields: string[];
}

export interface DailyArchiveSummary {
    rows: DailyArchiveIdentity[];
    dailiesCompleted: number;
    completedDailies?: number;
    streak: number;
    currentStreak?: number;
    lastDailyDateKeyUtc: string | null;
    offlineOnly: true;
    onlineRequired?: false;
}

const parseDateKeyUtc = (dateKey: string | null | undefined): Date | null => {
    if (!dateKey || !/^\d{8}$/.test(dateKey)) {
        return null;
    }
    const year = Number(dateKey.slice(0, 4));
    const month = Number(dateKey.slice(4, 6)) - 1;
    const day = Number(dateKey.slice(6, 8));
    return new Date(Date.UTC(year, month, day));
};

const formatDateKey = (date: Date): string =>
    `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`;

const isoWeekKey = (date: Date | null): string => {
    if (!date) {
        return 'week:none';
    }
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

const seasonKey = (date: Date | null): string => {
    if (!date) {
        return 'season:none';
    }
    const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
    return `${date.getUTCFullYear()}-S${quarter}`;
};

export const dailyArchiveDateKeyForTimestamp = (timestampMs: number): string =>
    formatDateKey(new Date(timestampMs));

export const weekKeyForDaily = (dateKey: string): string => isoWeekKey(parseDateKeyUtc(dateKey));

export const seasonKeyForDaily = (dateKey: string): string => seasonKey(parseDateKeyUtc(dateKey));

export const getDailyArchiveSummary = (save: SaveData, nowMs: number = Date.now()): DailyArchiveSummary => {
    const ps = save.playerStats;
    const completed = ps?.dailiesCompleted ?? 0;
    const streak = ps?.dailyStreakCosmetic ?? 0;
    const lastKey = ps?.lastDailyDateKeyUtc ?? null;
    const lastDate = parseDateKeyUtc(lastKey);
    const todayKey = dailyArchiveDateKeyForTimestamp(nowMs);
    const effectiveDate = lastDate ?? parseDateKeyUtc(todayKey);
    const rows: DailyArchiveIdentity[] = [
        {
            scope: 'daily',
            key: lastKey ?? todayKey,
            archiveType: 'daily',
            archiveKey: lastKey ?? todayKey,
            status: completed > 0 ? 'completed' : 'active',
            title: 'Daily archive',
            description: 'Local UTC daily identity and completion count.',
            localOnly: true,
            onlineLeaderboardDeferred: true,
            comparisonString:
                completed > 0
                    ? `Last daily ${lastKey ?? 'unknown'} · ${completed} local clears · streak ${streak}`
                    : `Today ${todayKey} · no local clear recorded yet`,
            sourceFields: ['playerStats.dailiesCompleted', 'playerStats.lastDailyDateKeyUtc', 'playerStats.dailyStreakCosmetic']
        },
        {
            scope: 'weekly',
            key: isoWeekKey(effectiveDate),
            archiveType: 'weekly',
            archiveKey: isoWeekKey(effectiveDate),
            status: completed > 0 ? 'completed' : 'active',
            title: 'Weekly archive',
            description: 'Derived from UTC daily keys; stores no online season authority.',
            localOnly: true,
            onlineLeaderboardDeferred: true,
            comparisonString: `${isoWeekKey(effectiveDate)} · ${completed} cumulative local daily clears`,
            sourceFields: ['playerStats.lastDailyDateKeyUtc', 'playerStats.dailiesCompleted']
        },
        {
            scope: 'season',
            key: seasonKey(effectiveDate),
            archiveType: 'season',
            archiveKey: seasonKey(effectiveDate),
            status: completed > 0 ? 'completed' : 'active',
            title: 'Season archive',
            description: 'Offline season label for local journaling and future export strings.',
            localOnly: true,
            onlineLeaderboardDeferred: true,
            comparisonString: `${seasonKey(effectiveDate)} · streak ${streak} · online boards deferred`,
            sourceFields: ['playerStats.dailyStreakCosmetic', 'docs/LEADERBOARDS_DEFERRAL.md']
        }
    ];
    return {
        rows,
        dailiesCompleted: completed,
        completedDailies: completed,
        streak,
        currentStreak: streak,
        lastDailyDateKeyUtc: lastKey,
        offlineOnly: true,
        onlineRequired: false
    };
};

export const getDailyArchiveRows = (save: SaveData, nowMs: number = Date.now()): DailyArchiveIdentity[] =>
    getDailyArchiveSummary(save, nowMs).rows;

export const buildDailyArchiveShareString = (save: SaveData): string => {
    const summary = getDailyArchiveSummary(save);
    const daily = summary.rows[0]!;
    const last = save.lastRunSummary;
    const score = last?.gameMode === 'daily' ? ` · ${last.totalScore} pts · ${last.levelsCleared} clear(s)` : '';
    return `Daily ${daily.key}${score} · ${summary.dailiesCompleted} local-only daily clear(s) · streak ${summary.streak}`;
};

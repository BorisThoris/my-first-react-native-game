/**
 * User-visible strings for the post-run summary (GameOverScreen). Centralized for a11y review and future i18n.
 */
export const gameOverScreenCopy = {
    heroEyebrow: 'Run complete',
    heroTitle: 'Expedition Over',
    scoreLabel: 'Score',
    floorCaption: (highestLevel: number) =>
        `Floor ${highestLevel} reached before the archive sealed — details below.`,
    politeRunSummary: (totalScore: number, highestLevel: number) =>
        `Expedition complete. Final score ${totalScore.toLocaleString()}. Highest floor ${highestLevel}.`,
    achievementsNoteOn: 'Achievements counted for this run.',
    achievementsNoteOff: 'Achievements were off (debug tools used).',
    actionKicker: 'Next move',
    actionHeading: 'Continue the archive',
    playAgainLabel: 'Play Again',
    playAgainAriaLabel: 'Play Again — start a new run after this expedition',
    mainMenuLabel: 'Main Menu',
    mainMenuAriaLabel: 'Return to the main menu',
    runSnapshotKicker: 'Run snapshot',
    statLabels: {
        highestFloor: 'Highest Floor',
        bestStreak: 'Best Streak',
        perfectFloors: 'Perfect Floors',
        floorsCleared: 'Floors Cleared',
        bestScore: 'Best Score'
    },
    runModeHeadings: {
        daily: (dateKey: string) => `Daily ${dateKey}`,
        gauntlet: 'Gauntlet descent',
        meditation: 'Meditation descent',
        puzzle: 'Puzzle descent',
        classic: 'Classic descent'
    },
    modeIdentity: {
        gauntlet: 'Timed pressure: achievements still count, but the wall-clock can end the run.',
        meditation: 'Focused comfort: calmer memorize pacing for study and mutator practice.',
        puzzle: 'Curated challenge: fixed board and local completion tracking.',
        daily: 'Shared UTC seed: local-only comparison, no online leaderboard.',
        classic: 'Long-run core: routes, shop gold, relics, and featured objectives.'
    },
    flipHistoryCopy: (flipCount: number) =>
        flipCount > 0
            ? `${flipCount} flips recorded locally for this session.`
            : 'No flip history stored for this run.',
    achievementEyebrow: 'Unlocked',
    achievementHeading: 'New archive entries',
    flipTimelineSummary: 'Flip timeline'
} as const;

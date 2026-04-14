import { useId, type ReactNode } from 'react';
import { MAX_LIVES, type MutatorId, type RunState } from '../../shared/contracts';
import { hasMutator } from '../../shared/mutators';
import codexBookUrl from '../assets/ui/icons/icon-codex-book-v1.svg?url';
import scoreParasiteCrystalUrl from '../assets/ui/icons/icon-score-parasite-crystal.svg?url';
import shuffleIconUrl from '../assets/ui/icons/icon-shuffle-v1.svg?url';
import styles from './GameScreen.module.css';

const MUTATOR_HUD_LABELS: Record<MutatorId, string> = {
    glass_floor: 'Glass floor',
    sticky_fingers: 'Sticky fingers',
    score_parasite: 'Score parasite',
    category_letters: 'Letters',
    short_memorize: 'Short memorize',
    wide_recall: 'Wide recall',
    silhouette_twist: 'Silhouette',
    n_back_anchor: 'N-back',
    distraction_channel: 'Distraction',
    findables_floor: 'Findables',
    shifting_spotlight: 'Shifting spotlight'
};

const getMutatorChipTitle = (id: MutatorId): string => {
    if (id === 'sticky_fingers') {
        return 'Sticky fingers — your next opening flip must use a different slot than the tile you matched last.';
    }
    return MUTATOR_HUD_LABELS[id] ?? id;
};

const mutatorChipStyle = (id: MutatorId): string | undefined => {
    switch (id) {
        case 'short_memorize':
            return styles.mutatorChipShortMemorize;
        case 'n_back_anchor':
            return styles.mutatorChipNBack;
        case 'shifting_spotlight':
            return styles.mutatorChipShiftingSpotlight;
        default:
            return undefined;
    }
};

const MutatorChipGlyph = ({ mutator }: { mutator: MutatorId }) => {
    switch (mutator) {
        case 'short_memorize':
            return (
                <span aria-hidden="true" className={styles.mutatorChipGlyphSvg}>
                    <svg className={styles.mutatorChipSvg} viewBox="0 0 16 16">
                        <circle cx="8" cy="8" fill="none" r="6.25" stroke="currentColor" strokeWidth="1.35" />
                        <path d="M8 4.35V8l2.6 1.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" />
                    </svg>
                </span>
            );
        case 'n_back_anchor':
            return (
                <span aria-hidden="true" className={styles.mutatorChipGlyphSvg}>
                    <svg className={styles.mutatorChipSvg} viewBox="0 0 16 16">
                        <path
                            d="M3.4 10.2c0-2.1 1.7-3.8 3.8-3.8h1.6c2.1 0 3.8 1.7 3.8 3.8v1.1H3.4z"
                            fill="none"
                            stroke="currentColor"
                            strokeLinejoin="round"
                            strokeWidth="1.25"
                        />
                        <path d="M8 2.7v3.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
                        <circle cx="8" cy="2.2" fill="currentColor" r="1.05" />
                    </svg>
                </span>
            );
        case 'shifting_spotlight':
            return (
                <span aria-hidden="true" className={styles.mutatorChipSpotlightPair}>
                    <span className={styles.mutatorChipSpotWard} />
                    <span className={styles.mutatorChipSpotBounty} />
                </span>
            );
        default:
            return null;
    }
};

export interface GameplayHudBarProps {
    run: RunState;
    cameraViewportMode: boolean;
    /** Precomputed from host clock (`gauntletDeadlineMs - now`), or null when gauntlet is off. */
    gauntletRemainingMs: number | null;
    /** HUD-015: low-frequency status line for screen readers (`aria-live="polite"`). */
    politeHudAnnouncement?: string;
}

const GameplayHudBar = ({
    run,
    cameraViewportMode,
    gauntletRemainingMs,
    politeHudAnnouncement = ''
}: GameplayHudBarProps) => {
    const floorHexUid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const floorHexStrokeGradId = `hud-floor-hex-stroke-${floorHexUid}`;
    const floorHexFillGradId = `hud-floor-hex-fill-${floorHexUid}`;

    const board = run.board;
    if (!board) {
        return null;
    }

    const dailyDateStripKey = run.gameMode === 'daily' && run.dailyDateKeyUtc ? run.dailyDateKeyUtc : null;
    const hudModeLabel =
        dailyDateStripKey != null
            ? 'Daily challenge'
            : gauntletRemainingMs !== null
              ? 'Gauntlet'
              : run.activeContract?.noShuffle
                ? 'Scholar Contract'
                : run.gameMode === 'meditation'
                  ? 'Meditation Run'
                  : run.wildMenuRun
                    ? 'Wild Run'
                    : 'Arcade Run';
    const nBackMutatorActive = run.activeMutators.includes('n_back_anchor');
    const nBackLabel =
        run.nBackAnchorPairKey && nBackMutatorActive ? `Anchor ${run.nBackAnchorPairKey.slice(0, 6)}` : null;
    const scoreParasiteActive = run.activeMutators.includes('score_parasite');
    const parasiteFloorProgress = Math.min(1, run.parasiteFloors / 4);
    const mutatorsForChips = run.activeMutators.filter((id) => !(scoreParasiteActive && id === 'score_parasite'));
    const contextChips: { className: string; key: string; label: string; testId: string; title: string; glyph: ReactNode }[] = [];
    if (run.gameMode === 'gauntlet') {
        contextChips.push({
            className: styles.mutatorChipGauntlet,
            glyph: (
                <span aria-hidden="true" className={styles.mutatorChipGlyphSvg}>
                    <svg className={styles.mutatorChipSvg} viewBox="0 0 16 16">
                        <rect fill="none" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.2" width="9" x="3.5" y="3.5" />
                        <path d="M8 2.4V4.2M8 11.8v1.8M2.4 8H4.2M11.8 8H13.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.1" />
                    </svg>
                </span>
            ),
            key: 'ctx-gauntlet',
            label: 'Gauntlet',
            testId: 'hud-chip-gauntlet',
            title: 'Timed gauntlet run — clear floors before the clock hits zero'
        });
    }
    if (run.activeContract?.noShuffle) {
        contextChips.push({
            className: styles.mutatorChipScholar,
            glyph: (
                <span aria-hidden="true" className={styles.mutatorChipGlyphImg}>
                    <img alt="" className={styles.mutatorChipBookImg} height={14} src={codexBookUrl} width={14} />
                </span>
            ),
            key: 'ctx-scholar',
            label: 'Scholar',
            testId: 'hud-chip-scholar',
            title: 'Scholar contract: board shuffle is disabled'
        });
    }
    if (run.shuffleScoreTaxActive) {
        contextChips.push({
            className: styles.mutatorChipShuffleTax,
            glyph: (
                <span aria-hidden="true" className={styles.mutatorChipGlyphImg}>
                    <img alt="" className={styles.mutatorChipShuffleImg} height={14} src={shuffleIconUrl} width={14} />
                </span>
            ),
            key: 'ctx-shuffle-tax',
            label: 'Shuffle tax',
            testId: 'hud-chip-shuffle-tax',
            title: 'Match score multiplier is reduced after shuffles this run'
        });
    }
    const showMutatorChipRow = contextChips.length > 0 || mutatorsForChips.length > 0;
    const showNoMutatorsCopy = run.activeMutators.length === 0 && contextChips.length === 0;

    /*
     * PLAY-003 (HUD IA): Primary row keeps the reference “slim strip” read — floor, lives, shards, hero score,
     * plus identity widgets (daily id, score-parasite) in the top-right grid cell. Mode label, mutator/context
     * chips, and the compact stat rail move to a second slim strip below on wide layouts so they do not set
     * the primary row’s height or compete optically with score. Narrow / mobile camera stacks the primary
     * grid first, then this context strip (toolbar flyout was considered and rejected here to avoid hiding
     * live mutator state behind an extra tap).
     */
    return (
        <header
            className={`${styles.hudRow} ${cameraViewportMode ? styles.mobileCameraHud : ''}`}
            data-testid="game-hud"
        >
            <div className={`${styles.floatingDeck} ${styles.statsDeck} ${styles.hudDeck}`} role="group" aria-label="Run stats">
                <div className={styles.hudDeckDualRow}>
                    <div className={styles.hudPrimaryStatsRow}>
                    <div className={styles.hudStripLeftModule} data-testid="hud-wing-left">
                        <div className={styles.floorBadgeHexFrame} data-testid="hud-floor-hex-frame">
                            <svg
                                aria-hidden="true"
                                className={styles.floorBadgeHexSvg}
                                preserveAspectRatio="xMidYMid meet"
                                viewBox="0 0 72 88"
                            >
                                <defs>
                                    <linearGradient
                                        id={floorHexStrokeGradId}
                                        gradientUnits="userSpaceOnUse"
                                        x1="8"
                                        x2="64"
                                        y1="10"
                                        y2="78"
                                    >
                                        <stop offset="0%" stopColor="#F2D39D" stopOpacity="0.95" />
                                        <stop offset="42%" stopColor="#C3954F" />
                                        <stop offset="100%" stopColor="#6B441B" stopOpacity="0.9" />
                                    </linearGradient>
                                    <linearGradient id={floorHexFillGradId} x1="36" x2="36" y1="12" y2="76" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#F2D39D" stopOpacity="0.14" />
                                        <stop offset="55%" stopColor="#8A6228" stopOpacity="0.06" />
                                        <stop offset="100%" stopColor="#0a0c12" stopOpacity="0.22" />
                                    </linearGradient>
                                </defs>
                                <polygon
                                    fill={`url(#${floorHexFillGradId})`}
                                    points="36,3 68,25 68,63 36,85 4,63 4,25"
                                    stroke={`url(#${floorHexStrokeGradId})`}
                                    strokeLinejoin="round"
                                    strokeWidth="2.35"
                                />
                                <polygon
                                    fill="none"
                                    points="36,9.5 62.5,28.5 62.5,59.5 36,78.5 9.5,59.5 9.5,28.5"
                                    stroke="#F2D39D"
                                    strokeLinejoin="round"
                                    strokeOpacity="0.38"
                                    strokeWidth="0.85"
                                />
                            </svg>
                            <div className={`${styles.hudSegment} ${styles.floorBadge}`} title="Current floor">
                                <span className={styles.floorLabel}>Floor</span>
                                <span className={styles.floorValue}>{board.level}</span>
                                {board.floorTag === 'boss' ? (
                                    <span className={styles.floorTagPill} title="Boss floor scoring">
                                        Boss
                                    </span>
                                ) : board.floorTag === 'breather' ? (
                                    <span className={styles.floorTagPill} title="Breather floor">
                                        Rest
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        <div className={styles.hudStripDivider} aria-hidden="true" />
                        {/*
                         * PLAY-004: Reference mock shows three hearts; live rules cap at MAX_LIVES (5).
                         * Product: honest contract — always render MAX_LIVES heart slots plus an explicit
                         * current/max readout so five empty/filled slots stay legible on narrow HUD widths.
                         */}
                        <div className={`${styles.hudSegment} ${styles.hudLivesSegment}`}>
                            <span className={styles.statKey}>Lives</span>
                            <div
                                className={styles.lifeTrack}
                                aria-label={`${run.lives} of ${MAX_LIVES} lives remaining`}
                            >
                                {Array.from({ length: MAX_LIVES }).map((_, index) => (
                                    <span
                                        aria-hidden="true"
                                        className={index < run.lives ? styles.lifeHeartActive : styles.lifeHeartInactive}
                                        key={`life-${index}`}
                                    >
                                        ♥
                                    </span>
                                ))}
                            </div>
                            <span className={`${styles.statSubline} ${styles.lifeCapReadout}`} aria-hidden="true">
                                {run.lives} / {MAX_LIVES}
                            </span>
                        </div>
                        <div className={styles.hudStripDivider} aria-hidden="true" />
                        <div className={`${styles.hudSegment} ${styles.statPill} ${styles.hudShardsSegment}`}>
                            <span className={styles.statKey}>Shards</span>
                            <span className={`${styles.statVal} ${styles.hudShardsValue}`}>{run.stats.comboShards}</span>
                            <span className={styles.statSubline}>Guards {run.stats.guardTokens}</span>
                        </div>
                    </div>
                    <div
                        className={`${styles.hudStripDivider} ${styles.hudStripDividerBetweenZones}`}
                        aria-hidden="true"
                    />
                    <div className={styles.hudStripScoreModule} data-testid="hud-wing-center">
                        <div className={`${styles.hudSegment} ${styles.hudScoreSegment}`}>
                            <span className={styles.statKey}>Score</span>
                            <span className={`${styles.statVal} ${styles.statValScore}`}>
                                {run.stats.totalScore.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div
                        className={`${styles.hudStripDivider} ${styles.hudStripDividerBetweenZones}`}
                        aria-hidden="true"
                    />
                    <div className={styles.hudStripRightModule}>
                        {dailyDateStripKey ? (
                            <div
                                className={`${styles.hudSegment} ${styles.hudDailySegment} ${styles.hudContextAux}`}
                                title="UTC daily challenge id"
                            >
                                <span className={styles.statKey}>Daily</span>
                                <span className={styles.hudDailyDate}>{dailyDateStripKey}</span>
                            </div>
                        ) : null}
                        {dailyDateStripKey && scoreParasiteActive ? (
                            <div className={styles.hudStripDivider} aria-hidden="true" />
                        ) : null}
                        {scoreParasiteActive ? (
                            <div
                                aria-label={`Score parasite: ${run.parasiteFloors} of 4 floors toward life drain.${
                                    run.parasiteWardRemaining > 0
                                        ? ` ${run.parasiteWardRemaining} parasite ward charge${
                                              run.parasiteWardRemaining === 1 ? '' : 's'
                                          }.`
                                        : ''
                                }`}
                                className={styles.hudParasiteSegment}
                                title="Every four floor advances with this mutator can drain a life. A Parasite ward charge absorbs one drain instead (relic: Parasite ward)."
                            >
                                <div className={styles.hudParasiteRow}>
                                    <div className={styles.hudParasiteCrystalWrap} aria-hidden="true">
                                        <img
                                            alt=""
                                            className={styles.hudParasiteCrystal}
                                            height={30}
                                            src={scoreParasiteCrystalUrl}
                                            width={24}
                                        />
                                    </div>
                                    <div className={styles.hudParasiteBody}>
                                        <span className={styles.hudParasiteLabel}>
                                            {MUTATOR_HUD_LABELS.score_parasite}
                                        </span>
                                        <div className={styles.hudParasiteTrack}>
                                            <div
                                                className={styles.hudParasiteFill}
                                                style={{ width: `${parasiteFloorProgress * 100}%` }}
                                            />
                                        </div>
                                        <span className={styles.hudParasiteCaption}>
                                            {run.parasiteFloors} / 4 floors
                                        </span>
                                        {run.parasiteWardRemaining > 0 ? (
                                            <span
                                                className={styles.hudParasiteWard}
                                                data-testid="hud-parasite-ward"
                                            >
                                                Ward ×{run.parasiteWardRemaining}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                    </div>
                    <div
                        className={`${styles.hudContextSecondaryStrip} ${styles.hudContextRegion}`}
                        data-testid="hud-wing-right"
                        role="group"
                        aria-label="Run context"
                    >
                        <div className={styles.hudStripRightInnerColumn}>
                            <div className={`${styles.hudSegment} ${styles.hudMetaSegment}`}>
                                <span className={styles.statKey}>Mode</span>
                                <span className={styles.statVal}>{hudModeLabel}</span>
                                {nBackLabel ? <span className={styles.statSubline}>{nBackLabel}</span> : null}
                                {showMutatorChipRow ? (
                                    <div className={styles.mutatorRow}>
                                        {contextChips.map((chip) => (
                                            <div
                                                className={`${styles.mutatorChip} ${chip.className}`}
                                                data-testid={chip.testId}
                                                key={chip.key}
                                                title={chip.title}
                                            >
                                                {chip.glyph}
                                                <span className={styles.mutatorChipLabel}>{chip.label}</span>
                                            </div>
                                        ))}
                                        {mutatorsForChips.map((mutator) => (
                                            <div
                                                className={[styles.mutatorChip, mutatorChipStyle(mutator)]
                                                    .filter(Boolean)
                                                    .join(' ')}
                                                data-testid={`hud-mutator-chip-${mutator}`}
                                                key={mutator}
                                                title={getMutatorChipTitle(mutator)}
                                            >
                                                <MutatorChipGlyph mutator={mutator} />
                                                <span className={styles.mutatorChipLabel}>
                                                    {MUTATOR_HUD_LABELS[mutator] ?? mutator}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : showNoMutatorsCopy ? (
                                    <span className={styles.statSubline}>No active mutators</span>
                                ) : null}
                            </div>

                            <div className={styles.statRail}>
                                {gauntletRemainingMs !== null ? (
                                    <div className={styles.statPillCompact} title="Gauntlet time left">
                                        <span className={styles.statKey}>Time</span>
                                        <span className={styles.statVal}>{Math.ceil(gauntletRemainingMs / 1000)}s</span>
                                    </div>
                                ) : null}
                                {hasMutator(run, 'findables_floor') ? (
                                    <div
                                        className={styles.statPillCompact}
                                        data-testid="hud-findables-claimed"
                                        title="Bonus pickups claimed by matching pairs this floor"
                                    >
                                        <span className={styles.statKey}>Findables</span>
                                        <span className={styles.statVal}>{run.findablesClaimedThisFloor}</span>
                                    </div>
                                ) : null}
                                {run.activeContract?.noShuffle ? (
                                    <div className={styles.statPillCompact}>
                                        <span className={styles.statKey}>Contract</span>
                                        <span className={styles.statVal}>Scholar</span>
                                    </div>
                                ) : null}
                                {run.activeContract?.maxPinsTotalRun != null ? (
                                    <div className={styles.statPillCompact} title="Pin vow contract">
                                        <span className={styles.statKey}>Pins</span>
                                        <span className={styles.statVal}>
                                            {run.pinsPlacedCountThisRun}/{run.activeContract.maxPinsTotalRun}
                                        </span>
                                    </div>
                                ) : null}
                                {run.gameMode === 'meditation' ? (
                                    <div className={styles.statPillCompact} title="Meditation run">
                                        <span className={styles.statKey}>Mode</span>
                                        <span className={styles.statVal}>Meditation</span>
                                    </div>
                                ) : null}
                                {run.wildMenuRun ? (
                                    <div className={styles.statPillCompact} title="Wild joker run">
                                        <span className={styles.statKey}>Wild</span>
                                        <span className={styles.statVal}>On</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                aria-atomic="true"
                aria-live="polite"
                className={styles.srOnly}
                data-testid="hud-polite-live-region"
                role="status"
            >
                {politeHudAnnouncement}
            </div>
        </header>
    );
};

export default GameplayHudBar;

import { NotificationHost, useNotificationStore } from '@cross-repo-libs/notifications';
import { act, fireEvent, render } from '@testing-library/react';
import { forwardRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RunState } from '../../shared/contracts';
import { createNewRun, finishMemorizePhase } from '../../shared/game';
import { createDefaultSaveData } from '../../shared/save-data';
import { PlatformTiltProvider } from '../platformTilt/PlatformTiltProvider';
import { useAppStore } from '../store/useAppStore';
import GameScreen from './GameScreen';

vi.mock('./MainMenuBackground', () => ({ default: () => null }));
vi.mock('./GameLeftToolbar', () => ({ default: () => null }));
vi.mock('./GameplayHudBar', () => ({ default: () => null }));
vi.mock('./TileBoard', () => ({
    default: forwardRef(function TileBoardStub(_props, ref) {
        return <div data-testid="tile-board-stub" ref={ref as never} />;
    })
}));
vi.mock('../hooks/useViewportSize', () => ({
    useViewportSize: () => ({ width: 1280, height: 800 })
}));
vi.mock('../hooks/useDistractionChannelTick', () => ({
    useDistractionChannelTick: () => 0
}));
vi.mock('../hooks/useHudPoliteLiveAnnouncement', () => ({
    detectClaimedFindableKind: () => null,
    getFindableToastText: () => '',
    useHudPoliteLiveAnnouncement: () => ''
}));
vi.mock('../platformTilt/usePlatformTiltField', () => ({
    usePlatformTiltField: () => ({ tiltRef: { current: null } })
}));

const achievementNotifications = (): number =>
    useNotificationStore.getState().notifications.filter((n) => n.surface === 'achievement').length;

const levelCompleteRunFixture = (): RunState => {
    const baseRun = createNewRun(0);
    return {
        ...baseRun,
        status: 'levelComplete',
        lives: 5,
        relicOffer: null,
        stats: {
            ...baseRun.stats,
            totalScore: 120,
            currentLevelScore: 120,
            tries: 1,
            rating: 'S',
            levelsCleared: 1,
            matchesFound: 2,
            highestLevel: 1,
            currentStreak: 2,
            bestStreak: 2,
            comboShards: 1
        },
        timerState: {
            memorizeRemainingMs: null,
            resolveRemainingMs: null,
            debugRevealRemainingMs: null,
            pausedFromStatus: null
        },
        lastLevelResult: {
            level: 1,
            scoreGained: 120,
            rating: 'S',
            livesRemaining: 5,
            perfect: true,
            mistakes: 0,
            clearLifeReason: 'none',
            clearLifeGained: 0
        }
    };
};

describe('GameScreen (OVR-014)', () => {
    beforeEach(() => {
        useNotificationStore.setState({
            notifications: [],
            maxNotifications: 5,
            notificationSequence: 0
        });
        const saveData = createDefaultSaveData();
        act(() => {
            useAppStore.setState({
                saveData,
                settings: saveData.settings,
                boardPinMode: false,
                destroyPairArmed: false,
                peekModeArmed: false
            });
        });
    });

    it('defers achievement toasts while the floor-cleared modal is visible, then emits after leaving levelComplete', () => {
        const runFixture = levelCompleteRunFixture();

        const { rerender } = render(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={['ACH_FIRST_CLEAR']} run={runFixture} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        expect(achievementNotifications()).toBe(0);

        const nextRun: RunState = {
            ...runFixture,
            status: 'memorize',
            lastLevelResult: null
        };

        rerender(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={[]} run={nextRun} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        expect(achievementNotifications()).toBe(1);
    });

    it('does not call pause when KeyP is pressed during a relic offer', () => {
        const pauseSpy = vi.spyOn(useAppStore.getState(), 'pause');
        const base = createNewRun(0, { echoFeedbackEnabled: false, gameMode: 'puzzle' });
        const playing = finishMemorizePhase(base);
        const run: RunState = {
            ...playing,
            status: 'playing',
            relicOffer: {
                tier: 1,
                options: ['extra_shuffle_charge'],
                picksRemaining: 1,
                pickRound: 0
            }
        };

        render(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={[]} run={run} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        document.dispatchEvent(
            new KeyboardEvent('keydown', { code: 'KeyP', bubbles: true, cancelable: true })
        );
        expect(pauseSpy).not.toHaveBeenCalled();
        pauseSpy.mockRestore();
    });

    it('does not call pause when KeyP is pressed on the floor-cleared overlay (levelComplete + lastLevelResult)', () => {
        const pauseSpy = vi.spyOn(useAppStore.getState(), 'pause');
        const runFixture = levelCompleteRunFixture();

        render(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={[]} run={runFixture} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        document.dispatchEvent(
            new KeyboardEvent('keydown', { code: 'KeyP', bubbles: true, cancelable: true })
        );
        expect(pauseSpy).not.toHaveBeenCalled();
        pauseSpy.mockRestore();
    });

    it('shows relic draft title, progress, and Scholar footnote for a multi-pick offer', () => {
        const base = createNewRun(0, { echoFeedbackEnabled: false, gameMode: 'puzzle' });
        const playing = finishMemorizePhase(base);
        const run: RunState = {
            ...playing,
            status: 'playing',
            lastLevelResult: {
                level: 3,
                scoreGained: 100,
                rating: 'S',
                livesRemaining: 5,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'none',
                clearLifeGained: 0
            },
            activeContract: {
                noShuffle: false,
                noDestroy: false,
                maxMismatches: null,
                bonusRelicDraftPick: true
            },
            relicOffer: {
                tier: 1,
                options: ['extra_shuffle_charge', 'memorize_bonus_ms', 'destroy_bank_plus_one'],
                picksRemaining: 2,
                pickRound: 0,
                favorBonusPicks: 1
            }
        };

        const { getByTestId, getByText } = render(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={[]} run={run} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        expect(getByTestId('game-relic-offer-overlay')).toBeTruthy();
        expect(getByText('Relic draft · tier 1')).toBeTruthy();
        expect(getByText('Pick 1 of 2 this visit')).toBeTruthy();
        expect(getByText(/Featured-objective favor/)).toBeTruthy();
        expect(getByText(/Scholar contract/)).toBeTruthy();
    });

    it('does not show progress line for a single-pick relic offer', () => {
        const base = createNewRun(0, { echoFeedbackEnabled: false, gameMode: 'puzzle' });
        const playing = finishMemorizePhase(base);
        const run: RunState = {
            ...playing,
            status: 'playing',
            relicOffer: {
                tier: 1,
                options: ['extra_shuffle_charge'],
                picksRemaining: 1,
                pickRound: 0
            }
        };

        const { getByTestId, queryByText } = render(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={[]} run={run} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        expect(getByTestId('game-relic-offer-overlay')).toBeTruthy();
        expect(queryByText(/this visit/)).toBeNull();
    });

    it('shows contextual relic draft reasons and chapter-aligned footnote', () => {
        const base = createNewRun(0, { echoFeedbackEnabled: false });
        const playing = finishMemorizePhase(base);
        const run: RunState = {
            ...playing,
            status: 'playing',
            lastLevelResult: {
                level: 3,
                scoreGained: 100,
                rating: 'S',
                livesRemaining: 5,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'none',
                clearLifeGained: 0
            },
            relicOffer: {
                tier: 1,
                options: ['memorize_under_short_memorize', 'peek_charge_plus_one', 'shrine_echo'],
                picksRemaining: 1,
                pickRound: 0,
                contextualOptionReasons: {
                    memorize_under_short_memorize: 'Answers short memorize'
                }
            }
        };

        const { getByText } = render(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={[]} run={run} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        expect(getByText('Answers short memorize')).toBeTruthy();
        expect(getByText('At least one choice is chapter-aligned for this Endless route.')).toBeTruthy();
    });

    it('shows the endless chapter banner during memorize on scheduled endless floors', () => {
        const run = createNewRun(0, { echoFeedbackEnabled: false });

        const { getByTestId, getByText } = render(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={[]} run={run} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        expect(getByTestId('endless-chapter-banner')).toBeTruthy();
        expect(getByText('Survey Hall')).toBeTruthy();
        expect(getByText(/Objective: Flip par/)).toBeTruthy();
    });

    it('shows featured objective result, favor gain, and next-floor preview on endless floor clear', () => {
        const baseRun = createNewRun(0, { echoFeedbackEnabled: false });
        const run: RunState = {
            ...baseRun,
            status: 'levelComplete',
            relicOffer: null,
            relicFavorProgress: 0,
            bonusRelicPicksNextOffer: 1,
            favorBonusRelicPicksNextOffer: 1,
            stats: {
                ...baseRun.stats,
                totalScore: 120,
                currentLevelScore: 120,
                tries: 0,
                rating: 'S++',
                levelsCleared: 1,
                matchesFound: 2,
                highestLevel: 1,
                currentStreak: 2,
                bestStreak: 2,
                comboShards: 1
            },
            timerState: {
                memorizeRemainingMs: null,
                resolveRemainingMs: null,
                debugRevealRemainingMs: null,
                pausedFromStatus: null
            },
            lastLevelResult: {
                level: 1,
                scoreGained: 120,
                rating: 'S++',
                livesRemaining: 5,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect',
                clearLifeGained: 1,
                featuredObjectiveId: 'flip_par',
                featuredObjectiveCompleted: true,
                relicFavorGained: 1,
                featuredObjectiveStreak: 2,
                featuredObjectiveStreakBonus: 10,
                objectiveBonusScore: 30,
                bonusTags: ['flip_par', 'objective_streak']
            }
        };

        const { getByText } = render(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={[]} run={run} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        expect(getByText('Flip par: Complete')).toBeTruthy();
        expect(getByText('Objective streak: x2 (+10)')).toBeTruthy();
        expect(getByText('Favor gained: +1')).toBeTruthy();
        expect(getByText(/Extra relic pick banked/)).toBeTruthy();
        expect(getByText(/Next: Speed Trial/)).toBeTruthy();
    });

    it('shows and arms an endless risk wager when the cleared streak is eligible', () => {
        const baseRun = createNewRun(0, { echoFeedbackEnabled: false });
        const run: RunState = {
            ...baseRun,
            status: 'levelComplete',
            relicOffer: null,
            featuredObjectiveStreak: 2,
            lastLevelResult: {
                level: 1,
                scoreGained: 120,
                rating: 'S++',
                livesRemaining: 5,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect',
                clearLifeGained: 1,
                featuredObjectiveId: 'flip_par',
                featuredObjectiveCompleted: true,
                relicFavorGained: 1,
                featuredObjectiveStreak: 2,
                objectiveBonusScore: 30,
                bonusTags: ['flip_par', 'objective_streak']
            }
        };
        act(() => {
            useAppStore.setState({ run });
        });

        const { getByTestId, getByRole } = render(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={[]} run={run} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        expect(getByTestId('endless-risk-wager-panel')).toBeTruthy();
        fireEvent.click(getByRole('button', { name: 'Arm wager' }));
        expect(useAppStore.getState().run?.endlessRiskWager).toEqual({
            acceptedOnLevel: 1,
            targetLevel: 2,
            streakAtRisk: 2,
            bonusFavorOnSuccess: 2
        });
    });

    it('shows armed and resolved endless risk wager copy', () => {
        const baseRun = createNewRun(0, { echoFeedbackEnabled: false });
        const armedRun: RunState = {
            ...baseRun,
            status: 'levelComplete',
            relicOffer: null,
            featuredObjectiveStreak: 2,
            endlessRiskWager: {
                acceptedOnLevel: 1,
                targetLevel: 2,
                streakAtRisk: 2,
                bonusFavorOnSuccess: 2
            },
            lastLevelResult: {
                level: 1,
                scoreGained: 120,
                rating: 'S++',
                livesRemaining: 5,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect',
                clearLifeGained: 1,
                featuredObjectiveId: 'flip_par',
                featuredObjectiveCompleted: true,
                relicFavorGained: 1,
                featuredObjectiveStreak: 2
            }
        };
        const resolvedRun: RunState = {
            ...baseRun,
            status: 'levelComplete',
            relicOffer: null,
            featuredObjectiveStreak: 3,
            lastLevelResult: {
                level: 2,
                scoreGained: 160,
                rating: 'S++',
                livesRemaining: 5,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'perfect',
                clearLifeGained: 1,
                featuredObjectiveId: 'flip_par',
                featuredObjectiveCompleted: true,
                relicFavorGained: 3,
                featuredObjectiveStreak: 3,
                endlessRiskWagerOutcome: 'won',
                endlessRiskWagerFavorGained: 2
            }
        };

        const { getByText, rerender } = render(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={[]} run={armedRun} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        expect(getByText('Risk wager armed')).toBeTruthy();
        expect(getByText(/Next featured objective: \+2 Favor/)).toBeTruthy();

        rerender(
            <PlatformTiltProvider>
                <NotificationHost>
                    <GameScreen achievements={[]} run={resolvedRun} />
                </NotificationHost>
            </PlatformTiltProvider>
        );

        expect(getByText('Risk wager won: +2 Favor')).toBeTruthy();
        expect(getByText('Favor gained: +3')).toBeTruthy();
    });
});

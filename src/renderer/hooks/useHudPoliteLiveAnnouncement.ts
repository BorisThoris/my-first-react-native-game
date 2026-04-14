import { useEffect, useRef, useState } from 'react';

const GAUNTLET_WARN_SECS = [60, 30, 10, 5] as const;

const gauntletMessageForThreshold = (secs: number): string => {
    if (secs <= 5) {
        return 'Gauntlet: five seconds or less remaining.';
    }
    if (secs <= 10) {
        return 'Gauntlet: ten seconds or less remaining.';
    }
    if (secs <= 30) {
        return 'Gauntlet: thirty seconds or less remaining.';
    }
    return 'Gauntlet: one minute or less remaining.';
};

const flushThenSet = (text: string, set: (value: string) => void): void => {
    set('');
    queueMicrotask(() => {
        set(text);
    });
};

export interface HudPoliteLiveAnnouncementInput {
    gauntletRemainingMs: number | null;
    gauntletActive: boolean;
    scoreParasiteActive: boolean;
    parasiteFloors: number;
    parasiteWardRemaining: number;
    lives: number;
    boardLevel: number | null;
}

/**
 * HUD-015: polite `aria-live` source text for gauntlet deadline buckets and score-parasite milestones.
 * Intentionally low-frequency to avoid screen-reader chatter during play.
 */
export const useHudPoliteLiveAnnouncement = ({
    gauntletRemainingMs,
    gauntletActive,
    scoreParasiteActive,
    parasiteFloors,
    parasiteWardRemaining,
    lives,
    boardLevel,
}: HudPoliteLiveAnnouncementInput): string => {
    const [message, setMessage] = useState('');
    const prevGauntletSecsRef = useRef<number | null>(null);
    const parasiteSnapRef = useRef<{
        level: number;
        parasiteFloors: number;
        lives: number;
        ward: number;
    } | null>(null);

    useEffect(() => {
        if (!gauntletActive || gauntletRemainingMs === null) {
            prevGauntletSecsRef.current = null;
            return;
        }
        const secs = Math.ceil(gauntletRemainingMs / 1000);
        const prev = prevGauntletSecsRef.current;
        prevGauntletSecsRef.current = secs;
        if (prev === null) {
            return;
        }
        for (const bound of GAUNTLET_WARN_SECS) {
            if (prev > bound && secs <= bound) {
                flushThenSet(gauntletMessageForThreshold(secs), setMessage);
                return;
            }
        }
    }, [gauntletActive, gauntletRemainingMs]);

    useEffect(() => {
        if (!scoreParasiteActive || boardLevel === null) {
            parasiteSnapRef.current = null;
            return;
        }

        const snap = parasiteSnapRef.current;
        const nextSnap = {
            level: boardLevel,
            parasiteFloors,
            lives,
            ward: parasiteWardRemaining
        };

        if (snap === null) {
            parasiteSnapRef.current = nextSnap;
            return;
        }

        if (boardLevel < snap.level) {
            parasiteSnapRef.current = nextSnap;
            return;
        }

        const levelAdvanced = boardLevel > snap.level;
        if (levelAdvanced) {
            const crossedDrain = snap.parasiteFloors === 3 && parasiteFloors === 0;
            if (crossedDrain) {
                if (lives < snap.lives) {
                    flushThenSet('Score parasite drained one life.', setMessage);
                } else if (parasiteWardRemaining < snap.ward) {
                    flushThenSet('Score parasite drain absorbed by ward.', setMessage);
                }
            } else if (parasiteFloors === 3 && snap.parasiteFloors === 2) {
                flushThenSet('Score parasite: next cleared floor triggers the drain unless warded.', setMessage);
            }
        }

        parasiteSnapRef.current = nextSnap;
    }, [boardLevel, lives, parasiteFloors, parasiteWardRemaining, scoreParasiteActive]);

    return message;
};

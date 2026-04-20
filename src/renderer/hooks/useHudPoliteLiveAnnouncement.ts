import { useCallback, useEffect, useRef, useState } from 'react';
import type { FindableKind, Tile } from '../../shared/contracts';

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

/** Min interval between polite live-region updates (anti-spam for screen readers). */
const POLITE_HUD_THROTTLE_MS = 400;

type HudAnnouncePriority = 'info' | 'error';

const PRIORITY_RANK: Record<HudAnnouncePriority, number> = { error: 2, info: 1 };

export const detectClaimedFindableKind = (
    previousTiles: readonly Tile[],
    nextTiles: readonly Tile[]
): FindableKind | null => {
    const previousKinds = new Map<string, FindableKind>();
    for (const tile of previousTiles) {
        if (tile.findableKind != null) {
            previousKinds.set(tile.pairKey, tile.findableKind);
        }
    }
    for (const [pairKey, kind] of previousKinds) {
        const nextPairTiles = nextTiles.filter((tile) => tile.pairKey === pairKey);
        if (
            nextPairTiles.length > 0 &&
            nextPairTiles.every(
                (tile) =>
                    (tile.state === 'matched' || tile.state === 'removed') &&
                    tile.findableKind == null
            )
        ) {
            return kind;
        }
    }
    return null;
};

const getFindableAnnouncementText = (kind: FindableKind): string =>
    kind === 'shard_spark'
        ? 'Shard spark claimed: plus one combo shard.'
        : 'Score glint claimed: plus twenty-five score.';

export const getFindableToastText = (kind: FindableKind): string =>
    kind === 'shard_spark' ? 'Shard spark +1 shard' : 'Score glint +25 score';

interface HudPoliteLiveAnnouncementInput {
    gauntletRemainingMs: number | null;
    gauntletActive: boolean;
    scoreParasiteActive: boolean;
    parasiteFloors: number;
    parasiteWardRemaining: number;
    lives: number;
    boardLevel: number | null;
    boardTiles: readonly Tile[];
    findablesClaimedThisFloor: number;
}

interface UseHudPoliteLiveAnnouncementResult {
    message: string;
    queuePoliteAnnouncement: (text: string, opts?: { dedupeKey?: string; priority?: HudAnnouncePriority }) => void;
}

const nowMs = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/**
 * HUD-015: polite `aria-live` source text for gauntlet deadline buckets and score-parasite milestones.
 * Batches concurrent announcements on `requestAnimationFrame`, dedupes by key, prefers higher priority,
 * and throttles display cadence so screen readers get summaries, not chatter.
 */
export const useHudPoliteLiveAnnouncement = ({
    gauntletRemainingMs,
    gauntletActive,
    scoreParasiteActive,
    parasiteFloors,
    parasiteWardRemaining,
    lives,
    boardLevel,
    boardTiles,
    findablesClaimedThisFloor
}: HudPoliteLiveAnnouncementInput): UseHudPoliteLiveAnnouncementResult => {
    const [message, setMessage] = useState('');
    const prevGauntletSecsRef = useRef<number | null>(null);
    const parasiteSnapRef = useRef<{
        level: number;
        parasiteFloors: number;
        lives: number;
        ward: number;
    } | null>(null);
    const pickupSnapRef = useRef<{
        level: number;
        claimed: number;
        tiles: readonly Tile[];
    } | null>(null);

    const queueRef = useRef(new Map<string, { text: string; priority: HudAnnouncePriority }>());
    const rafIdRef = useRef<number | null>(null);
    const lastDisplayedAtRef = useRef(0);
    const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingThrottledTextRef = useRef<string | null>(null);

    const tryDeliver = useCallback((text: string) => {
        const now = nowMs();
        const last = lastDisplayedAtRef.current;
        const elapsed = last === 0 ? POLITE_HUD_THROTTLE_MS : now - last;

        const fire = (): void => {
            flushThenSet(text, setMessage);
            lastDisplayedAtRef.current = nowMs();
            throttleTimerRef.current = null;
            pendingThrottledTextRef.current = null;
        };

        if (last === 0 || elapsed >= POLITE_HUD_THROTTLE_MS) {
            if (throttleTimerRef.current) {
                clearTimeout(throttleTimerRef.current);
                throttleTimerRef.current = null;
            }
            fire();
            return;
        }

        pendingThrottledTextRef.current = text;
        const wait = POLITE_HUD_THROTTLE_MS - elapsed;
        if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
        }
        throttleTimerRef.current = setTimeout(() => {
            const pending = pendingThrottledTextRef.current;
            if (pending) {
                flushThenSet(pending, setMessage);
                lastDisplayedAtRef.current = nowMs();
            }
            throttleTimerRef.current = null;
            pendingThrottledTextRef.current = null;
        }, wait);
    }, []);

    const flushAnnouncementQueue = useCallback(() => {
        if (queueRef.current.size === 0) {
            return;
        }
        const entries = [...queueRef.current.entries()].map(([key, v]) => ({ key, ...v }));
        queueRef.current.clear();
        entries.sort((a, b) => {
            const pr = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
            if (pr !== 0) {
                return pr;
            }
            return a.key.localeCompare(b.key);
        });
        const combined = entries.map((e) => e.text).join(' ');
        tryDeliver(combined);
    }, [tryDeliver]);

    const scheduleQueueFlush = useCallback(() => {
        if (rafIdRef.current != null) {
            return;
        }
        rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            flushAnnouncementQueue();
        });
    }, [flushAnnouncementQueue]);

    const queuePoliteAnnouncement = useCallback(
        (text: string, opts?: { dedupeKey?: string; priority?: HudAnnouncePriority }) => {
            const dedupeKey = opts?.dedupeKey ?? text;
            const priority = opts?.priority ?? 'info';
            const prev = queueRef.current.get(dedupeKey);
            if (prev && PRIORITY_RANK[prev.priority] > PRIORITY_RANK[priority]) {
                return;
            }
            queueRef.current.set(dedupeKey, { text, priority });
            scheduleQueueFlush();
        },
        [scheduleQueueFlush]
    );

    useEffect(
        () => () => {
            if (rafIdRef.current != null) {
                cancelAnimationFrame(rafIdRef.current);
            }
            if (throttleTimerRef.current) {
                clearTimeout(throttleTimerRef.current);
            }
        },
        []
    );

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
                queuePoliteAnnouncement(gauntletMessageForThreshold(secs), {
                    dedupeKey: `gauntlet:${bound}`,
                    priority: 'info'
                });
                return;
            }
        }
    }, [gauntletActive, gauntletRemainingMs, queuePoliteAnnouncement]);

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
                    queuePoliteAnnouncement('Score parasite drained one life.', {
                        dedupeKey: 'parasite:drain',
                        priority: 'info'
                    });
                } else if (parasiteWardRemaining < snap.ward) {
                    queuePoliteAnnouncement('Score parasite drain absorbed by ward.', {
                        dedupeKey: 'parasite:ward',
                        priority: 'info'
                    });
                }
            } else if (parasiteFloors === 3 && snap.parasiteFloors === 2) {
                queuePoliteAnnouncement('Score parasite: next cleared floor triggers the drain unless warded.', {
                    dedupeKey: 'parasite:warn',
                    priority: 'info'
                });
            }
        }

        parasiteSnapRef.current = nextSnap;
    }, [boardLevel, lives, parasiteFloors, parasiteWardRemaining, queuePoliteAnnouncement, scoreParasiteActive]);

    useEffect(() => {
        if (boardLevel === null) {
            pickupSnapRef.current = null;
            return;
        }

        const snap = pickupSnapRef.current;
        const nextSnap = {
            level: boardLevel,
            claimed: findablesClaimedThisFloor,
            tiles: boardTiles
        };

        if (snap === null || boardLevel < snap.level) {
            pickupSnapRef.current = nextSnap;
            return;
        }

        if (boardLevel === snap.level && findablesClaimedThisFloor > snap.claimed) {
            const claimedKind = detectClaimedFindableKind(snap.tiles, boardTiles);
            if (claimedKind != null) {
                queuePoliteAnnouncement(getFindableAnnouncementText(claimedKind), {
                    dedupeKey: `pickup:${claimedKind}`,
                    priority: 'info'
                });
            }
        }

        pickupSnapRef.current = nextSnap;
    }, [boardLevel, boardTiles, findablesClaimedThisFloor, queuePoliteAnnouncement]);

    return { message, queuePoliteAnnouncement };
};

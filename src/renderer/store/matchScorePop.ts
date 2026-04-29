import type { RunState } from '../../shared/contracts';
import { getMatchFloaterAnchorTileIds, getMismatchFloaterAnchorTileIds } from '../../shared/game';
import { routeSpecialLabel, routeSpecialRewardLine } from '../../shared/route-world';

export type MatchScorePop = {
    amount: number;
    routeRewardText?: string;
    tileIdA: string;
    tileIdB: string;
    key: string;
};

export type MismatchScorePop = {
    tileIdA: string;
    tileIdB: string;
    /** Gambit triple-miss only — centroid anchor for GameScreen. */
    tileIdC?: string;
    key: string;
};

/** Spread into Zustand `set` / `useAppStore.setState` to clear both board floaters in one patch. */
export const BOARD_FLOATER_POP_CLEAR = {
    matchScorePop: null as MatchScorePop | null,
    mismatchScorePop: null as MismatchScorePop | null
};

/**
 * Pure payload for the floating +score floater after a successful match resolve.
 */
export function buildMatchScorePopPayload(
    run: RunState | null,
    next: RunState,
    keyNonce?: string
): MatchScorePop | null {
    if (!run?.board) {
        return null;
    }
    const anchor = getMatchFloaterAnchorTileIds(run);
    if (!anchor) {
        return null;
    }
    if (next.stats.matchesFound <= run.stats.matchesFound) {
        return null;
    }
    const amount = next.stats.totalScore - run.stats.totalScore;
    if (amount <= 0) {
        return null;
    }
    const { tileIdA, tileIdB } = anchor;
    const routeKind =
        run.board.tiles.find((tile) => tile.id === tileIdA)?.routeSpecialKind ??
        run.board.tiles.find((tile) => tile.id === tileIdB)?.routeSpecialKind ??
        run.board.tiles.find((tile) => tile.id === tileIdA)?.routeCardKind ??
        run.board.tiles.find((tile) => tile.id === tileIdB)?.routeCardKind ??
        null;
    const routeRewardText = routeKind ? `${routeSpecialLabel(routeKind)} ${routeSpecialRewardLine(routeKind)}` : undefined;
    const nonce = keyNonce ?? `${Date.now()}`;
    const key = `${run.board.level}-${nonce}-${tileIdA}-${tileIdB}`;
    const payload: MatchScorePop = { amount, tileIdA, tileIdB, key };
    if (routeRewardText) {
        payload.routeRewardText = routeRewardText;
    }
    return payload;
}

/**
 * Pure payload for the floating miss floater after a mismatch resolve.
 */
export function buildMismatchScorePopPayload(
    run: RunState | null,
    next: RunState,
    keyNonce?: string
): MismatchScorePop | null {
    if (!run?.board) {
        return null;
    }
    const anchor = getMismatchFloaterAnchorTileIds(run);
    if (!anchor) {
        return null;
    }
    if (next.stats.mismatches <= run.stats.mismatches) {
        return null;
    }
    const nonce = keyNonce ?? `${Date.now()}`;
    const { tileIdA, tileIdB, tileIdC } = anchor;
    const key = tileIdC
        ? `miss-${run.board.level}-${nonce}-${tileIdA}-${tileIdB}-${tileIdC}`
        : `miss-${run.board.level}-${nonce}-${tileIdA}-${tileIdB}`;
    const payload: MismatchScorePop = { tileIdA, tileIdB, key };
    if (tileIdC !== undefined) {
        payload.tileIdC = tileIdC;
    }
    return payload;
}

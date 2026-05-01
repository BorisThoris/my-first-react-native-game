/**
 * User-visible strings for the milestone relic draft (GameScreen + RelicDraftOfferPanel).
 * Centralized for a11y review and future i18n (RDUI-007).
 */
import type { RelicId, RelicOfferState, RunState } from '../../shared/contracts';

export const relicEffectLabels: Record<RelicId, string> = {
    extra_shuffle_charge: '+1 shuffle charge for trap halls (now)',
    first_shuffle_free_per_floor: 'First shuffle each dungeon floor is free',
    memorize_bonus_ms: 'Longer memorize phases for patrol and trap reads',
    destroy_bank_plus_one: '+1 destroy charge for trap control (now)',
    combo_shard_plus_step: '+1 combo shard (now)',
    memorize_under_short_memorize: '+220ms dungeon scout time when Short memorize is active',
    parasite_ward_once: 'Ignore next parasite life loss once',
    region_shuffle_free_first: 'First row shuffle each dungeon floor is free',
    peek_charge_plus_one: '+1 peek charge for Mystery rooms (now)',
    stray_charge_plus_one: '+1 stray remover charge for scout routes (now)',
    pin_cap_plus_one: '+1 max pinned dungeon read',
    guard_token_plus_one: '+1 guard token for enemy contact (now, capped)',
    shrine_echo: 'Next relic milestone: +1 extra selection for Greed routes',
    chapter_compass: 'Future Endless drafts lean harder into boss and chapter answers',
    wager_surety: 'Risk wagers pay +1 Favor and soften boss-route busts',
    parasite_ledger: 'Successful parasite floors slow parasite pressure'
};

/**
 * Display-only visit budget for the current `relicOffer` (not extra `RunState` fields).
 * Matches the state machine: `total = picksRemaining + pickRound` (selections remaining including this round,
 * plus completed rounds this visit). See `docs/epics/relic-draft-fluid-system/02-state-machine.md`.
 */
export function getRelicDraftVisitTotals(offer: RelicOfferState): { total: number; currentPick: number } {
    const total = offer.picksRemaining + offer.pickRound;
    const currentPick = total - offer.picksRemaining + 1;
    return { total, currentPick };
}

export function getRelicOfferTitle(tier: number): string {
    return `Relic draft · tier ${tier}`;
}

export function getRelicOfferSubtitle(
    clearedFloor: number,
    picksRemaining: number
): string {
    if (picksRemaining > 1) {
        return `Floor ${clearedFloor} cleared. Pick ${picksRemaining} relics — each applies immediately; new options after each pick.`;
    }
    return `Floor ${clearedFloor} cleared. Choose one relic — it applies immediately for the rest of the run.`;
}

/** Shown when this visit grants more than one pick. */
export function relicDraftProgressLine(offer: RelicOfferState): string | null {
    const { total, currentPick } = getRelicDraftVisitTotals(offer);
    if (total <= 1) {
        return null;
    }
    return `Pick ${currentPick} of ${total} this visit`;
}

export function relicDraftRoundAdvancedAnnouncement(): string {
    return 'New relic choices.';
}

/**
 * When multiple picks are available, explain likely sources (no formula duplication).
 * See docs/epics/relic-draft-fluid-system/03-bonus-sources.md
 */
export function buildRelicDraftBonusFootnoteLines(run: RunState): string[] {
    const offer = run.relicOffer;
    if (!offer) {
        return [];
    }
    const { total } = getRelicDraftVisitTotals(offer);

    const lines: string[] = [];

    if (offer.contextualOptionReasons && Object.keys(offer.contextualOptionReasons).length > 0) {
        lines.push('At least one choice is chapter-aligned for this Endless route.');
    }

    if (total <= 1) {
        return lines;
    }

    if ((offer.favorBonusPicks ?? 0) > 0) {
        lines.push(
            `Featured-objective favor: +${offer.favorBonusPicks} relic ${
                offer.favorBonusPicks === 1 ? 'choice' : 'choices'
            } banked into this shrine.`
        );
    }
    if (run.activeContract?.bonusRelicDraftPick) {
        lines.push('Scholar contract: +1 choice at this shrine.');
    }
    if (run.metaRelicDraftExtraPerMilestone > 0) {
        lines.push('Meta unlock: +1 relic choice at each milestone.');
    }
    if (run.dailyDateKeyUtc) {
        lines.push('Daily: extra pick when the schedule grants it.');
    }
    if (run.activeMutators.includes('generous_shrine')) {
        lines.push('Generous Shrine mutator: +1 relic pick on this floor.');
    }

    return lines;
}

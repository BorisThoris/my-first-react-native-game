import type { RunState } from '../../shared/contracts';

/**
 * REF-004: `null` means no active countdown; `0` must still call `schedule*Timer` so the immediate
 * completion path runs after resume (truthy checks would skip `0`).
 */
export const shouldScheduleMemorizeTimerOnResume = (run: RunState): boolean =>
    run.status === 'memorize' && run.timerState.memorizeRemainingMs !== null;

export const shouldScheduleDebugRevealTimerOnResume = (run: RunState): boolean =>
    run.debugPeekActive && run.timerState.debugRevealRemainingMs !== null;

import { useEffect, useState } from 'react';

const DISTRACTION_HUD_TICK_MS = 880;

/**
 * Local animation tick for the distraction-channel HUD (intentionally not part of persisted run state).
 * When `active` is false, the tick value is unused; interval is cleared.
 */
export const useDistractionChannelTick = (active: boolean): number => {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!active) {
            return;
        }
        const id = window.setInterval(() => {
            setTick((current) => current + 1);
        }, DISTRACTION_HUD_TICK_MS);
        return () => window.clearInterval(id);
    }, [active]);

    return tick;
};

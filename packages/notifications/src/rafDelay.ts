/**
 * Delay execution using requestAnimationFrame (same behavior as MusicalAppReactConcept rafUtils).
 */
export const rafDelay = (callback: () => void, delayMs: number): (() => void) => {
  let rafId: number | null = null;
  const startTime = performance.now();

  const execute = (currentTime: number) => {
    const elapsed = currentTime - startTime;

    if (elapsed >= delayMs) {
      callback();
      rafId = null;
    } else {
      rafId = requestAnimationFrame(execute);
    }
  };

  rafId = requestAnimationFrame(execute);

  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
};

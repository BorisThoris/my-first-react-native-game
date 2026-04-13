import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { rafDelay } from './rafDelay.js';

describe('rafDelay', () => {
  const scheduled: FrameRequestCallback[] = [];

  beforeEach(() => {
    scheduled.length = 0;
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      scheduled.push(cb);
      return scheduled.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('runs callback after elapsed time reaches delayMs', () => {
    const cb = vi.fn();
    rafDelay(cb, 50);

    expect(scheduled).toHaveLength(1);
    scheduled[0]!(1000);
    expect(cb).not.toHaveBeenCalled();

    scheduled[1]!(1050);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('cancel before fire prevents callback', () => {
    const cb = vi.fn();
    const cancel = rafDelay(cb, 50);
    cancel();

    expect(cb).not.toHaveBeenCalled();
  });

  test('cancel after first frame but before delay elapses prevents callback', () => {
    const cb = vi.fn();
    const cancel = rafDelay(cb, 50);

    scheduled[0]!(1000);
    expect(cb).not.toHaveBeenCalled();
    expect(scheduled).toHaveLength(2);
    cancel();
    expect(cb).not.toHaveBeenCalled();
  });
});

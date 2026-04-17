import { describe, expect, it, vi } from 'vitest';
import { scrubTelemetryPayload, setTelemetrySink, trackEvent } from './telemetry';

describe('telemetry (REF-067)', () => {
    it('scrubs forbidden keys, truncates long strings, and redacts path-like values', () => {
        const scrubbed = scrubTelemetryPayload({
            mode: 'endless',
            email: 'nope@example.com',
            score: 12,
            long: 'x'.repeat(400),
            winPath: 'C:\\Users\\someone\\secret\\file.json',
            posixPath: '/Users/me/file.txt',
            okShort: 'hello'
        });
        expect(scrubbed.email).toBeUndefined();
        expect(scrubbed.mode).toBe('endless');
        expect(scrubbed.score).toBe(12);
        expect(scrubbed.okShort).toBe('hello');
        expect(String(scrubbed.long).length).toBeLessThanOrEqual(201);
        expect(scrubbed.winPath).toBe('[path_redacted]');
        expect(scrubbed.posixPath).toBe('[path_redacted]');
    });

    it('passes scrubbed payloads to the sink', () => {
        const fn = vi.fn();
        setTelemetrySink(fn);
        trackEvent('run_start', { mode: 'daily', pathname: '/should-drop' });
        setTelemetrySink(null);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn.mock.calls[0]![0]).toBe('run_start');
        expect(fn.mock.calls[0]![1]).toEqual({ mode: 'daily' });
    });
});

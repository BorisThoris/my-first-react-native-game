/**
 * Privacy-first telemetry hook (K1). Default is no-op; host can install a sink (e.g. Plausible) without changing call sites.
 * Payloads are scrubbed before delivery: forbidden keys dropped, strings truncated, filesystem-like paths redacted.
 */
export type TelemetryPayload = Record<string, string | number | boolean | null | undefined>;

export type TelemetrySink = (event: string, payload: TelemetryPayload) => void;

let sink: TelemetrySink | null = null;

/** Keys that must never leave the client in structured telemetry (PII / secrets). */
const FORBIDDEN_TELEMETRY_KEYS = new Set([
    'email',
    'password',
    'token',
    'username',
    'userid',
    'user_id',
    'name',
    'address',
    'pathname',
    'path',
    'useragent',
    'user_agent',
    'ip',
    'phone'
]);

const MAX_TELEMETRY_STRING_LEN = 200;

const looksLikeAbsolutePath = (value: string): boolean => {
    if (/^\\\\[^\\]/.test(value) || /^\/(?:Users|home|var|usr|etc)\b/i.test(value)) {
        return true;
    }
    return /^[a-z]:[\\/]/i.test(value);
};

export const scrubTelemetryPayload = (payload: TelemetryPayload): TelemetryPayload => {
    const out: TelemetryPayload = {};
    for (const [key, raw] of Object.entries(payload)) {
        if (FORBIDDEN_TELEMETRY_KEYS.has(key.toLowerCase())) {
            continue;
        }
        if (raw === null || raw === undefined || typeof raw === 'number' || typeof raw === 'boolean') {
            out[key] = raw;
            continue;
        }
        if (typeof raw === 'string') {
            let s = raw;
            if (looksLikeAbsolutePath(s)) {
                s = '[path_redacted]';
            } else if (s.length > MAX_TELEMETRY_STRING_LEN) {
                s = `${s.slice(0, MAX_TELEMETRY_STRING_LEN)}…`;
            }
            out[key] = s;
        }
    }
    return out;
};

export const setTelemetrySink = (next: TelemetrySink | null): void => {
    sink = next;
};

export const trackEvent = (event: string, payload: TelemetryPayload = {}): void => {
    if (sink) {
        sink(event, scrubTelemetryPayload(payload));
    }
};

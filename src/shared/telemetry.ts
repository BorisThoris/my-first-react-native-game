/**
 * Privacy-first telemetry hook (K1). Default is no-op; host can install a sink (e.g. Plausible) without changing call sites.
 */
export type TelemetryPayload = Record<string, string | number | boolean | null | undefined>;

export type TelemetrySink = (event: string, payload: TelemetryPayload) => void;

let sink: TelemetrySink | null = null;

export const setTelemetrySink = (next: TelemetrySink | null): void => {
    sink = next;
};

export const trackEvent = (event: string, payload: TelemetryPayload = {}): void => {
    if (sink) {
        sink(event, payload);
    }
};

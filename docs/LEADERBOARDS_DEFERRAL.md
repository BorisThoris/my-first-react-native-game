# Online leaderboards — deferral (E4)

**Status:** Deferred. Ship remains **offline-first** with clipboard JSON seed share (`run-export.ts`) only.

## Why defer

- **Trust:** Any client-reported score is trivially forgeable without a attested build or server authority.  
- **Scope:** Anti-cheat (hashing flip traces, attestation, rate limits) is a product + infra commitment, not a demo milestone.  
- **Mode fairness:** Daily runs are the only mode with a **shared deterministic seed**; endless/gauntlet are not comparable globally without heavy normalization.

## If revived

- Restrict to **daily UTC seed** + **rules version** match.  
- Accept **optional** flip-sequence hash for dispute/debug only (privacy: no PII in payload).  
- Plausible analytics (`telemetry.ts` sink) for completion counts, not competitive rank, until trust model is defined.

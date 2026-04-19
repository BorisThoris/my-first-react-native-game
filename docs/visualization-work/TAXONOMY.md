# Regression `pairKey` taxonomy

**Source of truth:** [`pairKeys`](../../e2e/fixtures/tile-card-face-illustration-regression.json) in that JSON file (mirrored in [`illustrationRegressionPairKeys.ts`](../../src/renderer/dev/illustrationRegressionPairKeys.ts)).

**Purpose:** Know which **string shapes** the illustration pipeline must keep stable when changing roll tables or [`hashPairKey`](../../src/shared/hashPairKey.ts). Adding a new regression key: pick a bucket below and append to the fixture + TS mirror + regenerate hashes.

## Buckets (current fixture)

| Bucket | Examples | Notes |
|--------|-----------|--------|
| **Numeric dash** | `1-0`, `2-7`, `6-3` | Short digit pairs; hash + RNG sensitivity for “simple” keys. |
| **Greek letters** | `alpha`, `beta`, `gamma`, `delta` | Alphabetic codenames. |
| **Tarot ids** | `tarot-sun`, `tarot-moon` | Theme labels; longer tokens. |
| **Place / noun–number** | `vault-13`, `shard-21`, `echo-34`, `orbit-233`, `cathedral-8`, `cipher-144`, `sigil-377`, `aurora-610`, `void-987`, `astral-55` | Mixed alphanumeric + separators; stress long-token hashing. |

## Related

- [VIZ-003](./VIZ-003.md) — acceptance for fixture curation.
- [EXPLICIT_50_AGENTS.md](./EXPLICIT_50_AGENTS.md) — agent 21–30 band for taxonomy workstreams.

# REG implementation order and phase map

Implements a **revised** execution order: **foundations and core run** first, then **structural work in parallel (Phase 3)**, then **full UI and shell polish (Phase 4)**, then **hardening and trust QA (Phase 5)**, then **deep / enterprise / README fourth–sixth waves (`REG-120`+) (Phase 6)**, and **release and packaging last (Phase 7)**. Individual tickets remain authoritative; this file is a **project tracker**. **Implementation phase numbers are not the same as README file waves** (e.g. `REG-120`+ is the fourth *wave* in the index but **Phase 6** here).

## Bookend gates

Per [`REG-000-audit-method-and-priority-map.md`](REG-000-audit-method-and-priority-map.md), complete **`REG-068`**, **`REG-087`**, **`REG-088`**, and **`REG-089`** before unbounded expansion on **`REG-069`+**, unless a spike de-risks the stack. **`REG-119`** (acceptance and bot batch) is a **close-the-loop** document—natural home is **Phase 7** with other ship packaging, not as a first task.

## Parallel tracks (Phase 3)

- **Track A:** structural mobile and shell — `REG-001`–`REG-005`, `REG-006`–`REG-009`, `REG-014`, `REG-028`, `REG-034`, `REG-044` — overlaps time-wise with Phases 1 and 2.
- **Track B:** meta and progression — `REG-016`, `REG-023`, `REG-026`, `REG-032`, `REG-035`, `REG-036` — respect [`REG-052`](REG-052-leaderboards-trust-model-and-online-deferral.md) for online scope.

## Phases 1 to 7 (outlook)

| Phase | When | What |
| --- | --- | --- |
| **1** | First | **Trust, contracts, gates:** economy unification, save trust, privacy, **`REG-068` / `REG-087` / `REG-088` / `REG-089`**, and online deferral documentation (`REG-052`) |
| **2** | Early | **Core run and gameplay depth:** `REG-069`–`REG-086`, first/second wave systems that **define the run** (`REG-015`–`REG-022` etc.) |
| **3** | Parallel with 1–2 | **Track A (structural UI)** and **Track B (meta / progression):** “good” layout and navigation, not final art — overlaps Phases 1–2 |
| **4** | After 3, before hardening at full polish | **Full UI, shell, and product-facing polish in `REG-000`–`REG-119` band:** **Choose Path or better** third-wave shell (`REG-090`–`REG-108`), first/second wave screen polish, glossary/copy, audio *with* the shell, placeholders (`REG-113`–`REG-114` where applicable) |
| **5** | After Phase 4 | **Hardening:** baselines, perf, input, WebGL/GPU, E2E/CI, a11y **after** the shell is in place; includes `REG-109`–`REG-112`, `REG-027`, `REG-062`, third-wave *perf* and stability tickets |
| **6** | After Phase 5 | **Deep / enterprise / README fourth–sixth waves:** all **`REG-120`–`REG-160`** (except **`REG-129`**, which is in Phase 7 with release) — combinatoric matrices, RC-style coverage, platform edge cases, ultra-deep mechanics, hazard *tile* work |
| **7** | Last | **Release and packaging:** `REG-060`, `REG-061`, **`REG-115`–`REG-119`**, **`REG-129`** (demo vs full) — feature lock, store/Demo, credits/legal, save import/export, acceptance reports |

*Rationale: **hardening** (Phase 5) is measured against a **real** UI, not a moving shell; **enterprise depth** (Phase 6) assumes a **stable** game and build; **ship** (Phase 7) is explicitly **last**.*

## Full map: `REG-000` through `REG-160`

| ID | Primary phase | Lane | Notes |
| --- | ---: | --- | --- |
| `REG-000` | 1 | — | Audit index; read with `REG-033` |
| `REG-001` | 3 | `A` | Mobile HUD and board |
| `REG-002` | 3 | `A` | Desktop stage |
| `REG-003` | 3 | `A` | Sidebar integration |
| `REG-004` | 3 | `A` | HUD hierarchy |
| `REG-005` | 3 | `A` | Rules and hints |
| `REG-006` | 3 | `A` | Settings mobile |
| `REG-007` | 3 | `A` | Game over mobile |
| `REG-008` | 3 | `A` | Overlays mobile |
| `REG-009` | 3 | `A` | Main menu landscape |
| `REG-010` | 4 | — | Choose Path discoverability (full pass; after structural Track A) |
| `REG-011` | 4 | — | Meta screen reward and value (after data) |
| `REG-012` | 4 | — | Card materials and feedback |
| `REG-013` | 4 | — | Brand and art (P2) |
| `REG-014` | 3 | `A` | Design system and dead space audit (structural; final polish in Phase 4) |
| `REG-015` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-016` | 3 | `B` | Meta progression (parallel) |
| `REG-017` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-018` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-019` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-020` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-021` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-022` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-023` | 3 | `B` | Daily and weekly (parallel) |
| `REG-024` | 1 | — | Economy unification (contract) |
| `REG-025` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-026` | 3 | `B` | Onboarding (parallel) |
| `REG-027` | 5 | — | Visual baselines (after big UI; before trusting regression to ship) |
| `REG-028` | 3 | `A` | Short viewport hardening (structural) |
| `REG-029` | 5 | — | Input, a11y, controller (unify paths) |
| `REG-030` | 5 | — | Telemetry and balance playtest (local) |
| `REG-031` | 5 | — | WebGL, graphics, real devices (perf pass) |
| `REG-032` | 3 | `B` | Save and profile shell (parallel) |
| `REG-033` | 1 | — | Sequencing and bot handoff map |
| `REG-034` | 3 | `A` | Startup and hydration |
| `REG-035` | 3 | `B` | Profile and community strip (P2) |
| `REG-036` | 3 | `B` | Settings reference model (parallel) |
| `REG-037` | 4 | — | Audio identity and mix (with final shell) |
| `REG-038` | 4 | — | Music depth (P2) |
| `REG-039` | 5 | — | Achievements, Steam, offline recovery surfaces (post-shell hardening) |
| `REG-040` | 1 | — | Save trust and recovery (local) |
| `REG-041` | 5 | — | Run export, replay, seed (trust; post-shell) |
| `REG-042` | 5 | — | Toasts, notifications, score hierarchy (stability vs polish) |
| `REG-043` | 5 | — | Pause, timer, resume, interruption |
| `REG-044` | 3 | `A` | Meta navigation |
| `REG-045` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-046` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-047` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-048` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-049` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-050` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-051` | 4 | — | Pass-and-play decision (P2) — product/UX, not day-one ship |
| `REG-052` | 1 | — | Online deferral documentation (`REG-052` gate) |
| `REG-053` | 4 | — | Streak and ethics (P2) |
| `REG-054` | 4 | — | Monetization positioning (P2) |
| `REG-055` | 4 | — | I18N foundation (P2) |
| `REG-056` | 5 | — | Cognitive a11y |
| `REG-057` | 5 | — | WebGL context loss and DOM fallback |
| `REG-058` | 5 | — | Dev fixtures and state matrix (P2) |
| `REG-059` | 4 | — | Asset pipeline, rights, drop-in (supports placeholders before ship) |
| `REG-060` | 7 | — | Steam package and runtime smoke (release) |
| `REG-061` | 7 | — | Store media readiness (P2) (release) |
| `REG-062` | 5 | — | E2E flake and visual sharding (P0) (after UI exists) |
| `REG-063` | 1 | — | Privacy, consent, PII scrub early |
| `REG-064` | 4 | — | Glossary, rules copy (with `REG-101` / shell) |
| `REG-065` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-066` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-067` | 4 | — | Haptics and permissions (P2) |
| `REG-068` | 1 | — | Definition of done (product bar) |
| `REG-069` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-070` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-071` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-072` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-073` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-074` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-075` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-076` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-077` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-078` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-079` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-080` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-081` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-082` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-083` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-084` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-085` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-086` | 2 | — | Run and gameplay depth; data before final meta galleries |
| `REG-087` | 1 | — | Softlock and fairness index |
| `REG-088` | 1 | — | First run to first win (slice) |
| `REG-089` | 1 | — | Versioning and migration gate |
| `REG-090` | 4 | — | Complete Product Pass: shell / composition (`REG-090`) |
| `REG-091` | 4 | — | Complete Product Pass: shell / composition (`REG-091`) |
| `REG-092` | 4 | — | Complete Product Pass: shell / composition (`REG-092`) |
| `REG-093` | 4 | — | Complete Product Pass: shell / composition (`REG-093`) |
| `REG-094` | 4 | — | Complete Product Pass: shell / composition (`REG-094`) |
| `REG-095` | 4 | — | Complete Product Pass: shell / composition (`REG-095`) |
| `REG-096` | 4 | — | Complete Product Pass: shell / composition (`REG-096`) |
| `REG-097` | 4 | — | Complete Product Pass: shell / composition (`REG-097`) |
| `REG-098` | 4 | — | Complete Product Pass: shell / composition (`REG-098`) |
| `REG-099` | 4 | — | Complete Product Pass: shell / composition (`REG-099`) |
| `REG-100` | 4 | — | Complete Product Pass: shell / composition (`REG-100`) |
| `REG-101` | 4 | — | Complete Product Pass: shell / composition (`REG-101`) |
| `REG-102` | 4 | — | Complete Product Pass: shell / composition (`REG-102`) |
| `REG-103` | 4 | — | Complete Product Pass: shell / composition (`REG-103`) |
| `REG-104` | 4 | — | Complete Product Pass: shell / composition (`REG-104`) |
| `REG-105` | 4 | — | Complete Product Pass: shell / composition (`REG-105`) |
| `REG-106` | 4 | — | Complete Product Pass: shell / composition (`REG-106`) |
| `REG-107` | 4 | — | Complete Product Pass: shell / composition (`REG-107`) |
| `REG-108` | 4 | — | Complete Product Pass: shell / composition (`REG-108`) |
| `REG-109` | 5 | — | Performance budgets and presets (after shell; third wave) |
| `REG-110` | 5 | — | Memory, GPU, lifecycle (after shell; third wave) |
| `REG-111` | 5 | — | Input latency, pacing (after shell; third wave) |
| `REG-112` | 5 | — | FX LOD, reduced motion, noise (after shell; third wave) |
| `REG-113` | 4 | — | Placeholder inventory and drop-in (asset contract with shell) |
| `REG-114` | 4 | — | Audio final mix and ducking (with `REG-037`) |
| `REG-115` | 7 | — | Feature flags and content lock (release) |
| `REG-116` | 7 | — | Credits and legal (ship) |
| `REG-117` | 7 | — | Save backup, import, export (ship) |
| `REG-118` | 7 | — | Full packaging and demo checklist (ship) |
| `REG-119` | 7 | — | Bot batch and product acceptance (close loop at ship) |
| `REG-120` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-121` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-122` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-123` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-124` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-125` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-126` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-127` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-128` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-129` | 7 | — | Demo vs full build matrix (release) |
| `REG-130` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-131` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-132` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-133` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-134` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-135` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-136` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-137` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-138` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-139` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-140` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-141` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-142` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-143` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-144` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-145` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-146` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-147` | 6 | — | Fourth wave (README) — after UI + hardening |
| `REG-148` | 6 | — | Fifth wave (README) — deep mechanics and hazards |
| `REG-149` | 6 | — | Fifth wave (README) — deep mechanics and hazards |
| `REG-150` | 6 | — | Fifth wave (README) — deep mechanics and hazards |
| `REG-151` | 6 | — | Fifth wave (README) — deep mechanics and hazards |
| `REG-152` | 6 | — | Fifth wave (README) — deep mechanics and hazards |
| `REG-153` | 6 | — | Fifth wave (README) — deep mechanics and hazards |
| `REG-154` | 6 | — | Fifth wave (README) — deep mechanics and hazards |
| `REG-155` | 6 | — | Fifth wave (README) — deep mechanics and hazards |
| `REG-156` | 6 | — | Fifth wave (README) — deep mechanics and hazards |
| `REG-157` | 6 | — | Sixth wave (README) — hazard *tile* types and coverage |
| `REG-158` | 6 | — | Sixth wave (README) — hazard *tile* types and coverage |
| `REG-159` | 6 | — | Sixth wave (README) — hazard *tile* types and coverage |
| `REG-160` | 6 | — | Sixth wave (README) — hazard *tile* types and coverage |

*Phase **6** is README fourth, fifth, and sixth **waves** for IDs `REG-120`–`REG-160` **except** `REG-129` (Phase **7** with release). `Phase` here is an **implementation** order, not the same as wave numbers in the index.*

**Spikes:** a `REG-120`–`REG-160` item can move earlier if it **unblocks a P0**; tickets stay the source of truth. **`REG-129`** stays in Phase **7** with ship decisions.

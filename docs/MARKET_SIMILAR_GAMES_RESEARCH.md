# Market research: successful games similar to pair / memory puzzles

**Method:** Multiple delegate research passes (external web/store sources) plus spot web search, **April 2026**. Chart ranks and live revenue are **time- and region-dependent**; where we did not pull a dated Sensor Tower / data.ai snapshot, those metrics are treated as **unverified**.

**Related design docs:** [GAME_MECHANICS_IDEAS.md](./GAME_MECHANICS_IDEAS.md), [GAME_MECHANICS_PLAN.md](./GAME_MECHANICS_PLAN.md).

---

## 1. Important genre split (product positioning)

| Bucket | What it is | Commercial scale (qualitative) |
|--------|------------|----------------------------------|
| **Pure hidden-card memory** | Flip two face-down cards; Pelmanism / Concentration | **Niche** on mobile; long-tail of themed kids/education apps and classics |
| **Pair-clear puzzles (visible tiles)** | Mahjong solitaire, Onet/Onnect (path-limited pair), “tile master” match-to-tray | **Very large**; most “pair” money and clones sit here |
| **Hybrid-casual 3D match** | Triple Match 3D–style: find 3 identical props, bar/timer fail | **Hybrid-casual revenue leader** tier (industry summaries; see [Triple Match 3D](https://en.wikipedia.org/wiki/Triple_Match_3D)) |
| **Brain-training memory minigames** | Often **not** classic grids; e.g. n-back style ([Lumosity Memory Match](https://www.lumosity.com/en/brain-games/memory-match/)) | **Subscription** suites; different retention + compliance expectations |

**Design takeaway for this repo:** If the pitch stays **memorize-then-hide** (premium/desktop-feel), you are closer to **pure memory + PC/console polish** than to **Mahjong F2P**. Borrow **systems** (hints, shuffle, dailies) from the big mobile category without assuming the same **monetization** mix.

---

## 2. Notable titles and what they do

### 2.1 Closest to classic Concentration (flip / pairs)

| Title | Platform hints | Differentiation / mechanics (reported) |
|-------|----------------|----------------------------------------|
| **[Memory Matches 2: Card Connect](https://apps.apple.com/us/app/memory-matches-2-card-connect/id500028364)** | iOS (long-running SKU) | Modes (timed vs accuracy), **RedX** pressure, **stars** unlock themes/grids, **daily streak**, educational pair types, **multiplayer** pass-and-play, ads + sub + remove-ads ([App Store listing](https://apps.apple.com/us/app/memory-matches-2-card-connect/id500028364)) |
| **[Memory Match – My Memories](https://apps.apple.com/us/app/card-pair-matching-memory-game/id6448664960)** | iOS | **Custom photos / themed decks**, goals on time/moves, two-player on one device ([App Store](https://apps.apple.com/us/app/card-pair-matching-memory-game/id6448664960)) |
| **[Memory!](https://apps.apple.com/us/app/memory/id467939841)** | iOS | Many **themes / deck sizes**, difficulty scaling ([App Store](https://apps.apple.com/us/app/memory/id467939841); [developer page](https://mwm.ai/apps/memory/467939841)) |
| **[RememPair](https://www.nintendo.com/us/store/products/remempair-switch/)** | Switch (2025) | Match **groups of 2–4**, solo / AI / pass-and-play up to 6, **DLC** card sets, music player ([Nintendo store](https://www.nintendo.com/us/store/products/remempair-switch/)) |
| **[Concentration (universal)](https://apps.apple.com/us/app/concentration-universal/id503956942)** | iOS | Puzzle framing, Game Center, **multiplayer** per listing ([App Store](https://apps.apple.com/us/app/concentration-universal/id503956942)) |

### 2.2 Adjacent “pair” mass market (visible tiles, boosters, levels)

| Title | Notes |
|-------|--------|
| **Onnect / Onet-style** | **Path-limited** connection between identical tiles; **hints, shuffle, bombs, timers, revive**, collections, ad removal — see [Onnect-style guide](https://www.gamebility.com/onnect) |
| **Mahjong solitaire cluster** | **Mahjong Club**, **Mahjong Journey (G5)**, **MobilityWare Mahjong**, **BitMango Classic** — huge **level maps**, **daily challenges** (e.g. [MobilityWare listing](https://play.google.com/store/apps/details?id=com.mobilityware.MahjongSolitaire)), **hints/undo/shuffle** patterns, travel/narrative skins ([Mahjong Club](https://play.google.com/store/apps/details?id=com.gamovation.mahjongclub)) |
| **[Triple Match 3D](https://en.wikipedia.org/wiki/Triple_Match_3D)** | **3-of-a-kind** from a pile; **boosters**, tight fail buffer, strong cosmetic/IAP economy; hybrid-casual benchmark ([Wikipedia](https://en.wikipedia.org/wiki/Triple_Match_3D); [App Store](https://apps.apple.com/us/app/triple-match-3d/id1607122287)) |
| **Match Factory** | Often discussed as **fast follower** in same 3D match space — treat revenue claims as **unverified** unless you pull data ([Naavik digest](https://naavik.co/digest/match-factory-pays-off/)) |
| **[Connect Master – Pair Matching](https://apps.apple.com/us/app/connect-master-pair-matching/id1620932107)** | **Line-limited** pairing, large level count, **duel** modes ([App Store](https://apps.apple.com/us/app/connect-master-pair-matching/id1620932107)) |

### 2.3 Brain training / working memory (same audience, different loop)

| Title | Notes |
|-------|--------|
| **[Lumosity – Memory Match](https://www.lumosity.com/en/brain-games/memory-match/)** | **N-back-style** (match to symbol from *two steps ago*), not a hidden grid — subscription context; see [FTC Lumosity settlement](https://www.ftc.gov/news-events/news/press-releases/2016/01/lumosity-pay-2-million-settle-ftc-deceptive-advertising-charges-its-brain-training-program) on **cognitive claims** |
| **[Peak – Brain Training](https://play.google.com/store/apps/details?id=com.brainbow.peak.app)** | **Daily workout** wrapper, many minigames, progress framing; regional **Editors’ Choice** varies — **unverified** for your locale today |

### 2.4 Industry-scale tile match (ads / UA)

- **Vita Mahjong** — Cited in trade press for very high **ad revenue** scale and **minimal meta** positioning; also notes heavy **creative/UA** volume ([Gamigion](https://www.gamigion.com/vita-mahjong-scaled-past-150k-a-day/)). Treat exact long-term figures as **analytics-derived**, not stable facts.

---

## 3. Patterns the successful adjacent games repeat

1. **Simple core + long content tail** — Thousands of levels, theme packs, or deep cosmetic libraries ([Mahjong Club](https://play.google.com/store/apps/details?id=com.gamovation.mahjongclub); [Gamigion on Vita Mahjong](https://www.gamigion.com/vita-mahjong-scaled-past-150k-a-day/)).
2. **Assist economy** — **Hint**, **shuffle**, **undo**, **revive** as sinks for currency, ads, or IAP ([gamebility Onnect](https://www.gamebility.com/onnect); [Triple Match 3D](https://en.wikipedia.org/wiki/Triple_Match_3D)).
3. **Habit hooks** — **Daily puzzle**, **streaks**, star/currency loops ([Memory Matches 2](https://apps.apple.com/us/app/memory-matches-2-card-connect/id500028364); MobilityWare **daily challenge** copy).
4. **Multiple modes / audiences** — Timed vs relaxed, kids vs brain training, arcade vs leisure ([Memory Matches 2](https://apps.apple.com/us/app/memory-matches-2-card-connect/id500028364); [Onnect](https://www.gamebility.com/onnect)).
5. **Social / same-device** — Pass-and-play, duels, clubs ([Memory Matches 2](https://apps.apple.com/us/app/memory-matches-2-card-connect/id500028364); [Connect Master](https://apps.apple.com/us/app/connect-master-pair-matching/id1620932107); [Mahjong Club](https://play.google.com/store/apps/details?id=com.gamovation.mahjongclub)).
6. **Monetization** — **Ads + remove ads**, **IAP currency**, **subscriptions** on brain apps ([Memory Matches 2](https://apps.apple.com/us/app/memory-matches-2-card-connect/id500028364); [FTC Lumosity](https://www.ftc.gov/news-events/news/press-releases/2016/01/lumosity-pay-2-million-settle-ftc-deceptive-advertising-charges-its-brain-training-program)).

---

## 4. Risks and backlash (avoid or handle carefully)

| Risk | Source / note |
|------|----------------|
| **Unsubstantiated brain / medical claims** | [FTC vs Lumosity](https://www.ftc.gov/news-events/news/press-releases/2016/01/lumosity-pay-2-million-settle-ftc-deceptive-advertising-charges-its-brain-training-program) ($2M settlement) |
| **Tone mismatch with audience** | [IGN on Brain Age: Concentration Training](https://www.ign.com/articles/2013/02/08/brain-age-concentration-training-review) (“devilish” framing criticism) |
| **Deceptive patterns in kids’ apps (ads, continue gates)** | [TechXplore summary of QUT research](https://techxplore.com/news/2026-03-popular-kids-apps-deceptive-tactics.html) — memory/matching apps were in studied set |
| **Rewarded-video fatigue / interruptive ads** | General F2P puzzle category pattern — **unverified** as one named scandal; store reviews worth sampling per SKU |

---

## 5. Implications for *this* project (actionable)

- **Systems worth copying (fit your plan):** Limited **shuffle**, **hint/peek** variants, **undo** (if balanced), **daily seed** challenge — align with [GAME_MECHANICS_PLAN.md](./GAME_MECHANICS_PLAN.md) board powers.
- **Systems common in hits but optional for you:** **Energy/lives** as monetization (you already use lives as **skill fail state** — keep semantics clear vs F2P timers), **10k level maps**, **heavy ad IAP**.
- **Differentiation if staying premium / skill-run:** Tighter **forgiveness readability**, **memorize-phase** identity (most mahjong never does this), **Steam/desktop** polish — see [OBSIDIAN_RELIC_THEORY.md](./OBSIDIAN_RELIC_THEORY.md).
- **Do not casually claim** “improves memory / IQ / clinical outcomes” without legal review ([FTC Lumosity](https://www.ftc.gov/news-events/news/press-releases/2016/01/lumosity-pay-2-million-settle-ftc-deceptive-advertising-charges-its-brain-training-program)).
- **PC / premium positioning:** See §6 — bounded content + presentation + multiplayer often replace ad/energy loops.
- **Live ops:** See §7–8 for FTUE, sessions, dailies ethics, touch targets, and timer/accessibility framing.

---

## 6. PC / Steam / console adjacent (delegate pass C)

**Scope:** Titles **adjacent** to “pair / memory” (falling-block, tile solitaire, panel puzzles, brain minigame packs). Not all are flip-two memory; they show what **premium** buyers pay for.

| Title | Hook (store / official copy) |
|-------|------------------------------|
| **[memory® – Ravensburger](https://store.steampowered.com/app/2073750/)** | Licensed **Concentration**; themed sets, **Adventure** mode (750 levels / 5 types claimed), up to **6 players**. Small Steam footprint (~13 reviews at agent fetch) — **brand SKU**, not a Steam blockbuster. |
| **[Mahjong Solitaire Refresh](https://store.steampowered.com/app/1044210/)** | Premium mahjong: **256 stages**, drag controls, panel unlocks; [Ex Panels DLC](https://store.steampowered.com/app/1093250/). |
| **[Lumines Remastered](https://store.steampowered.com/app/851670/)** | Music-timed clears, skins, VS, leaderboards — **audio identity** as selling point. |
| **[Gorogoa](https://store.steampowered.com/app/557600/)** | Panel manipulation puzzle; **hand-drawn / atmospheric** — BAFTA/GDC cited on store page. |
| **[Tetris Effect: Connected](https://store.steampowered.com/app/1003590/)** | Sensory Tetris + online/local multiplayer expansion. [Metacritic PC hub](https://www.metacritic.com/game/pc/tetris-effect-connected) (critic scores — verify live). |
| **[Puyo Puyo Tetris 2](https://store.steampowered.com/app/1259790/)** | Dual rule-sets, **150+ lessons**, heavy multiplayer feature badges. |
| **[Big Brain Academy: Brain vs. Brain](https://www.nintendo.com/us/store/products/big-brain-academy-brain-vs-brain-switch/)** | Nintendo **brain minigame** suite + versus. |
| **[Dr Kawashima’s Brain Training](https://www.nintendo.com/au/games/nintendo-switch/dr-kawashimas-brain-training-for-nintendo-switch/)** (Switch) | Daily drills, Brain Age–style framing (regional pages vary). |

**Vs mobile F2P mahjong clones (inference, widely argued):** Premium SKUs stress **curated stage counts**, **multiplayer / co-op**, **lessons / modes**, **art + sound**, and **DLC expansions** instead of infinite shallow levels + interstitials — **unverified** as a universal law, but consistent on cited store pages.

**Steam tag clusters (sampled):** Puzzle + Casual; Music/Rhythm (Lumines); Multiplayer / Local Multiplayer (PvP puzzlers); Atmospheric / Hand-drawn (Gorogoa); Family / Tabletop / Education ([memory®](https://store.steampowered.com/app/2073750/)).

---

## 7. Retention, onboarding, sessions (delegate pass D)

**Note:** Most sources are **mobile F2P** or **general difficulty** writing; apply selectively to a premium memory game.

### Practices often recommended (with sources)

- **FTUE = retention lever** — one core loop first, quick win, low friction ([Gamigion: FTUE](https://www.gamigion.com/designing-a-great-first-time-user-experience/), [Udonis: FTUE](https://www.blog.udonis.co/mobile-marketing/mobile-games/first-time-user-experience)).
- **Skippable / revisitable tutorial** ([Overwolf FTUE guidelines](https://dev.overwolf.com/ow-native/guides/product-guidelines/onboarding/ftue/)).
- **Session design** — easy resume, natural breakpoints, avoid punishing interruption ([Mobile Free to Play: session design](https://mobilefreetoplay.com/mobile-session-design/)).
- **Difficulty / flow** — tune with completion + retention curves; fix crashes and **bad ad UX** before blaming “too hard” ([Game Developer: difficulty curves](https://www.gamedeveloper.com/design/difficulty-curves-how-to-get-the-right-balance-), [PocketGamer difficulty / retention](https://www.pocketgamer.biz/difficulty-curves-find-the-right-balance-and-boost-retention-and-revenue/)).
- **Ads vs churn** — one **Nov 2025** Unity AdQuality analysis (reported via PocketGamer): **interstitials** correlated with higher **post-ad churn** than **rewarded video**; networks vary widely ([PocketGamer: ad quality and churn](https://www.pocketgamer.biz/what-our-data-reveals-about-ad-quality-and-player-churn-in-mobile-games/)).
- **Streaks / dailies** — habit + loss aversion; **flex** (freezes) reduces shame-quit ([Duolingo: streak research blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)); ethics critique ([DarkPattern.games: daily rewards](https://www.darkpattern.games/pattern/11/daily-rewards.html), [Gamigion: streaks](https://www.gamigion.com/daily-login-streaks-reward-or-illusion/)).
- **Retry fairness** — failure cost and “one more try” ([Jesper Juul: fear of failing](https://jesperjuul.net/text/fearoffailing/)) — qualitative, not puzzle-specific KPIs.

### Solo-dev checklist (memory / pair)

1. FTUE: flip → match in few steps; skip/revisit help.  
2. Resume: clear board state; soften time pressure early.  
3. Ramp: grid size / symbol sets gradually; watch drop-offs per stage.  
4. If using dailies: small rewards + **streak forgiveness**.  
5. If monetizing with ads: treat **interstitials** as a measured experiment; prefer **rewarded** for opt-in boosts.  

---

## 8. Accessibility & older-adult casual players (delegate pass E)

**Mapping note:** WCAG is **web-first**; teams often use the same numbers as **targets** for native apps — not automatic legal equivalence (**unverified** as compliance).

### Survey / editorial (50+ players)

- AARP: older players want **personalization** — difficulty, font size, speed, less clutter, clearer goals; puzzle/card/tile genres common ([gamer accessibility preferences](https://www.aarp.org/pri/topics/technology/internet-media-devices/gamer-accessibility-preferences-older-adults/), [frustrations](https://www.aarp.org/home-family/personal-technology/info-2023/older-gamers-frustrations.html)).

### Touch targets (benchmarks)

- [WCAG 2.2 target size minimum (AA)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — **24×24** CSS px with spacing rules.  
- [WCAG 2.2 target size (enhanced AAA)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) — **44×44** CSS px for important controls.  
- [Apple HIG — buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) — **44×44 pt** minimum hit targets.  
- [Google Android accessibility](https://support.google.com/accessibility/android/answer/7101858?hl=en) — **≥48×48 dp** recommended.

### Color, contrast, motion, time

- Do not rely on **hue alone** for pairs — patterns/shapes ([Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/ensure-no-essential-information-is-conveyed-by-a-fixed-colour-alone/)).  
- UI states / card chrome: [non-text contrast (WCAG)](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast).  
- Motion: [animation from interactions (WCAG 2.3.3)](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions); align with product **`reduceMotion`**.  
- Timers: if mandatory limits exist on web, [timing adjustable (2.2.1)](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html) — many zen puzzlers offer **untimed** mode instead.  
- Cognitive UX patterns: [W3C COGA usable doc](https://www.w3.org/TR/coga-usable), [cognitive accessibility overview](https://www.w3.org/WAI/cognitive/).

### Further reading (starting points)

- [JMIR Serious Games — mobile design for middle-aged/older adults](https://games.jmir.org/2021/2/e24449)  
- [W3C games workshop — adaptive accessibility](https://www.w3.org/2018/12/games-workshop/papers/web-games-adaptive-accessibility.html)  

---

## 9. Research artifacts (all delegate passes)

| Pass | Focus |
|------|--------|
| **A** | Pure memory vs Onet/Mahjong scale; Memory Matches 2, Lumosity, RememPair, Vita Mahjong; FTC, IGN, TechXplore. |
| **B** | Mahjong / Triple Match 3D / Connect Master / Peak; feature checklist; store links. |
| **C** | Steam/console premium and adjacent puzzlers; Ravensburger memory®, mahjong refresh, Gorogoa, Tetris/Puyo, Nintendo brain titles. |
| **D** | FTUE, sessions, difficulty curves, ads/churn, streak ethics, solo checklist. |
| **E** | AARP older-player themes, WCAG/Apple/Google targets, color/motion/timer, COGA. |

*Re-run delegates or add Sensor Tower / data.ai snapshots when you want dated commercial benchmarks.*

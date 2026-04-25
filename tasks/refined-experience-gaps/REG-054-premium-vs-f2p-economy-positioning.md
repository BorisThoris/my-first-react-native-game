# REG-054: Premium Vs F2P Economy Positioning

## Status
Open

## Priority
P2

## Area
Meta

## Evidence
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`
- `docs/COLLECTIBLE_SYSTEM.md`
- `docs/LEADERBOARDS_DEFERRAL.md`
- `tasks/refined-experience-gaps/REG-024-economy-unification.md`
- `package.json`

## Problem
Market research shows many adjacent games rely on ads, IAP currencies, boosters, and subscriptions, while this project is positioned as a Windows-first Steam desktop game. The economy needs to avoid accidentally copying F2P pressure patterns that do not fit the product.

## Target Experience
The game should have a coherent premium economy: progression, cosmetics, mastery, and optional challenge rewards without ad-style friction or manipulative sinks.

## Suggested Implementation
- Record product stance: premium/offline-first unless explicitly changed.
- Audit shop, currencies, streaks, cosmetics, and assists against that stance.
- Define what is never monetized: continues, lives, fairness, accessibility settings, or core power access.
- Use run currency and meta cosmetics as gameplay systems, not payment placeholders.
- Keep future monetization fields out of `SaveData` until product approves.

## Acceptance Criteria
- Economy tasks do not introduce ad/IAP assumptions.
- UI copy does not imply purchasable currencies or pay-to-win boosters.
- Cosmetic and progression rewards fit premium expectations.
- Any future monetization proposal is a separate explicit product decision.

## Verification
- Review menu, shop, settings, collection, and game-over copy.
- Check no placeholder store or purchase language appears.
- No unit tests required until implementation starts.

## Cross-links
- `REG-015-shop-and-run-currency-system.md`
- `REG-024-economy-unification.md`
- `REG-066-card-theme-system-and-theme-economy.md`
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`

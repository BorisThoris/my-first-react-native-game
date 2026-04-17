# Visual language (relic draft)

## Principles

- **Rarity is read from chrome**, not from a prefix like “Rare · …”. Body copy is only the **perk effect** (shuffle charge, memorize time, etc.).
- **Borderlands-inspired bands:** common = muted steel / thin rim; uncommon = acid green glow; rare = violet–ember core with stronger rim and sheen.
- **WCAG:** color alone is insufficient. Each tier also differs by **border weight**, **glow intensity**, and a **small rune strip / pattern** (CSS background) so non-color perception still distinguishes tiers.
- **Screen readers:** each choice is a **button** with `aria-label` including explicit rarity wording (e.g. “Rare relic: …”) while visible text stays effect-only. Optional `sr-only` span duplicates rarity for consistency with `aria-label`.

## Motion

- Sheen or pulse on cards is gated by **`[data-reduce-motion='false']`** (project-wide pattern). When reduce motion is on, static borders only.

## Implementation

- CSS module: [`RelicDraftOffer.module.css`](../../../src/renderer/components/RelicDraftOffer.module.css) (or nested under `GameScreen.module.css`) maps `RelicDraftRarity` → classes `card_common`, `card_uncommon`, `card_rare`.

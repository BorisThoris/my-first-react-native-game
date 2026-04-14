# Internationalization foundation (A11Y-008, deferred)

This note captures how we would introduce **non–English UI** if product asks for it. It is **documentation only**: no packages are added until that decision is made.

**Steam demo v1:** localization work described here is **not in scope** for the first Steam demo build. Ship English-only; keep strings readable and avoid hard-coding copy in scattered literals where easy, but do not block release on i18n infrastructure.

---

## Library recommendation: `react-i18next` vs Lingui

| Concern | **`react-i18next`** | **Lingui (`@lingui/react` + CLI)** |
|--------|---------------------|--------------------------------------|
| Mental model | Runtime catalogs (JSON/PO), `useTranslation`, namespaces | Compile-time message catalogs, macros / `t` templates, strong ICU story |
| Tooling | Mature docs, optional extraction via `i18next-parser` or manual keys | First-class `lingui extract`; unused strings easier to prune |
| React Native fit | Common pattern; works without a custom Babel macro pipeline | Supported; macros need consistent build config across app + packages |
| Bundle / perf | Fine for moderate catalogs; lazy-load namespaces per screen | Often smaller runtime for large apps; pays off when many locales |

**Recommendation for this repo when i18n ships:** default to **`react-i18next`** unless we explicitly want compile-time extraction and Lingui’s macro workflow across **all** packages that render UI. The renderer already sits in a multi-package layout (`src/renderer`, `packages/*`); `i18next` + JSON (or TS modules) keeps onboarding cost low and avoids tying every package to the same Lingui compiler version. Revisit **Lingui** if we need strict compile-time catalogs, heavy plural/gender ICU, or a single extraction pipeline enforced in CI.

---

## String extraction policy

1. **User-visible copy** (menus, HUD, modals, toasts, settings labels, errors shown to players) gets a **stable key** and lives in locale resources—not inline JSX literals, except trivial prototypes marked with a TODO if unavoidable.
2. **No translated string math:** avoid `"Score: " + n`; use interpolation / ICU-style placeholders so word order can change per locale.
3. **Shared gameplay data** (achievement titles, relic names, mutator blurbs) that already live under `src/shared` should remain **data-driven**: the English string (or template) is the **source** in a catalog module; the renderer maps the same id through i18n when non-EN ships.
4. **Dev-only / debug** strings, test fixtures, and Vitest expectations stay **English** and out of catalogs.
5. **Extraction workflow (when adopted):** define a namespace per surface (`meta`, `hud`, `settings`, …), run extraction or enforce keys in review, and fail CI on missing keys only once the pipeline exists—until then, document keys in the same PR as UI changes.

---

## `src/shared` copy modules pattern

Keep **domain copy** that must match between logic and UI in **`src/shared`** as plain modules (TypeScript objects or small functions), not inside React components:

- **Example shape:** `src/shared/copy/achievements.en.ts` (or a single `copy/meta.ts`) exporting `Record<AchievementId, { title: string; description: string }>` used by achievements logic and tests.
- **Renderer responsibility:** components import the **id** + default English from shared catalogs for fallbacks, and call `t('achievements:relic_hunter.title')` (or equivalent) for display once `i18next` is wired.
- **Why:** avoids circular imports from `renderer` → `shared`, keeps copy discoverable in one place, and lets headless tests assert on stable ids and English defaults without mounting the full i18n provider.

Until i18n ships, **English modules in `src/shared`** are the single source of truth; later, generated locale files mirror the same keys.

---

## Summary

- **Stack:** Prefer **`react-i18next`** for pragmatic RN + monorepo fit; **Lingui** remains the alternative if we standardize on compile-time extraction.
- **Policy:** Keys + interpolation; shared strings owned in **`src/shared`** catalogs; no player-facing concat; dev strings excluded.
- **Steam demo v1:** **Not shipped**—English-only demo is acceptable; this document is advance planning for **A11Y-008**.

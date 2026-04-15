# Viewport-fitted UI (no page scroll)

## Policy: no DOM scrollports

Shipped chrome (main menu, meta shells, settings, modals, panels) must not use **`overflow-y: auto` / `scroll`** on HTML. Prefer **`@media` / `@container` reflow**, **row→column** layout, **progressive disclosure** (group or hide secondary actions), then **uniform `zoom`** via [`useFitShellZoom`](../src/renderer/hooks/useFitShellZoom.ts). Short landscape detection for layout matches [`VIEWPORT_SHORT_LANDSCAPE_MAX_HEIGHT`](../src/renderer/breakpoints.ts) (860px) in TS and in shell CSS.

**Main menu stack vs fit:** Short height alone does not force the phone-style single-column hero/support stack. That stack applies when the viewport is a **phone** (`width ≤ VIEWPORT_MOBILE_MAX`) or a **narrow** short landscape: [`isNarrowShortLandscapeForMenuStack`](../src/renderer/breakpoints.ts) (`isShortLandscapeViewport` **and** `width ≤ VIEWPORT_LANDSCAPE_STACK_MAX_WIDTH`, 960px). Examples: **844×390** and **900×700** stack; **1280×720** and **1920×720** keep the two-column grid and rely on fit zoom + tokens for height.

This project keeps meta shells (main menu, choose-your-path, etc.) inside the visible area **without document scrolling**, using a hybrid of **layout compaction** and **uniform scale** when content would still overflow.

## Guides and patterns (bookmark)

| Topic | Resource |
|--------|-----------|
| Game-style `min(scaleX, scaleY)` scaling | [William Malone — HTML5 game scaling](https://www.williammalone.com/articles/html5-game-scaling/) |
| Practical scale math / canvas + DOM | [StackOverflow — set game scale ratio](https://stackoverflow.com/questions/72162572/set-game-scale-ratio), [scale game viewport](https://stackoverflow.com/questions/39694618/how-to-scale-game-viewport) |
| **CSS `transform: scale()`** vs layout box | [MDN — transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) (layout does not shrink unless you compensate) |
| **CSS `zoom`** (Chromium / Electron) | [MDN — zoom](https://developer.mozilla.org/en-US/docs/Web/CSS/zoom) — affects layout in Blink; useful for Electron-first builds |
| **Container queries** | [MDN — CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) — style from **shell box** size, not only viewport |
| Fluid layout | `clamp()`, `min()`, `dvh`, `env(safe-area-inset-*)` on top of breakpoints |

## Libraries considered (npm)

| Package | Role | Notes for this repo |
|---------|------|---------------------|
| [**@fit-screen/react**](https://www.npmjs.com/package/@fit-screen/react) ([repo](https://github.com/jp-liu/fit-screen)) | Fixed **design width/height**, `transform: scale`, modes `fit` / `full` / scroll axes | Good for **kiosk / data-dashboard** “designed at 1920×1080” UIs. Low download count — **validate on a branch** before replacing in-tree logic. |
| [**react-fit-to-viewport**](https://github.com/pomber/react-fit-to-viewport) | Fit children to viewport | Older maintenance; overlap with custom hook. |
| [**dynascale**](https://www.npmjs.com/package/dynascale) | Scale children in a container | Niche; audit bundle and behavior if tried. |
| **Pan/zoom** viewers | Gestures, minimap | **Not** appropriate for full-app shell (feels like a web document tool). |

A minimal **spike test** lives at [`src/renderer/dev/fitScreenSpike.test.tsx`](../src/renderer/dev/fitScreenSpike.test.tsx): it imports `@fit-screen/react` so the dependency stays wired and typechecked. It does **not** replace the production menu shell.

## In-repo decision (why not replace `useFitShellZoom` today)

1. **Implementation today** — [`src/renderer/hooks/useFitShellZoom.ts`](../src/renderer/hooks/useFitShellZoom.ts) + **`zoom`** on the inner menu/path column:
   - Recomputes on viewport size, **`document.fonts.ready`**, and a short delayed pass; measures the wrapper and unwraps the current zoom to get intrinsic size (no ResizeObserver loop on the shell).
   - **`zoom`** adjusts layout size in Chromium, which matches **Steam / Electron** and keeps **hit targets** aligned with painted controls (same concern as `transform` + wrapper math, but less glue code).

2. **`@fit-screen/react`** uses **`transform: scale`** from a **fixed design draft** (`width` / `height` props). That is a good fit when the entire UI is authored at one resolution. Our menu height is **content-driven** (save state, “How to play”, etc.), so a single draft size is a second source of truth unless we lock layout to a canvas-like frame.

3. **Playwright** already asserts **no vertical overflow** on `[data-app-scrollport]` and **in-viewport** CTAs for reference viewports ([`e2e/visualScenarioSteps.ts`](../e2e/visualScenarioSteps.ts)). Swapping the shell should re-run those plus visual captures.

## How to spike `@fit-screen/react` on a branch (manual checklist)

1. `yarn add @fit-screen/react` (already listed as a **devDependency** for the spike test).
2. Wrap the **inner** menu column (same subtree currently receiving `style={{ zoom: fitZoom }}`) in `<FitScreen width={…} height={…} mode="fit">` **instead of** `useFitShellZoom`, or nest behind a **feature flag** for side-by-side comparison.
3. Compare:
   - **Blur** at non-integer scales,
   - **Click targets** vs visuals,
   - **`yarn playwright test e2e/ui-design-reference.spec.ts --grep main menu`** on 1280×720, 844×390, 390×844.

If a branch proves `FitScreen` superior (e.g. less blur with `transform` + their wrapper math), merge deliberately and remove redundant zoom logic.

## Container queries in CSS modules

Desktop-short compaction for the main menu and choose-your-path screens uses **`@container`** on the same shell nodes that host fit-zoom (`container-type: size` + `container-name`), so rules track the **actual shell** width/height rather than only the global viewport (helpful inside window chrome and nested flex).

**Choose Your Path — More modes:** the library uses a **horizontal** scroll-snap tray (`overflow-x` on the inner scroller). That is not a second vertical document scroll; navigation is **touch pan / mouse drag** plus optional dot jumps. Product + a11y notes: [epic-choose-your-path.md](./gameplay/epic-choose-your-path.md) (**Cross-platform interaction**).

## Spacing ladder (`--theme-space-*`)

| Token | Role |
|--------|------|
| `--theme-space-2xs` | Hairline rhythm, tight stacks |
| `--theme-space-xs` | Label stacks, TOC rows |
| `--theme-space-sm` | Dense flex gaps |
| `--theme-space-md` | Default grid / card padding (short axis) |
| `--theme-space-lg` | Section gaps, sidebars |
| `--theme-space-xl` | Primary inset / header gaps |
| `--theme-space-2xl` | Major column gaps, shell body rhythm |
| `--theme-space-3xl` | Outermost shell padding (when not safe-area) |

**Sources:** [`src/renderer/styles/theme.ts`](../src/renderer/styles/theme.ts) defines `--ui-space-*` (numeric steps) and `--theme-space-*` as aliases. [`buildRendererThemeStyle`](../src/renderer/styles/theme.ts) swaps in a tighter `--ui-space-*` ladder when the viewport is **compact** (same predicate as `data-density="compact"` on [`App.tsx`](../src/renderer/App.tsx)).

**Shell locals:** Main menu [`.fitViewport`](../src/renderer/components/MainMenu.module.css) and choose-your-path [`.pathFitViewport`](../src/renderer/components/ChooseYourPathScreen.module.css) expose `--menu-*` / `--path-*` custom properties so **`@container`** can shrink spacing by **overriding variables** instead of duplicating every `gap` / `padding` rule.

### Order of operations (small viewports)

1. **Tighten intrinsic spacing** — use the ladder + shell variables + container queries first.
2. **Uniform zoom last** — [`useFitShellZoom`](../src/renderer/hooks/useFitShellZoom.ts) only after layout still overflows.

### Gap vs margin

- Prefer **`gap`** on flex/grid parents for vertical rhythm inside a section.
- Use **`padding`** on the section container for inset from its frame.
- Reserve **`margin`** for separation from **unrelated** siblings (e.g. copy below a heading that is not in the same gap-driven stack); avoid margin on every child when a parent `gap` would stay predictable (no collapse surprises).

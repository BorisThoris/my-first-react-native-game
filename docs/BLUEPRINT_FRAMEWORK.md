# Blueprint-style visualization and codegen

## What this is

- **Read-only import graph:** dev UI shows how `src/**` TypeScript files import each other. Open with  
  `?devSandbox=1&fx=projectGraph` (aliases: `fx=blueprint`, `fx=blueprintExplorer`). The graph is built by `scripts/graph-project.mjs` and served in dev as `GET /__api/project-graph` by the Vite plugin in `scripts/vite-dev-blueprint-api.mjs`. The plugin uses `enforce: 'pre'` and is listed **before** `@vitejs/plugin-react` in `vite.config.mts` so the SPA `index.html` fallback never intercepts `/__api/*` (otherwise the client sees a black or empty graph and JSON parse errors).
- **Codegen (source of truth = JSON):** blueprint definitions live under `src/blueprint/definitions` as `*.blueprint.json`. The glossary vertical (`kind: "glossary"`, `blueprintVersion: 1`) generates `src/shared/generated/blueprintGlossaryGen.ts` via `yarn blueprint:codegen` or `POST /__api/blueprint-codegen` in dev. JSON schema: `src/blueprint/schema/blueprint-v1-glossary.json`.
- **AST POC (allowlisted, dangerous):** `POST /__api/ast-poc-mutate` uses ts-morph on paths listed in `scripts/ast-allowlist.json` only. The UI must **preview diff** then **apply**; never treat disk writes as safe without review.

## Commands

| Command | Purpose |
|--------|--------|
| `yarn graph:project` | Print/write project graph (CLI; same builder as the dev API) |
| `yarn blueprint:codegen` | Regenerate glossary TS from `*.blueprint.json` |

## Adding a new glossary node (term)

1. Edit or add a `*.blueprint.json` with `kind: "glossary"`, `blueprintVersion: 1`, and push an entry in `nodes[]` (see `devTerms.blueprint.json`).
2. Run `yarn blueprint:codegen` and commit the updated `src/shared/generated/blueprintGlossaryGen.ts`.
3. Extend the schema in `blueprint-v1-glossary.json` if you add new top-level properties.
4. `yarn typecheck` and `yarn test` (see `src/shared/blueprintGlossaryGen.test.ts`).

**Not safe to use** for: arbitrary hand-written TypeScript, JSX, or anything outside the small blueprint schema—the generator only understands the declared JSON shape. For direct TS editing, the AST path is explicitly allowlisted and meant as a lab; do not expand the allowlist without team agreement and CI review.

## Pipeline layout (unsafe zones)

- **Safe:** Glossary and future blueprint kinds that only emit from versioned JSON + codegen.
- **Unsafe without review:** `ast-poc` apply, widening `ast-allowlist.json`, or skipping diff preview.

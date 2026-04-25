# testRoutingMatrix

schema: 1
defaultPerSlice:
  - yarn typecheck
  - yarn test
routes:
  docs_only:
    triggers:
      - docs/**
      - tasks/**/*.md
    required: []
    notes:
      - "no tests when markdown/json-only and no generator script changed"
      - "never complete two docs-only REG slices consecutively"
  agent_json:
    triggers:
      - docs/agent/REG_STATE_INDEX.json
    required:
      - "node -e \"JSON.parse(require('fs').readFileSync('docs/agent/REG_STATE_INDEX.json','utf8')); console.log('REG_STATE_INDEX valid')\""
  shared_contracts_rules:
    triggers:
      - src/shared/contracts.ts
      - src/shared/game.ts
      - src/shared/relics.ts
      - src/shared/mutators.ts
      - src/shared/floor-mutator-schedule.ts
    required:
      - yarn typecheck:shared
      - yarn vitest run src/shared/game.test.ts
      - yarn typecheck
      - yarn test
    conditional:
      - "if mechanics copy changed: yarn docs:mechanics-appendix"
  save_schema_version:
    triggers:
      - src/shared/save-data.ts
      - src/shared/version-gate.ts
      - src/main/persistence.ts
      - src/renderer/store/persistBridge.ts
    required:
      - yarn typecheck:shared
      - yarn vitest run src/shared/save-data.test.ts src/shared/version-gate.test.ts
      - yarn typecheck
      - yarn test
    conditional:
      - "if main/preload/IPC changed: include src/main/*.test.ts"
  telemetry_privacy:
    triggers:
      - src/shared/telemetry.ts
    required:
      - yarn vitest run src/shared/telemetry.test.ts
      - yarn typecheck
      - yarn test
  renderer_component:
    triggers:
      - src/renderer/components/**/*.tsx
      - src/renderer/store/**/*.ts
      - src/renderer/copy/**/*.ts
    required:
      - yarn typecheck
      - yarn test
    conditional:
      - "if responsive/mobile layout changed: yarn test:e2e:visual:smoke"
      - "if navigation/gameplay flow changed: yarn test:e2e:renderer-qa"
      - "if a11y semantics changed: yarn test:e2e:a11y"
  electron_ipc:
    triggers:
      - src/main/**
      - src/preload/**
      - src/shared/ipc-channels.ts
    required:
      - yarn typecheck
      - yarn test
    conditional:
      - "release-only packaging smoke deferred on Linux unless REG explicitly requires it"
  visual_mobile:
    triggers:
      - src/renderer/components/**/*.module.css
      - src/renderer/styles/**
      - e2e/*visual*
    required:
      - yarn typecheck
      - yarn test
    conditional:
      - yarn test:e2e:visual:smoke
      - yarn test:e2e:renderer-qa

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
      - src/shared/game-core.ts
      - src/shared/board-generation.ts
      - src/shared/turn-resolution.ts
      - src/shared/board-powers.ts
      - src/shared/dungeon-rules.ts
      - src/shared/route-rules.ts
      - src/shared/shop-rules.ts
      - src/shared/objective-rules.ts
      - src/shared/tile-identity.ts
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
      - "if dungeon-rules changed: yarn vitest run src/shared/game.test.ts -t \"dungeon cards\""
      - "if board-powers changed: yarn vitest run src/shared/game.test.ts -t \"board powers\""
      - "if route-rules or shop-rules changed: yarn vitest run src/shared/game.test.ts -t \"REG-017 route choices|REG-015 run shop wallet\""
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
  startup_intro_boot:
    triggers:
      - src/renderer/App.tsx
      - src/renderer/components/StartupIntro.tsx
      - src/renderer/components/startupIntro*.ts
      - src/renderer/components/StartupIntro.module.css
      - e2e/startup-intro-contract.spec.ts
    required:
      - yarn vitest run src/renderer/components/startupIntro.test.ts src/renderer/components/startupIntroContract.test.ts src/renderer/components/startupIntroComponent.test.tsx src/renderer/App.test.tsx
      - yarn typecheck
      - yarn test
      - yarn playwright test e2e/startup-intro-contract.spec.ts --workers=1
    conditional:
      - "when visual snapshots change: yarn playwright test e2e/menu-boot-visual.spec.ts --workers=1"
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

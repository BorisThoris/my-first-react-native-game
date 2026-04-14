import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildMechanicsCatalogAppendixMarkdown } from '../src/shared/mechanics-catalog-appendix-builder';

const out = join(process.cwd(), 'docs', 'gameplay', 'GAMEPLAY_MECHANICS_CATALOG.auto-appendix.md');
writeFileSync(out, buildMechanicsCatalogAppendixMarkdown(), 'utf8');
console.log('Wrote', out);

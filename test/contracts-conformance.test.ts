import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import { describe, expect, it } from 'vitest';
import { ALL_ENDPOINTS } from '../src/contracts/registry';

const toContractPath = (routeFile: string): string => {
  const relative = routeFile.replace(/\\/g, '/');
  const withoutRoot = relative.replace(/^app/, '');
  const withoutSuffix = withoutRoot.replace(/\/route\.ts$/, '');
  return withoutSuffix.replace(/\[([^\]]+)\]/g, ':$1');
};

const exportedMethodsForRoute = (source: string): string[] => {
  const methods = new Set<string>();

  for (const match of source.matchAll(/export\s+const\s+(GET|POST|PATCH|PUT|DELETE)\s*=/g)) {
    const method = match[1];
    if (method) methods.add(method);
  }
  for (const match of source.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PATCH|PUT|DELETE)\b/g)) {
    const method = match[1];
    if (method) methods.add(method);
  }

  return [...methods];
};

describe('contract registry conformance', () => {
  it('matches every route method and path in app/api', () => {
    const routeFiles = fg.sync('app/api/**/route.ts', { absolute: false }).sort();

    const routeSet = new Set<string>();
    for (const routeFile of routeFiles) {
      const source = fs.readFileSync(routeFile, 'utf8');
      const routePath = toContractPath(routeFile);
      const methods = exportedMethodsForRoute(source);
      for (const method of methods) {
        routeSet.add(`${method} ${routePath}`);
      }
    }

    const registrySet = new Set(ALL_ENDPOINTS.map((endpoint) => `${endpoint.method} ${endpoint.path}`));

    const missingInRegistry = [...routeSet].filter((routeKey) => !registrySet.has(routeKey)).sort();
    const missingInRoutes = [...registrySet].filter((routeKey) => !routeSet.has(routeKey)).sort();

    expect(missingInRegistry, `Route handlers missing in registry: ${missingInRegistry.join(', ')}`).toEqual([]);
    expect(missingInRoutes, `Registry endpoints missing route handlers: ${missingInRoutes.join(', ')}`).toEqual([]);
  });
});

describe('route implementation guardrails', () => {
  it('forbids route-local z.object schemas across all API routes', () => {
    const files = fg.sync('app/api/**/route.ts', { absolute: false }).sort();
    const offenders: string[] = [];

    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8');
      if (source.includes('z.object(')) {
        offenders.push(file);
      }
    }

    expect(offenders, `Remove route-local z.object declarations from route files: ${offenders.join(', ')}`).toEqual([]);
  });

  it('forbids route helper plumbing in route files', () => {
    const files = fg.sync('app/api/**/route.ts', { absolute: false }).sort();
    const offenders: string[] = [];

    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8');
      if (/handleRouteError|parseOrThrow|parseRequestJson/.test(source)) {
        offenders.push(file);
      }
    }

    expect(offenders, `Route files must be thin contract exports only: ${offenders.join(', ')}`).toEqual([]);
  });

  it('forbids function-style route handlers; use bound const exports only', () => {
    const files = fg.sync('app/api/**/route.ts', { absolute: false }).sort();
    const offenders: string[] = [];

    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8');
      if (/export\s+(?:async\s+)?function\s+(GET|POST|PATCH|PUT|DELETE)\b/.test(source)) {
        offenders.push(file);
      }
    }

    expect(offenders, `Convert route handlers to bound const exports: ${offenders.join(', ')}`).toEqual([]);
  });
});

describe('client transport guardrails', () => {
  it('forbids raw fetch calls to /api outside contract client runtime', () => {
    const files = fg.sync('src/**/*.{ts,tsx}', { absolute: false }).sort();
    const offenders: string[] = [];
    const allowlist = new Set([
      path.normalize('src/contracts/runtime/client.ts').replace(/\\/g, '/')
    ]);

    for (const file of files) {
      const normalized = path.normalize(file).replace(/\\/g, '/');
      if (allowlist.has(normalized)) continue;

      const source = fs.readFileSync(file, 'utf8');
      if (/fetch\s*\(\s*['"`]\/api\//.test(source)) {
        offenders.push(file);
      }
    }

    expect(offenders, `Use contract client instead of raw /api fetch calls: ${offenders.join(', ')}`).toEqual([]);
  });
});

describe('contract boundary guardrails', () => {
  it('forbids compatibility schema alias file', () => {
    expect(fs.existsSync('src/api/schemas.ts')).toBe(false);
  });

  it('forbids compatibility schema alias imports', () => {
    const files = fg.sync('{src,app,test,docs}/**/*.{ts,tsx,md}', { absolute: false }).sort();
    const offenders: string[] = [];

    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8');
      if (
        /from\s+['"]@\/api\/schemas['"]/.test(source) ||
        /from\s+['"][^'"]*src\/api\/schemas['"]/.test(source)
      ) {
        offenders.push(file);
      }
    }

    expect(offenders, `Remove compatibility schema alias imports: ${offenders.join(', ')}`).toEqual([]);
  });

  it('forbids endpoint contracts importing request schemas from src/api', () => {
    const files = fg.sync('src/contracts/endpoints/**/*.ts', { absolute: false }).sort();
    const offenders: string[] = [];

    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8');
      if (/import\s+.+from\s+['"]@\/api\//.test(source) || /import\s+.+from\s+['"]\.\.\/\.\.\/api\//.test(source)) {
        offenders.push(file);
      }
    }

    expect(offenders, `Contracts must import request schemas from src/contracts only: ${offenders.join(', ')}`).toEqual([]);
  });
});

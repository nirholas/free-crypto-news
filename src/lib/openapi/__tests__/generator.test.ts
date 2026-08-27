/**
 * OpenAPI generator tests.
 *
 * The manifest generator used to drop every route with a `[param]` segment,
 * so /api/coin/{id}, /api/alerts/{id} and 37 other endpoints were missing from
 * /api/openapi.json, docs/API.md and llms-full.txt even though they shipped.
 * These tests lock the dynamic-route behaviour in place.
 */

import { describe, it, expect } from 'vitest';
import { generateOpenAPISpec } from '../generator';
import { ROUTE_MANIFEST } from '../routes.generated';

const spec = generateOpenAPISpec() as {
  paths: Record<string, Record<string, { parameters?: { name: string; in: string; required?: boolean }[] }>>;
};

describe('route manifest', () => {
  it('expresses dynamic segments in OpenAPI form, never Next.js form', () => {
    const nextStyle = ROUTE_MANIFEST.filter((r) => r.path.includes('['));
    expect(nextStyle).toEqual([]);
  });

  it('includes dynamic routes', () => {
    const dynamic = ROUTE_MANIFEST.filter((r) => r.path.includes('{'));
    expect(dynamic.length).toBeGreaterThan(20);
  });

  it('gives every route a category', () => {
    expect(ROUTE_MANIFEST.filter((r) => !r.category)).toEqual([]);
  });
});

describe('generateOpenAPISpec', () => {
  it('emits a path item for every manifest route that is not discovery-excluded', () => {
    const emitted = Object.keys(spec.paths);
    expect(emitted.length).toBeGreaterThan(300);
    expect(emitted.some((p) => p.includes('{'))).toBe(true);
  });

  it('declares a required path parameter for each {segment}', () => {
    for (const [path, item] of Object.entries(spec.paths)) {
      const expected = [...path.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
      if (expected.length === 0) continue;
      for (const operation of Object.values(item)) {
        if (typeof operation !== 'object' || operation === null) continue;
        const declared = (operation.parameters ?? [])
          .filter((p) => p.in === 'path')
          .map((p) => p.name);
        expect(declared, `${path} path parameters`).toEqual(expected);
        for (const p of operation.parameters ?? []) {
          if (p.in === 'path') expect(p.required).toBe(true);
        }
      }
    }
  });

  it('keeps query parameters alongside path parameters on GET', () => {
    const dynamicGet = Object.entries(spec.paths).find(
      ([path, item]) => path.includes('{') && item.get,
    );
    expect(dynamicGet).toBeDefined();
    const params = dynamicGet![1].get!.parameters ?? [];
    expect(params.some((p) => p.in === 'path')).toBe(true);
    expect(params.some((p) => p.in === 'query')).toBe(true);
  });
});

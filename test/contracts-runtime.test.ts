import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { defineEndpoint } from '../src/contracts/types';
import { bindRoute } from '../src/contracts/runtime/server';
import { buildPathWithQuery, decodeQuery, encodeQuery, interpolatePath } from '../src/contracts/runtime/codecs';
import { createContractClient } from '../src/contracts/runtime/client';

describe('contracts runtime codecs', () => {
  it('builds deterministic paths and query strings', () => {
    expect(interpolatePath('/api/items/:itemId/detail', { itemId: 'abc 123' })).toBe('/api/items/abc%20123/detail');
    expect(encodeQuery({ b: 2, a: 'one', skip: undefined, list: ['x', 'y'] })).toBe('a=one&b=2&list=x%2Cy');
    expect(buildPathWithQuery('/api/items/:itemId', { itemId: 'id' }, { q: 'hi', tags: ['one', 'two'] })).toBe(
      '/api/items/id?q=hi&tags=one%2Ctwo'
    );

    const decoded = decodeQuery(new URL('http://localhost/api/search?q=test&statuses=active%2Cdone'));
    expect(decoded).toEqual({ q: 'test', statuses: 'active,done' });
  });
});

describe('contracts runtime server binder', () => {
  const endpoint = defineEndpoint({
    id: 'test.echo',
    method: 'POST',
    path: '/api/test/:itemId',
    description: 'test endpoint',
    request: {
      params: z.object({ itemId: z.string().min(1) }),
      query: z.object({ mode: z.enum(['a', 'b']) }),
      body: z.object({ value: z.number().int() })
    },
    response: {
      kind: 'json',
      success: z.object({ itemId: z.string(), mode: z.string(), value: z.number() }),
      successStatus: 200
    }
  });

  const handler = bindRoute(endpoint, async ({ params, query, body }) => ({
    data: {
      itemId: params!.itemId,
      mode: query!.mode,
      value: body!.value
    }
  }));

  it('parses params/query/body through contract schemas', async () => {
    const response = await handler(
      new Request('http://localhost/api/test/123?mode=a', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ value: 42 })
      }),
      { params: Promise.resolve({ itemId: '123' }) }
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { ok: boolean; data?: { itemId: string; mode: string; value: number } };
    expect(payload.ok).toBe(true);
    expect(payload.data).toEqual({ itemId: '123', mode: 'a', value: 42 });
  });

  it('maps validation failures to route error envelopes', async () => {
    const response = await handler(
      new Request('http://localhost/api/test/123?mode=a', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ value: 'not-a-number' })
      }),
      { params: Promise.resolve({ itemId: '123' }) }
    );

    expect(response.status).toBe(400);
    const payload = (await response.json()) as { ok: false; error: { code: string } };
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('contracts runtime client binder', () => {
  const endpoint = defineEndpoint({
    id: 'test.client',
    method: 'POST',
    path: '/api/client/:itemId',
    description: 'client endpoint',
    request: {
      params: z.object({ itemId: z.string().min(1) }),
      query: z.object({ include: z.string().optional() }),
      body: z.object({ count: z.number() })
    },
    response: {
      kind: 'json',
      success: z.object({ accepted: z.literal(true) }),
      successStatus: 200
    }
  });

  it('serializes request and parses envelope success', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = createContractClient(
      { 'test.client': endpoint },
      async (url, init) => {
        calls.push({ url, init });
        return new Response(JSON.stringify({ ok: true, data: { accepted: true } }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
    );

    const result = await client.call('test.client', {
      params: { itemId: 'abc' },
      query: { include: 'all' },
      body: { count: 3 }
    });

    expect(result).toEqual({ accepted: true });
    expect(calls[0]?.url).toBe('/api/client/abc?include=all');
    expect(calls[0]?.init?.method).toBe('POST');
  });

  it('surfaces envelope errors', async () => {
    const client = createContractClient(
      { 'test.client': endpoint },
      async () =>
        new Response(JSON.stringify({ ok: true, data: { accepted: true } }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
    );

    await expect(
      client.call('test.client', {
        params: { itemId: '' },
        body: { count: 3 }
      })
    ).rejects.toThrow();
  });
});

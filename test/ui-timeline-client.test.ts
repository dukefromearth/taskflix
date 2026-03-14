import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../src/ui/api/client';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('timeline client abort handling', () => {
  it('threads AbortSignal through timeline summary requests', async () => {
    const fetchMock = vi.fn((_: string, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) {
          reject(new Error('missing signal'));
          return;
        }
        if (signal.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    const summaryPromise = api.getTimelineSummary(
      {
        zoom: 'day',
        windowStart: 1,
        windowEnd: 2,
        bucketStart: 1,
        bucketEnd: 2
      },
      { signal: controller.signal }
    );

    controller.abort();
    await expect(summaryPromise).rejects.toThrow(/aborted/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.signal).toBe(controller.signal);
  });

  it('threads AbortSignal through timeline structure requests', async () => {
    const fetchMock = vi.fn((_url: string, init?: RequestInit) =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            ok: true,
            data: {
              now: 1,
              timezone: 'UTC',
              zoom: 'week',
              mode: 'dual',
              windowStart: 0,
              windowEnd: 10,
              lanes: [],
              moments: []
            }
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        )
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    await api.getTimelineStructure(
      {
        zoom: 'week',
        mode: 'dual',
        windowStart: 0,
        windowEnd: 10
      },
      { signal: controller.signal }
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.signal).toBe(controller.signal);
  });
});

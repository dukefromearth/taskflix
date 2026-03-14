import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { GET as getProjectHandler } from '../app/api/projects/[projectId]/route';
import { POST as createProjectHandler } from '../app/api/projects/route';
import { GET as getItemHandler } from '../app/api/items/[itemId]/route';
import { POST as createItemHandler } from '../app/api/items/route';
import { POST as completeItemHandler } from '../app/api/items/[itemId]/complete/route';
import { GET as getViewHandler } from '../app/api/views/[name]/route';
import { GET as getTimelineStructureHandler } from '../app/api/timeline/structure/route';
import { GET as getTimelineSummaryHandler } from '../app/api/timeline/summary/route';
import { closeDatabaseRuntime } from '../src/db/client';

let tempDir: string | undefined;

afterEach(async () => {
  await closeDatabaseRuntime();
  delete process.env.DATABASE_URL;
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

const configureTestDatabase = (): void => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskio-api-test-'));
  process.env.DATABASE_URL = path.join(tempDir, 'taskio.sqlite');
};

const jsonBody = (value: unknown): string => JSON.stringify(value);

const parseEnvelope = async <T>(response: Response): Promise<{ ok: true; data: T } | { ok: false; error: unknown }> => {
  const payload = (await response.json()) as { ok: boolean; data?: T; error?: unknown };
  if (payload.ok) {
    return { ok: true, data: payload.data as T };
  }
  return { ok: false, error: payload.error };
};

const parseOk = async <T>(response: Response): Promise<T> => {
  const envelope = await parseEnvelope<T>(response);
  if (!envelope.ok) {
    throw new Error(`Expected ok envelope but got error: ${JSON.stringify(envelope.error)}`);
  }
  return envelope.data;
};

describe('API smoke (Next Route Handlers)', () => {
  it('creates and reads core resources with envelope responses', async () => {
    configureTestDatabase();

    const projectRes = await createProjectHandler(
      new Request('http://localhost/api/projects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ title: 'Workspace', slug: 'workspace' })
      })
    );
    expect(projectRes.status).toBe(201);
    const projectId = (await parseOk<{ id: string }>(projectRes)).id;

    const projectGetRes = await getProjectHandler(new Request(`http://localhost/api/projects/${projectId}`), {
      params: Promise.resolve({ projectId })
    });
    expect(projectGetRes.status).toBe(200);
    expect((await parseEnvelope(projectGetRes)).ok).toBe(true);

    const itemRes = await createItemHandler(
      new Request('http://localhost/api/items', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ title: 'Do it', projectId, status: 'inbox' })
      })
    );
    expect(itemRes.status).toBe(201);
    const itemId = (await parseOk<{ id: string }>(itemRes)).id;

    const itemGetRes = await getItemHandler(new Request(`http://localhost/api/items/${itemId}`), {
      params: Promise.resolve({ itemId })
    });
    expect(itemGetRes.status).toBe(200);
    expect((await parseEnvelope(itemGetRes)).ok).toBe(true);

    const todayRes = await getViewHandler(new Request('http://localhost/api/views/today'), {
      params: Promise.resolve({ name: 'today' })
    });
    expect(todayRes.status).toBe(200);
    const today = await parseOk<{ sections: Array<{ key: string; count: number }> }>(todayRes);
    expect(today.sections.some((section) => section.key === 'triage' && section.count === 1)).toBe(true);
  });

  it('supports idempotency-key for create and complete commands', async () => {
    configureTestDatabase();

    const projectA = await parseOk<{ id: string }>(
      await createProjectHandler(
        new Request('http://localhost/api/projects', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'idempotency-key': 'proj-1' },
          body: jsonBody({ title: 'Idempotent', slug: 'idempotent' })
        })
      )
    );

    const projectB = await parseOk<{ id: string }>(
      await createProjectHandler(
        new Request('http://localhost/api/projects', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'idempotency-key': 'proj-1' },
          body: jsonBody({ title: 'Idempotent Changed', slug: 'idempotent-2' })
        })
      )
    );

    expect(projectA.id).toBe(projectB.id);

    const itemId = (
      await parseOk<{ id: string }>(
        await createItemHandler(
          new Request('http://localhost/api/items', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: jsonBody({ title: 'Complete me', projectId: projectA.id, status: 'active' })
          })
        )
      )
    ).id;

    const completeA = await parseOk<{ completedAt: number }>(
      await completeItemHandler(
        new Request(`http://localhost/api/items/${itemId}/complete`, {
          method: 'POST',
          headers: { 'idempotency-key': 'complete-1' }
        }),
        { params: Promise.resolve({ itemId }) }
      )
    );

    const completeB = await parseOk<{ completedAt: number }>(
      await completeItemHandler(
        new Request(`http://localhost/api/items/${itemId}/complete`, {
          method: 'POST',
          headers: { 'idempotency-key': 'complete-1' }
        }),
        { params: Promise.resolve({ itemId }) }
      )
    );

    expect(completeA.completedAt).toBe(completeB.completedAt);
  });

  it('replays idempotent create response across restarts', async () => {
    configureTestDatabase();

    const projectIdA = (
      await parseOk<{ id: string }>(
        await createProjectHandler(
          new Request('http://localhost/api/projects', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'idempotency-key': 'restart-project' },
            body: jsonBody({ title: 'Restart Safe', slug: 'restart-safe' })
          })
        )
      )
    ).id;

    await closeDatabaseRuntime();

    const projectIdB = (
      await parseOk<{ id: string }>(
        await createProjectHandler(
          new Request('http://localhost/api/projects', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'idempotency-key': 'restart-project' },
            body: jsonBody({ title: 'Different Payload', slug: 'different-payload' })
          })
        )
      )
    ).id;

    expect(projectIdA).toBe(projectIdB);
  });

  it('serves split timeline routes with strict summary validation', async () => {
    configureTestDatabase();

    const project = await parseOk<{ id: string }>(
      await createProjectHandler(
        new Request('http://localhost/api/projects', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: jsonBody({ title: 'Timeline P', slug: 'timeline-p' })
        })
      )
    );

    await parseOk<{ id: string }>(
      await createItemHandler(
        new Request('http://localhost/api/items', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: jsonBody({
            title: 'Timeline Item',
            projectId: project.id,
            status: 'active',
            scheduledAt: Date.UTC(2026, 2, 14, 12, 0, 0, 0)
          })
        })
      )
    );

    const timelineStructureRes = await getTimelineStructureHandler(
      new Request(
        `http://localhost/api/timeline/structure?zoom=week&mode=dual&windowStart=${Date.UTC(
          2026,
          2,
          10
        )}&windowEnd=${Date.UTC(2026, 2, 20)}`
      )
    );
    expect(timelineStructureRes.status).toBe(200);
    const structure = await parseOk<{ lanes: Array<{ key: string; buckets: unknown[] }> }>(timelineStructureRes);
    expect(structure.lanes.some((lane) => lane.key === 'plan')).toBe(true);
    expect(structure.lanes.some((lane) => lane.key === 'reality')).toBe(true);

    const timelineSummaryRes = await getTimelineSummaryHandler(
      new Request(
        `http://localhost/api/timeline/summary?zoom=week&windowStart=${Date.UTC(
          2026,
          2,
          10
        )}&windowEnd=${Date.UTC(2026, 2, 20)}&playheadTs=${Date.UTC(2026, 2, 14)}`
      )
    );
    expect(timelineSummaryRes.status).toBe(200);
    const summary = await parseOk<{ counts: { plan: number }; bucketIdentity: string }>(timelineSummaryRes);
    expect(summary.counts.plan).toBeGreaterThanOrEqual(0);
    expect(summary.bucketIdentity.length).toBeGreaterThan(0);

    const invalidBucketRes = await getTimelineSummaryHandler(
      new Request(
        `http://localhost/api/timeline/summary?zoom=week&windowStart=${Date.UTC(
          2026,
          2,
          10
        )}&windowEnd=${Date.UTC(2026, 2, 20)}&bucketStart=${Date.UTC(2026, 2, 10) + 1}&bucketEnd=${
          Date.UTC(2026, 2, 11) + 1
        }`
      )
    );
    expect(invalidBucketRes.status).toBe(400);
    const invalidBucketEnvelope = await parseEnvelope<{ message: string; details?: unknown }>(invalidBucketRes);
    expect(invalidBucketEnvelope.ok).toBe(false);

    const modeRes = await getTimelineSummaryHandler(
      new Request(
        `http://localhost/api/timeline/summary?zoom=week&mode=dual&windowStart=${Date.UTC(2026, 2, 10)}&windowEnd=${Date.UTC(
          2026,
          2,
          20
        )}`
      )
    );
    expect(modeRes.status).toBe(400);

  });
});

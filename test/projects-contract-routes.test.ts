import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { GET as listProjectsHandler, POST as createProjectHandler } from '../app/api/projects/route';
import { GET as getProjectHandler, PATCH as patchProjectHandler, DELETE as deleteProjectHandler } from '../app/api/projects/[projectId]/route';
import { POST as reorderProjectsHandler } from '../app/api/projects/reorder/route';
import { closeDatabaseRuntime } from '../src/db/client';

let tempDir: string | undefined;

const jsonBody = (value: unknown): string => JSON.stringify(value);

const parseEnvelope = async <T>(response: Response): Promise<{ ok: true; data: T } | { ok: false; error: unknown }> => {
  const payload = (await response.json()) as { ok: boolean; data?: T; error?: unknown };
  if (payload.ok) return { ok: true, data: payload.data as T };
  return { ok: false, error: payload.error };
};

const parseOk = async <T>(response: Response): Promise<T> => {
  const envelope = await parseEnvelope<T>(response);
  if (!envelope.ok) {
    throw new Error(`Expected success envelope, got error: ${JSON.stringify(envelope.error)}`);
  }
  return envelope.data;
};

const configureTestEnvironment = (): void => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskio-projects-contract-db-'));
  process.env.DATABASE_URL = path.join(tempDir, 'taskio.sqlite');
};

afterEach(async () => {
  await closeDatabaseRuntime();
  delete process.env.DATABASE_URL;
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe('project contract routes parity', () => {
  it('supports project route lifecycle with preserved statuses', async () => {
    configureTestEnvironment();

    const projectA = await parseOk<{ id: string; title: string }>(
      await createProjectHandler(
        new Request('http://localhost/api/projects', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: jsonBody({ title: 'Project A', slug: 'project-a' })
        })
      )
    );

    const projectB = await parseOk<{ id: string; title: string }>(
      await createProjectHandler(
        new Request('http://localhost/api/projects', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: jsonBody({ title: 'Project B', slug: 'project-b' })
        })
      )
    );

    const listRes = await listProjectsHandler(new Request('http://localhost/api/projects?includeArchived=false'));
    expect(listRes.status).toBe(200);
    const list = await parseOk<Array<{ id: string }>>(listRes);
    expect(list.some((project) => project.id === projectA.id)).toBe(true);

    const getRes = await getProjectHandler(new Request(`http://localhost/api/projects/${projectA.id}`), {
      params: Promise.resolve({ projectId: projectA.id })
    });
    expect(getRes.status).toBe(200);

    const patchRes = await patchProjectHandler(
      new Request(`http://localhost/api/projects/${projectA.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ title: 'Project A Updated' })
      }),
      { params: Promise.resolve({ projectId: projectA.id }) }
    );
    expect(patchRes.status).toBe(200);

    const reorderRes = await reorderProjectsHandler(
      new Request('http://localhost/api/projects/reorder', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ projectId: projectB.id, leftProjectId: projectA.id })
      })
    );
    expect(reorderRes.status).toBe(200);

    const deleteRes = await deleteProjectHandler(
      new Request(`http://localhost/api/projects/${projectA.id}`, { method: 'DELETE' }),
      { params: Promise.resolve({ projectId: projectA.id }) }
    );
    expect(deleteRes.status).toBe(200);
    const deleted = await parseOk<{ id: string }>(deleteRes);
    expect(deleted.id).toBe(projectA.id);
  });

  it('enforces validation, not-found mapping, and create idempotency replay', async () => {
    configureTestEnvironment();

    const invalidCreateRes = await createProjectHandler(
      new Request('http://localhost/api/projects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({})
      })
    );
    expect(invalidCreateRes.status).toBe(400);
    const invalidPayload = (await invalidCreateRes.json()) as { ok: false; error: { code: string } };
    expect(invalidPayload.error.code).toBe('VALIDATION_ERROR');

    const notFoundRes = await getProjectHandler(new Request('http://localhost/api/projects/missing'), {
      params: Promise.resolve({ projectId: 'missing' })
    });
    expect(notFoundRes.status).toBe(404);
    const notFoundPayload = (await notFoundRes.json()) as { ok: false; error: { code: string } };
    expect(notFoundPayload.error.code).toBe('NOT_FOUND');

    const createA = await parseOk<{ id: string }>(
      await createProjectHandler(
        new Request('http://localhost/api/projects', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'idempotency-key': 'projects-create-1' },
          body: jsonBody({ title: 'Idempotent A', slug: 'idempotent-a' })
        })
      )
    );

    await closeDatabaseRuntime();

    const createB = await parseOk<{ id: string }>(
      await createProjectHandler(
        new Request('http://localhost/api/projects', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'idempotency-key': 'projects-create-1' },
          body: jsonBody({ title: 'Idempotent B', slug: 'idempotent-b' })
        })
      )
    );

    expect(createA.id).toBe(createB.id);
  });
});

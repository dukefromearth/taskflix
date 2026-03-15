import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { GET as listSavedViewsHandler, POST as createSavedViewHandler } from '../app/api/saved-views/route';
import { PATCH as patchSavedViewHandler, DELETE as deleteSavedViewHandler } from '../app/api/saved-views/[savedViewId]/route';
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
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskio-saved-views-contract-db-'));
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

describe('saved-views contract routes parity', () => {
  it('supports saved-views route lifecycle with preserved statuses', async () => {
    configureTestEnvironment();

    const createRes = await createSavedViewHandler(
      new Request('http://localhost/api/saved-views', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ name: 'Focus', icon: 'target', queryJson: { statuses: ['active'] } })
      })
    );
    expect(createRes.status).toBe(201);
    const created = await parseOk<{ id: string; name: string }>(createRes);
    expect(created.name).toBe('Focus');

    const listRes = await listSavedViewsHandler(new Request('http://localhost/api/saved-views'));
    expect(listRes.status).toBe(200);
    const list = await parseOk<Array<{ id: string }>>(listRes);
    expect(list.some((view) => view.id === created.id)).toBe(true);

    const patchRes = await patchSavedViewHandler(
      new Request(`http://localhost/api/saved-views/${created.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ name: 'Focused' })
      }),
      { params: Promise.resolve({ savedViewId: created.id }) }
    );
    expect(patchRes.status).toBe(200);
    const updated = await parseOk<{ name: string }>(patchRes);
    expect(updated.name).toBe('Focused');

    const deleteRes = await deleteSavedViewHandler(
      new Request(`http://localhost/api/saved-views/${created.id}`, { method: 'DELETE' }),
      { params: Promise.resolve({ savedViewId: created.id }) }
    );
    expect(deleteRes.status).toBe(200);
    expect(await parseOk<{ deleted: boolean }>(deleteRes)).toEqual({ deleted: true });
  });

  it('enforces validation and not-found mapping for saved-view routes', async () => {
    configureTestEnvironment();

    const invalidCreateRes = await createSavedViewHandler(
      new Request('http://localhost/api/saved-views', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({})
      })
    );
    expect(invalidCreateRes.status).toBe(400);
    const invalidPayload = (await invalidCreateRes.json()) as { ok: false; error: { code: string } };
    expect(invalidPayload.error.code).toBe('VALIDATION_ERROR');

    const notFoundPatchRes = await patchSavedViewHandler(
      new Request('http://localhost/api/saved-views/missing', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ name: 'Missing' })
      }),
      { params: Promise.resolve({ savedViewId: 'missing' }) }
    );
    expect(notFoundPatchRes.status).toBe(404);
    const patchPayload = (await notFoundPatchRes.json()) as { ok: false; error: { code: string } };
    expect(patchPayload.error.code).toBe('NOT_FOUND');

    const notFoundDeleteRes = await deleteSavedViewHandler(
      new Request('http://localhost/api/saved-views/missing', { method: 'DELETE' }),
      { params: Promise.resolve({ savedViewId: 'missing' }) }
    );
    expect(notFoundDeleteRes.status).toBe(404);
    const deletePayload = (await notFoundDeleteRes.json()) as { ok: false; error: { code: string } };
    expect(deletePayload.error.code).toBe('NOT_FOUND');
  });
});

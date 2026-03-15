import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { POST as createProjectHandler } from '../app/api/projects/route';
import { GET as listItemsHandler, POST as createItemHandler } from '../app/api/items/route';
import { POST as reorderItemsHandler } from '../app/api/items/reorder/route';
import { GET as getItemHandler, PATCH as patchItemHandler, DELETE as deleteItemHandler } from '../app/api/items/[itemId]/route';
import { GET as itemDetailHandler } from '../app/api/items/[itemId]/detail/route';
import { POST as completeItemHandler } from '../app/api/items/[itemId]/complete/route';
import { POST as deferItemHandler } from '../app/api/items/[itemId]/defer/route';
import { POST as scheduleItemHandler } from '../app/api/items/[itemId]/schedule/route';
import { POST as statusItemHandler } from '../app/api/items/[itemId]/status/route';
import { POST as tagsItemHandler } from '../app/api/items/[itemId]/tags/route';
import { POST as linksItemHandler } from '../app/api/items/[itemId]/links/route';
import { POST as attachmentsItemHandler } from '../app/api/items/[itemId]/attachments/route';
import { closeDatabaseRuntime } from '../src/db/client';

let tempDir: string | undefined;
let tempUploadDir: string | undefined;

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
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskio-items-contract-db-'));
  tempUploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskio-items-contract-upload-'));
  process.env.DATABASE_URL = path.join(tempDir, 'taskio.sqlite');
  process.env.UPLOAD_LOCAL_DIR = tempUploadDir;
};

afterEach(async () => {
  await closeDatabaseRuntime();
  delete process.env.DATABASE_URL;
  delete process.env.UPLOAD_LOCAL_DIR;
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
  if (tempUploadDir) {
    fs.rmSync(tempUploadDir, { recursive: true, force: true });
    tempUploadDir = undefined;
  }
});

describe('item contract routes parity', () => {
  it('supports item route lifecycle with preserved statuses', async () => {
    configureTestEnvironment();

    const projectId = (
      await parseOk<{ id: string }>(
        await createProjectHandler(
          new Request('http://localhost/api/projects', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: jsonBody({ title: 'Items', slug: 'items' })
          })
        )
      )
    ).id;

    const itemA = await parseOk<{ id: string }>(
      await createItemHandler(
        new Request('http://localhost/api/items', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: jsonBody({ title: 'Item A', projectId, status: 'inbox' })
        })
      )
    );

    const itemB = await parseOk<{ id: string }>(
      await createItemHandler(
        new Request('http://localhost/api/items', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: jsonBody({ title: 'Item B', projectId, status: 'active' })
        })
      )
    );

    const listRes = await listItemsHandler(new Request('http://localhost/api/items'));
    expect(listRes.status).toBe(200);
    const listItems = await parseOk<Array<{ id: string }>>(listRes);
    expect(listItems.some((item) => item.id === itemA.id)).toBe(true);

    const getRes = await getItemHandler(new Request(`http://localhost/api/items/${itemA.id}`), {
      params: Promise.resolve({ itemId: itemA.id })
    });
    expect(getRes.status).toBe(200);

    const patchRes = await patchItemHandler(
      new Request(`http://localhost/api/items/${itemA.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ title: 'Item A Updated' })
      }),
      { params: Promise.resolve({ itemId: itemA.id }) }
    );
    expect(patchRes.status).toBe(200);

    const statusRes = await statusItemHandler(
      new Request(`http://localhost/api/items/${itemA.id}/status`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ to: 'active', reason: 'doing now' })
      }),
      { params: Promise.resolve({ itemId: itemA.id }) }
    );
    expect(statusRes.status).toBe(200);

    const scheduleRes = await scheduleItemHandler(
      new Request(`http://localhost/api/items/${itemA.id}/schedule`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ scheduledAt: Date.now() + 1000, dueAt: Date.now() + 2000 })
      }),
      { params: Promise.resolve({ itemId: itemA.id }) }
    );
    expect(scheduleRes.status).toBe(200);

    const deferRes = await deferItemHandler(
      new Request(`http://localhost/api/items/${itemA.id}/defer`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ snoozedUntil: Date.now() + 5000 })
      }),
      { params: Promise.resolve({ itemId: itemA.id }) }
    );
    expect(deferRes.status).toBe(200);

    const tagsRes = await tagsItemHandler(
      new Request(`http://localhost/api/items/${itemA.id}/tags`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ add: ['work'], remove: [] })
      }),
      { params: Promise.resolve({ itemId: itemA.id }) }
    );
    expect(tagsRes.status).toBe(200);

    const linksRes = await linksItemHandler(
      new Request(`http://localhost/api/items/${itemA.id}/links`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ url: 'https://example.com', label: 'Example', kind: 'generic' })
      }),
      { params: Promise.resolve({ itemId: itemA.id }) }
    );
    expect(linksRes.status).toBe(201);

    const attachmentsRes = await attachmentsItemHandler(
      new Request(`http://localhost/api/items/${itemA.id}/attachments`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({
          originalName: 'note.txt',
          mimeType: 'text/plain',
          contentBase64: Buffer.from('hello world').toString('base64')
        })
      }),
      { params: Promise.resolve({ itemId: itemA.id }) }
    );
    expect(attachmentsRes.status).toBe(201);

    const detailRes = await itemDetailHandler(new Request(`http://localhost/api/items/${itemA.id}/detail`), {
      params: Promise.resolve({ itemId: itemA.id })
    });
    expect(detailRes.status).toBe(200);

    const reorderRes = await reorderItemsHandler(
      new Request('http://localhost/api/items/reorder', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({ itemId: itemB.id, leftItemId: itemA.id })
      })
    );
    expect(reorderRes.status).toBe(200);

    const completeRes = await completeItemHandler(
      new Request(`http://localhost/api/items/${itemA.id}/complete`, {
        method: 'POST'
      }),
      { params: Promise.resolve({ itemId: itemA.id }) }
    );
    expect(completeRes.status).toBe(200);

    const deleteRes = await deleteItemHandler(new Request(`http://localhost/api/items/${itemB.id}`, { method: 'DELETE' }), {
      params: Promise.resolve({ itemId: itemB.id })
    });
    expect(deleteRes.status).toBe(200);
    expect(await parseOk<{ deleted: boolean }>(deleteRes)).toEqual({ deleted: true });
  });

  it('enforces validation, domain mapping, and idempotency on bound item routes', async () => {
    configureTestEnvironment();

    const invalidCreateRes = await createItemHandler(
      new Request('http://localhost/api/items', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: jsonBody({})
      })
    );
    expect(invalidCreateRes.status).toBe(400);
    const invalidPayload = (await invalidCreateRes.json()) as { ok: false; error: { code: string } };
    expect(invalidPayload.error.code).toBe('VALIDATION_ERROR');

    const notFoundRes = await getItemHandler(new Request('http://localhost/api/items/missing'), {
      params: Promise.resolve({ itemId: 'missing' })
    });
    expect(notFoundRes.status).toBe(404);
    const notFoundPayload = (await notFoundRes.json()) as { ok: false; error: { code: string } };
    expect(notFoundPayload.error.code).toBe('NOT_FOUND');

    const projectId = (
      await parseOk<{ id: string }>(
        await createProjectHandler(
          new Request('http://localhost/api/projects', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: jsonBody({ title: 'Idempotent', slug: 'idempotent-items' })
          })
        )
      )
    ).id;

    const createA = await parseOk<{ id: string }>(
      await createItemHandler(
        new Request('http://localhost/api/items', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'idempotency-key': 'items-create-1' },
          body: jsonBody({ title: 'First', projectId, status: 'active' })
        })
      )
    );

    const createB = await parseOk<{ id: string }>(
      await createItemHandler(
        new Request('http://localhost/api/items', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'idempotency-key': 'items-create-1' },
          body: jsonBody({ title: 'Second', projectId, status: 'inbox' })
        })
      )
    );

    expect(createA.id).toBe(createB.id);

    const completeA = await parseOk<{ completedAt: number }>(
      await completeItemHandler(
        new Request(`http://localhost/api/items/${createA.id}/complete`, {
          method: 'POST',
          headers: { 'idempotency-key': 'items-complete-1' }
        }),
        { params: Promise.resolve({ itemId: createA.id }) }
      )
    );

    const completeB = await parseOk<{ completedAt: number }>(
      await completeItemHandler(
        new Request(`http://localhost/api/items/${createA.id}/complete`, {
          method: 'POST',
          headers: { 'idempotency-key': 'items-complete-1' }
        }),
        { params: Promise.resolve({ itemId: createA.id }) }
      )
    );

    expect(completeA.completedAt).toBe(completeB.completedAt);

    const attachmentA = await parseOk<{ id: string }>(
      await attachmentsItemHandler(
        new Request(`http://localhost/api/items/${createA.id}/attachments`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'idempotency-key': 'attachment-upload-1' },
          body: jsonBody({
            originalName: 'idempotent.txt',
            mimeType: 'text/plain',
            contentBase64: Buffer.from('first').toString('base64')
          })
        }),
        { params: Promise.resolve({ itemId: createA.id }) }
      )
    );

    const attachmentB = await parseOk<{ id: string }>(
      await attachmentsItemHandler(
        new Request(`http://localhost/api/items/${createA.id}/attachments`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'idempotency-key': 'attachment-upload-1' },
          body: jsonBody({
            originalName: 'different.txt',
            mimeType: 'text/plain',
            contentBase64: Buffer.from('second').toString('base64')
          })
        }),
        { params: Promise.resolve({ itemId: createA.id }) }
      )
    );

    expect(attachmentA.id).toBe(attachmentB.id);
  });
});

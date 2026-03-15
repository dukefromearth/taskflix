import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { GET as getHealthHandler } from '../app/api/health/route';
import { GET as searchHandler } from '../app/api/search/route';
import { GET as timelineStructureHandler } from '../app/api/timeline/structure/route';
import { GET as timelineSummaryHandler } from '../app/api/timeline/summary/route';
import { GET as getViewHandler } from '../app/api/views/[name]/route';
import { POST as createProjectHandler } from '../app/api/projects/route';
import { POST as createItemHandler } from '../app/api/items/route';
import { POST as uploadAttachmentHandler } from '../app/api/items/[itemId]/attachments/route';
import { GET as getAttachmentHandler, DELETE as deleteAttachmentHandler } from '../app/api/attachments/[attachmentId]/route';
import { GET as downloadAttachmentHandler } from '../app/api/attachments/[attachmentId]/download/route';
import { GET as getFileHandler } from '../app/api/files/[key]/route';
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
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskio-remaining-contract-db-'));
  tempUploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskio-remaining-contract-upload-'));
  process.env.DATABASE_URL = path.join(tempDir, 'taskio.sqlite');
  process.env.UPLOAD_LOCAL_DIR = tempUploadDir;
  process.env.APP_BASE_URL = 'http://localhost:3000';
};

afterEach(async () => {
  await closeDatabaseRuntime();
  delete process.env.DATABASE_URL;
  delete process.env.UPLOAD_LOCAL_DIR;
  delete process.env.APP_BASE_URL;

  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }

  if (tempUploadDir) {
    fs.rmSync(tempUploadDir, { recursive: true, force: true });
    tempUploadDir = undefined;
  }
});

describe('remaining route parity for full contract cutover', () => {
  it('preserves health, search, timeline, and views semantics', async () => {
    configureTestEnvironment();

    const healthRes = await getHealthHandler(new Request('http://localhost/api/health'));
    expect(healthRes.status).toBe(200);
    expect(await parseOk<{ ok: true }>(healthRes)).toEqual({ ok: true });

    const project = await parseOk<{ id: string }>(
      await createProjectHandler(
        new Request('http://localhost/api/projects', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: jsonBody({ title: 'Views', slug: 'views' })
        })
      )
    );

    await parseOk<{ id: string }>(
      await createItemHandler(
        new Request('http://localhost/api/items', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: jsonBody({
            title: 'Searchable Timeline Item',
            projectId: project.id,
            status: 'active',
            scheduledAt: Date.UTC(2026, 2, 14, 11, 0, 0, 0)
          })
        })
      )
    );

    const searchRes = await searchHandler(
      new Request('http://localhost/api/search?q=searchable&statuses=active&includeDone=true')
    );
    expect(searchRes.status).toBe(200);
    const searchData = await parseOk<Array<{ item: { title: string } }>>(searchRes);
    expect(searchData.some((row) => row.item.title.includes('Searchable'))).toBe(true);

    const invalidSearchRes = await searchHandler(new Request('http://localhost/api/search?includeDone=maybe'));
    expect(invalidSearchRes.status).toBe(400);
    const invalidSearchPayload = (await invalidSearchRes.json()) as { ok: false; error: { code: string } };
    expect(invalidSearchPayload.error.code).toBe('VALIDATION_ERROR');

    const structureRes = await timelineStructureHandler(
      new Request(
        `http://localhost/api/timeline/structure?zoom=week&mode=dual&windowStart=${Date.UTC(
          2026,
          2,
          10
        )}&windowEnd=${Date.UTC(2026, 2, 20)}`
      )
    );
    expect(structureRes.status).toBe(200);
    const structure = await parseOk<{ lanes: Array<{ key: string }> }>(structureRes);
    expect(structure.lanes.some((lane) => lane.key === 'plan')).toBe(true);

    const summaryRes = await timelineSummaryHandler(
      new Request(
        `http://localhost/api/timeline/summary?zoom=week&windowStart=${Date.UTC(
          2026,
          2,
          10
        )}&windowEnd=${Date.UTC(2026, 2, 20)}&playheadTs=${Date.UTC(2026, 2, 14)}`
      )
    );
    expect(summaryRes.status).toBe(200);
    const summary = await parseOk<{ bucketIdentity: string }>(summaryRes);
    expect(summary.bucketIdentity.length).toBeGreaterThan(0);

    const invalidSummaryRes = await timelineSummaryHandler(
      new Request(
        `http://localhost/api/timeline/summary?zoom=week&mode=dual&windowStart=${Date.UTC(2026, 2, 10)}&windowEnd=${Date.UTC(
          2026,
          2,
          20
        )}`
      )
    );
    expect(invalidSummaryRes.status).toBe(400);
    const invalidSummaryPayload = (await invalidSummaryRes.json()) as { ok: false; error: { code: string } };
    expect(invalidSummaryPayload.error.code).toBe('VALIDATION_ERROR');

    const todayRes = await getViewHandler(new Request('http://localhost/api/views/today'), {
      params: Promise.resolve({ name: 'today' })
    });
    expect(todayRes.status).toBe(200);
    const todayData = await parseOk<{ sections: Array<{ key: string }> }>(todayRes);
    expect(todayData.sections.length).toBeGreaterThan(0);

    const missingProjectViewRes = await getViewHandler(new Request('http://localhost/api/views/project'), {
      params: Promise.resolve({ name: 'project' })
    });
    expect(missingProjectViewRes.status).toBe(400);
    expect(await missingProjectViewRes.json()).toEqual({
      ok: true,
      data: {
        ok: false,
        error: 'projectId query is required for project view'
      }
    });

    const notFoundProjectViewRes = await getViewHandler(new Request('http://localhost/api/views/project?projectId=missing'), {
      params: Promise.resolve({ name: 'project' })
    });
    expect(notFoundProjectViewRes.status).toBe(404);
    const notFoundProjectPayload = (await notFoundProjectViewRes.json()) as { ok: false; error: { code: string } };
    expect(notFoundProjectPayload.error.code).toBe('NOT_FOUND');
  });

  it('preserves attachments and files semantics including redirect and binary responses', async () => {
    configureTestEnvironment();

    const project = await parseOk<{ id: string }>(
      await createProjectHandler(
        new Request('http://localhost/api/projects', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: jsonBody({ title: 'Attachments', slug: 'attachments' })
        })
      )
    );

    const item = await parseOk<{ id: string }>(
      await createItemHandler(
        new Request('http://localhost/api/items', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: jsonBody({ title: 'Attachment Item', projectId: project.id, status: 'active' })
        })
      )
    );

    const uploaded = await parseOk<{ id: string }>(
      await uploadAttachmentHandler(
        new Request(`http://localhost/api/items/${item.id}/attachments`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: jsonBody({
            originalName: 'note.txt',
            mimeType: 'text/plain',
            contentBase64: Buffer.from('hello attachment').toString('base64')
          })
        }),
        { params: Promise.resolve({ itemId: item.id }) }
      )
    );

    const attachmentRes = await getAttachmentHandler(new Request(`http://localhost/api/attachments/${uploaded.id}`), {
      params: Promise.resolve({ attachmentId: uploaded.id })
    });
    expect(attachmentRes.status).toBe(200);
    const attachment = await parseOk<{ id: string; readUrl: string }>(attachmentRes);
    expect(attachment.id).toBe(uploaded.id);
    expect(attachment.readUrl.includes('/api/files/')).toBe(true);

    const downloadRes = await downloadAttachmentHandler(new Request(`http://localhost/api/attachments/${uploaded.id}/download`), {
      params: Promise.resolve({ attachmentId: uploaded.id })
    });
    expect(downloadRes.status).toBe(307);
    expect(downloadRes.headers.get('location')).toBe(attachment.readUrl);

    const downloadUrl = new URL(attachment.readUrl);
    const encodedKey = downloadUrl.pathname.replace('/api/files/', '');
    const fileRes = await getFileHandler(new Request(`http://localhost${downloadUrl.pathname}`), {
      params: Promise.resolve({ key: encodedKey })
    });
    expect(fileRes.status).toBe(200);
    expect(fileRes.headers.get('content-type')).toBe('application/octet-stream');
    expect(await fileRes.text()).toBe('hello attachment');

    const invalidKeyRes = await getFileHandler(new Request('http://localhost/api/files/../bad'), {
      params: Promise.resolve({ key: '../bad' })
    });
    expect(invalidKeyRes.status).toBe(400);
    expect(await invalidKeyRes.json()).toEqual({
      ok: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid file key'
      }
    });

    const deleteRes = await deleteAttachmentHandler(new Request(`http://localhost/api/attachments/${uploaded.id}`, { method: 'DELETE' }), {
      params: Promise.resolve({ attachmentId: uploaded.id })
    });
    expect(deleteRes.status).toBe(200);
    expect(await parseOk<{ deleted: boolean }>(deleteRes)).toEqual({ deleted: true });

    const notFoundRes = await getAttachmentHandler(new Request(`http://localhost/api/attachments/${uploaded.id}`), {
      params: Promise.resolve({ attachmentId: uploaded.id })
    });
    expect(notFoundRes.status).toBe(404);
    const notFoundPayload = (await notFoundRes.json()) as { ok: false; error: { code: string } };
    expect(notFoundPayload.error.code).toBe('NOT_FOUND');
  });
});

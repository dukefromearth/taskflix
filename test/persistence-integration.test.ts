import { afterEach, describe, expect, it } from 'vitest';
import { TaskioService } from '../src/domain/taskio-service';
import { createTestDb, type TestDb } from './test-db';
import { SearchRepository } from '../src/repositories/search-repository';

let activeDb: TestDb | undefined;

afterEach(async () => {
  if (activeDb) {
    await activeDb.close();
    activeDb = undefined;
  }
});

const createService = (): TaskioService => {
  activeDb = createTestDb();
  return new TaskioService({ db: activeDb.runtime.db, timezone: 'UTC' });
};

describe('sqlite persistence integration', () => {
  it('persists project/item CRUD + archive + reorder + status transitions', async () => {
    const service = createService();

    const p1 = await service.createProject({ title: 'Alpha', slug: 'alpha' });
    const p2 = await service.createProject({ title: 'Beta', slug: 'beta' });

    const reorderedProject = await service.reorderProjects({
      projectId: p2.id,
      rightProjectId: p1.id
    });
    expect(reorderedProject.orderKey < p1.orderKey).toBe(true);

    const item = await service.createItem({ title: 'Task', projectId: p1.id, status: 'inbox' });
    const active = await service.changeItemStatus(item.id, 'active');
    const done = await service.changeItemStatus(item.id, 'done');
    expect(done.completedAt).toBeDefined();

    const reopened = await service.changeItemStatus(item.id, 'active');
    expect(reopened.completedAt).toBeUndefined();

    const archived = await service.deleteProject(p1.id);
    expect(archived.status).toBe('archived');

    const allProjects = await service.listProjects({ includeArchived: true });
    expect(allProjects.some((p) => p.id === p1.id && p.status === 'archived')).toBe(true);
    expect(active.status).toBe('active');
  });

  it('maintains FTS index on mutations and supports rebuild', async () => {
    const service = createService();
    const project = await service.createProject({ title: 'SearchHub', slug: 'searchhub' });
    const item = await service.createItem({ title: 'Design gateway', descriptionMd: 'API policy', projectId: project.id });
    await service.addTagToItem(item.id, 'theme/api');

    const attachment = await service.addAttachment({
      itemId: item.id,
      storageKey: 'a',
      originalName: 'a.txt',
      mimeType: 'text/plain',
      sizeBytes: 10,
      sha256: 'x'
    });
    await service.setAttachmentContent(attachment.id, 'contains roadmap milestone words');

    const hits = await service.search('roadmap');
    expect(hits[0]?.item.id).toBe(item.id);

    const repo = new SearchRepository(activeDb!.runtime.db);
    await activeDb!.runtime.db.deleteFrom('items_fts').execute();
    expect((await service.search('roadmap')).length).toBe(0);

    await repo.rebuildAll();
    expect((await service.search('roadmap'))[0]?.item.id).toBe(item.id);
  });

  it('writes and reads history timeline from persisted events', async () => {
    const service = createService();
    const item = await service.createItem({ title: 'History task', status: 'inbox' });
    await service.changeItemStatus(item.id, 'active');
    await service.changeItemStatus(item.id, 'done');

    const history = await service.getHistoryView();
    expect(history.events.length).toBeGreaterThanOrEqual(3);
    expect(history.events[0]?.itemId).toBe(item.id);
  });
});

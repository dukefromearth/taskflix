import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createDatabaseRuntime } from '../src/db/client';
import { migrateDown, migrateUp, migrationStatus } from '../src/db/migrations';

let tmpDir: string | undefined;

afterEach(() => {
  if (tmpDir) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    tmpDir = undefined;
  }
});

const createRuntime = () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskio-migrate-test-'));
  const dbPath = path.join(tmpDir, 'taskio.sqlite');
  return createDatabaseRuntime(dbPath);
};

describe('migrations', () => {
  it('applies migrations on fresh database and has expected schema objects', async () => {
    const runtime = createRuntime();
    const applied = migrateUp(runtime.sqlite);
    expect(applied.length).toBeGreaterThan(0);

    const tables = runtime.sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' OR type='view' ORDER BY name")
      .all() as Array<{ name: string }>;
    const names = new Set(tables.map((row) => row.name));

    for (const table of [
      'projects',
      'items',
      'tags',
      'item_tags',
      'item_links',
      'attachments',
      'attachment_contents',
      'item_events',
      'saved_views',
      'user_preferences',
      'items_fts',
      'idempotency_keys',
      'schema_migrations'
    ]) {
      expect(names.has(table)).toBe(true);
    }

    const indexes = runtime.sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name")
      .all() as Array<{ name: string }>;
    const indexNames = new Set(indexes.map((row) => row.name));

    for (const indexName of [
      'idx_projects_status',
      'idx_items_project_parent_order',
      'idx_item_events_item_id_occurred_at',
      'idx_attachments_item_id',
      'idx_idempotency_created_at'
    ]) {
      expect(indexNames.has(indexName)).toBe(true);
    }

    await runtime.db.destroy();
    runtime.sqlite.close();
  });

  it('supports down/up cycle for latest migration', async () => {
    const runtime = createRuntime();
    migrateUp(runtime.sqlite);

    const rolledBack = migrateDown(runtime.sqlite, undefined, 1);
    expect(rolledBack.length).toBe(1);

    const statusAfterDown = migrationStatus(runtime.sqlite);
    expect(statusAfterDown.some((row) => row.applied === false)).toBe(true);

    const appliedAgain = migrateUp(runtime.sqlite);
    expect(appliedAgain.length).toBe(1);

    const statusAfterUp = migrationStatus(runtime.sqlite);
    expect(statusAfterUp.every((row) => row.applied)).toBe(true);

    await runtime.db.destroy();
    runtime.sqlite.close();
  });
});

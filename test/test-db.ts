import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createDatabaseRuntime, type DatabaseRuntime } from '../src/db/client';
import { migrateUp } from '../src/db/migrations';

export type TestDb = {
  runtime: DatabaseRuntime;
  path: string;
  close: () => Promise<void>;
};

export const createTestDb = (): TestDb => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskio-test-'));
  const dbPath = path.join(tmpDir, 'taskio.sqlite');
  const runtime = createDatabaseRuntime(dbPath);
  migrateUp(runtime.sqlite);

  return {
    runtime,
    path: dbPath,
    close: async () => {
      await runtime.db.destroy();
      runtime.sqlite.close();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  };
};

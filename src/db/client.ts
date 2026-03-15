import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import type { DatabaseSchema } from './schema';

export type DatabaseRuntime = {
  db: Kysely<DatabaseSchema>;
  sqlite: Database.Database;
  databasePath: string;
};

let runtime: DatabaseRuntime | undefined;

export const resolveDatabasePath = (): string => process.env.DATABASE_URL ?? path.join(process.cwd(), 'taskio.db');

const applyPragmas = (sqlite: Database.Database): void => {
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('synchronous = NORMAL');
};

export const createDatabaseRuntime = (databasePath = resolveDatabasePath()): DatabaseRuntime => {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const sqlite = new Database(databasePath);
  applyPragmas(sqlite);

  const db = new Kysely<DatabaseSchema>({
    dialect: new SqliteDialect({ database: sqlite })
  });

  return {
    db,
    sqlite,
    databasePath
  };
};

export const getDatabaseRuntime = (): DatabaseRuntime => {
  if (!runtime) {
    runtime = createDatabaseRuntime();
  }

  return runtime;
};

export const closeDatabaseRuntime = async (): Promise<void> => {
  if (!runtime) return;
  await runtime.db.destroy();
  runtime.sqlite.close();
  runtime = undefined;
};

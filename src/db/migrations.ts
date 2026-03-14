import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';

export type MigrationStatusRow = {
  name: string;
  applied: boolean;
  appliedAt: number | null;
};

export type MigrationPair = {
  name: string;
  upPath: string;
  downPath: string;
};

export const defaultMigrationDir = path.join(process.cwd(), 'migrations');

const ensureMigrationsTable = (sqlite: Database.Database): void => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);
};

const loadMigrationPairs = (migrationDir = defaultMigrationDir): MigrationPair[] => {
  const entries = fs.readdirSync(migrationDir).filter((file) => file.endsWith('.sql'));
  const grouped = new Map<string, { up?: string; down?: string }>();

  for (const file of entries) {
    const match = file.match(/^(\d+_[\w-]+)\.(up|down)\.sql$/);
    if (!match) continue;
    const name = match[1];
    const direction = match[2];
    if (!name || (direction !== 'up' && direction !== 'down')) {
      continue;
    }
    const group = grouped.get(name) ?? {};
    group[direction] = path.join(migrationDir, file);
    grouped.set(name, group);
  }

  return [...grouped.entries()]
    .map(([name, value]) => {
      if (!value.up || !value.down) {
        throw new Error(`Migration ${name} must have both .up.sql and .down.sql`);
      }
      return {
        name,
        upPath: value.up,
        downPath: value.down
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getAppliedMigrations = (sqlite: Database.Database): Array<{ name: string; appliedAt: number }> => {
  ensureMigrationsTable(sqlite);
  const rows = sqlite
    .prepare('SELECT name, applied_at as appliedAt FROM schema_migrations ORDER BY name ASC')
    .all() as Array<{ name: string; appliedAt: number }>;
  return rows;
};

export const migrateUp = (sqlite: Database.Database, migrationDir = defaultMigrationDir): string[] => {
  ensureMigrationsTable(sqlite);
  const applied = new Set(getAppliedMigrations(sqlite).map((row) => row.name));
  const pairs = loadMigrationPairs(migrationDir);
  const appliedNow: string[] = [];

  for (const pair of pairs) {
    if (applied.has(pair.name)) continue;

    const upSql = fs.readFileSync(pair.upPath, 'utf8');
    const tx = sqlite.transaction(() => {
      sqlite.exec(upSql);
      sqlite
        .prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)')
        .run(pair.name, Date.now());
    });
    tx();
    appliedNow.push(pair.name);
  }

  return appliedNow;
};

export const migrateDown = (sqlite: Database.Database, migrationDir = defaultMigrationDir, steps = 1): string[] => {
  ensureMigrationsTable(sqlite);
  const applied = getAppliedMigrations(sqlite);
  if (applied.length === 0 || steps <= 0) return [];

  const pairs = loadMigrationPairs(migrationDir);
  const pairByName = new Map(pairs.map((pair) => [pair.name, pair]));
  const targets = applied.slice(-steps).reverse();
  const rolledBack: string[] = [];

  for (const target of targets) {
    const pair = pairByName.get(target.name);
    if (!pair) {
      throw new Error(`Missing migration files for applied migration ${target.name}`);
    }

    const downSql = fs.readFileSync(pair.downPath, 'utf8');
    const tx = sqlite.transaction(() => {
      sqlite.exec(downSql);
      sqlite.prepare('DELETE FROM schema_migrations WHERE name = ?').run(target.name);
    });
    tx();
    rolledBack.push(target.name);
  }

  return rolledBack;
};

export const migrationStatus = (sqlite: Database.Database, migrationDir = defaultMigrationDir): MigrationStatusRow[] => {
  ensureMigrationsTable(sqlite);
  const applied = new Map(getAppliedMigrations(sqlite).map((row) => [row.name, row.appliedAt]));
  const pairs = loadMigrationPairs(migrationDir);

  return pairs.map((pair) => ({
    name: pair.name,
    applied: applied.has(pair.name),
    appliedAt: applied.get(pair.name) ?? null
  }));
};

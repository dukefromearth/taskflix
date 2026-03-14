import { getDatabaseRuntime, closeDatabaseRuntime } from '../src/db/client';
import { migrateUp } from '../src/db/migrations';
import { SearchRepository } from '../src/repositories/search-repository';

const main = async (): Promise<void> => {
  const runtime = getDatabaseRuntime();

  try {
    migrateUp(runtime.sqlite);
    const repo = new SearchRepository(runtime.db);
    await repo.rebuildAll();
    console.log('FTS index rebuilt.');
  } finally {
    await closeDatabaseRuntime();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

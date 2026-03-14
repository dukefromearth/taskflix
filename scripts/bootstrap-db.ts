import { getDatabaseRuntime, closeDatabaseRuntime } from '../src/db/client';
import { migrateUp } from '../src/db/migrations';

const main = async (): Promise<void> => {
  const runtime = getDatabaseRuntime();

  try {
    const applied = migrateUp(runtime.sqlite);
    if (applied.length === 0) {
      console.log('Database schema already up to date.');
    } else {
      console.log(`Bootstrap applied migrations: ${applied.join(', ')}`);
    }
  } finally {
    await closeDatabaseRuntime();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

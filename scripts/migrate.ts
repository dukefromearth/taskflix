import { getDatabaseRuntime, closeDatabaseRuntime } from '../src/db/client';
import { migrateDown, migrateUp, migrationStatus } from '../src/db/migrations';

const main = async (): Promise<void> => {
  const command = process.argv[2] ?? 'status';
  const runtime = getDatabaseRuntime();

  try {
    if (command === 'up') {
      const applied = migrateUp(runtime.sqlite);
      if (applied.length === 0) {
        console.log('No pending migrations.');
      } else {
        console.log(`Applied migrations: ${applied.join(', ')}`);
      }
      return;
    }

    if (command === 'down') {
      const steps = Number(process.argv[3] ?? 1);
      const rolledBack = migrateDown(runtime.sqlite, undefined, steps);
      if (rolledBack.length === 0) {
        console.log('No migrations rolled back.');
      } else {
        console.log(`Rolled back migrations: ${rolledBack.join(', ')}`);
      }
      return;
    }

    if (command === 'status') {
      const rows = migrationStatus(runtime.sqlite);
      for (const row of rows) {
        console.log(`${row.applied ? '[x]' : '[ ]'} ${row.name}${row.appliedAt ? ` @ ${row.appliedAt}` : ''}`);
      }
      return;
    }

    throw new Error(`Unknown migrate command: ${command}. Use up|down|status.`);
  } finally {
    await closeDatabaseRuntime();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

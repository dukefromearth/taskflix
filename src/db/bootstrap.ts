import { getDatabaseRuntime } from './client';
import { migrateUp } from './migrations';

let readyPromise: Promise<void> | undefined;
let readyDatabasePath: string | undefined;

export const ensureDatabaseReady = async (): Promise<void> => {
  const runtime = getDatabaseRuntime();
  if (!readyPromise || readyDatabasePath !== runtime.databasePath) {
    readyDatabasePath = runtime.databasePath;
    readyPromise = (async () => {
      migrateUp(runtime.sqlite);
    })();
  }

  return readyPromise;
};

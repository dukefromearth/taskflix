import fs from 'node:fs';
import path from 'node:path';

const integrationDbPath = path.resolve(process.cwd(), 'tmp/integration/taskio.integration.sqlite');

const resetIntegrationDb = (dbPath: string): void => {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  for (const suffix of ['', '-shm', '-wal']) {
    const filePath = `${dbPath}${suffix}`;
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { force: true });
    }
  }
};

resetIntegrationDb(integrationDbPath);
console.log(`Integration DB reset: ${integrationDbPath}`);

import path from 'node:path';
import { defineConfig } from '@playwright/test';

const integrationDbPath = path.resolve(process.cwd(), 'tmp/integration/taskio.integration.sqlite');
const port = 4100;

export default defineConfig({
  testDir: './test/integration',
  timeout: 120_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry'
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}/api/health`,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: integrationDbPath,
      TASKIO_TIMEZONE: 'UTC'
    }
  }
});

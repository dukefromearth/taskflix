import path from 'node:path';
import { TaskioService } from '../domain/taskio-service';
import { getDatabaseRuntime } from '../db/client';
import { ensureDatabaseReady } from '../db/bootstrap';
import { LocalStorageAdapter } from '../storage/local-storage-adapter';

export const getService = async (): Promise<TaskioService> => {
  await ensureDatabaseReady();
  return new TaskioService({
    db: getDatabaseRuntime().db,
    timezone: process.env.TASKIO_TIMEZONE ?? 'America/New_York'
  });
};

export const getStorage = (): LocalStorageAdapter => {
  const uploadDir = process.env.UPLOAD_LOCAL_DIR ?? path.join(process.cwd(), '.uploads');
  const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
  return new LocalStorageAdapter(uploadDir, baseUrl);
};

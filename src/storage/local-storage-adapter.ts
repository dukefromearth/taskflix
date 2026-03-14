import path from 'node:path';
import { promises as fs } from 'node:fs';
import { StorageAdapter } from './storage-adapter';

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly rootDir: string, private readonly publicBaseUrl: string) {}

  async put(input: { key: string; body: ArrayBuffer | Buffer; contentType: string }): Promise<void> {
    const fullPath = path.join(this.rootDir, input.key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    const data = input.body instanceof Buffer ? input.body : Buffer.from(new Uint8Array(input.body));
    await fs.writeFile(fullPath, data);
  }

  async getSignedReadUrl(key: string): Promise<string> {
    return `${this.publicBaseUrl.replace(/\/$/, '')}/api/files/${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(this.rootDir, key);
    await fs.rm(fullPath, { force: true });
  }
}

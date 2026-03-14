export interface StorageAdapter {
  put(input: {
    key: string;
    body: ArrayBuffer | Buffer;
    contentType: string;
  }): Promise<void>;

  getSignedReadUrl(key: string, options?: { expiresInSeconds?: number }): Promise<string>;
  delete(key: string): Promise<void>;
}

import type { DbExecutor } from './repository-types';

type StoredResponse = {
  statusCode: number;
  payloadJson: string;
};

export class IdempotencyRepository {
  constructor(private readonly db: DbExecutor) {}

  async get(operation: string, idempotencyKey: string): Promise<StoredResponse | undefined> {
    const row = await this.db
      .selectFrom('idempotency_keys')
      .select(['status_code', 'response_json'])
      .where('operation', '=', operation)
      .where('idempotency_key', '=', idempotencyKey)
      .executeTakeFirst();

    if (!row) return undefined;

    return {
      statusCode: row.status_code,
      payloadJson: row.response_json
    };
  }

  async set(input: { operation: string; idempotencyKey: string; statusCode: number; payloadJson: string }): Promise<void> {
    await this.db
      .insertInto('idempotency_keys')
      .values({
        operation: input.operation,
        idempotency_key: input.idempotencyKey,
        status_code: input.statusCode,
        response_json: input.payloadJson,
        created_at: Date.now()
      })
      .onConflict((oc) => oc.columns(['operation', 'idempotency_key']).doNothing())
      .execute();
  }
}

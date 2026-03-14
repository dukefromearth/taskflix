import type { Kysely, Transaction } from 'kysely';
import type { DatabaseSchema } from '../db/schema';

export type DbExecutor = Kysely<DatabaseSchema> | Transaction<DatabaseSchema>;

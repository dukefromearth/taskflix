import { z } from 'zod';

export const NonEmptyStringSchema = z.string().min(1);

export const IdentifierSchema = NonEmptyStringSchema;

export const TimestampNumberSchema = z.number().int().nonnegative();

export const TimestampStringSchema = z.string().regex(/^\d+$/);

export const BooleanStringSchema = z.enum(['true', 'false']);

export const QueryRecordSchema = z.record(z.string(), z.unknown());

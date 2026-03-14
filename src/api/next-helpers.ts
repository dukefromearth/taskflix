import { NextResponse } from 'next/server';
import { ZodError, type z } from 'zod';
import { DomainError } from '../domain/errors';
import { ApiHttpError, fail, ok } from './contracts';
import { IdempotencyRepository } from '../repositories/idempotency-repository';
import { getDatabaseRuntime } from '../db/client';
import { ensureDatabaseReady } from '../db/bootstrap';

export const parseOrThrow = <T>(schema: z.ZodType<T>, input: unknown): T => schema.parse(input);

export const jsonOk = <T>(data: T, init?: ResponseInit): NextResponse =>
  NextResponse.json(ok(data), {
    status: init?.status ?? 200,
    headers: init?.headers
  });

export const parseRequestJson = async <T>(request: Request, schema: z.ZodType<T>): Promise<T> => {
  const raw = await request.json();
  return parseOrThrow(schema, raw);
};

export const handleRouteError = (error: unknown): NextResponse => {
  if (error instanceof ZodError) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Validation failed', error.flatten()), { status: 400 });
  }

  if (error instanceof ApiHttpError) {
    return NextResponse.json(fail(error.code, error.message, error.details), { status: error.statusCode });
  }

  if (error instanceof DomainError) {
    if (error.code === 'validation') {
      return NextResponse.json(fail('BAD_REQUEST', error.message), { status: 400 });
    }
    if (error.code === 'not_found') {
      return NextResponse.json(fail('NOT_FOUND', error.message), { status: 404 });
    }
    if (error.code === 'conflict') {
      return NextResponse.json(fail('CONFLICT', error.message), { status: 409 });
    }
  }

  return NextResponse.json(fail('INTERNAL_ERROR', 'Internal server error'), { status: 500 });
};

const idempotencyKeyFromRequest = (request: Request): string | undefined => {
  const raw = request.headers.get('idempotency-key');
  if (!raw) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const withIdempotency = async (
  request: Request,
  operation: string,
  execute: () => Promise<{ status: number; payload: unknown }>
): Promise<{ status: number; payload: unknown }> => {
  const key = idempotencyKeyFromRequest(request);
  if (!key) {
    return execute();
  }

  await ensureDatabaseReady();
  const repo = new IdempotencyRepository(getDatabaseRuntime().db);
  const stored = await repo.get(operation, key);
  if (stored) {
    return {
      status: stored.statusCode,
      payload: JSON.parse(stored.payloadJson)
    };
  }

  const result = await execute();
  if (result.status < 500) {
    await repo.set({
      operation,
      idempotencyKey: key,
      statusCode: result.status,
      payloadJson: JSON.stringify(result.payload)
    });
  }

  return result;
};

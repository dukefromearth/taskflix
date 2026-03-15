import { z } from 'zod';

export const ApiErrorCodeSchema = z.enum([
  'BAD_REQUEST',
  'NOT_FOUND',
  'CONFLICT',
  'VALIDATION_ERROR',
  'UNSUPPORTED_MEDIA_TYPE',
  'PAYLOAD_TOO_LARGE',
  'INTERNAL_ERROR'
]);

export const ApiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: ApiErrorCodeSchema,
    message: z.string(),
    details: z.unknown().optional()
  })
});

export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    ok: z.literal(true),
    data: dataSchema
  });

export const apiEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.union([apiSuccessSchema(dataSchema), ApiErrorSchema]);

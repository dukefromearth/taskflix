export class DomainError extends Error {
  readonly code: 'validation' | 'conflict' | 'not_found';
  readonly details?: unknown;

  constructor(code: 'validation' | 'conflict' | 'not_found', message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new DomainError('validation', message);
  }
}

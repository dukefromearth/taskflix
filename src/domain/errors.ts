export class DomainError extends Error {
  readonly code: 'validation' | 'conflict' | 'not_found';

  constructor(code: 'validation' | 'conflict' | 'not_found', message: string) {
    super(message);
    this.code = code;
  }
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new DomainError('validation', message);
  }
}

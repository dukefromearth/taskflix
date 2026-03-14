import { DomainError } from './errors';

const SEGMENT = /^[a-z0-9-]+$/;

export const normalizeTagName = (input: string): string => {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, '-')
    .replace(/\/+/g, '/');

  if (!normalized || normalized.startsWith('/') || normalized.endsWith('/')) {
    throw new DomainError('validation', 'Tag must not start or end with "/"');
  }

  const segments = normalized.split('/');
  for (const segment of segments) {
    if (!SEGMENT.test(segment)) {
      throw new DomainError('validation', `Invalid tag segment: ${segment}`);
    }
  }

  return segments.join('/');
};

export const toTagDisplayName = (normalizedName: string): string =>
  normalizedName
    .split('/')
    .map((segment) => segment.replace(/-/g, ' '))
    .join(' / ');

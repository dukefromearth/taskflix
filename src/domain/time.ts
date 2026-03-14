import type { TimelineZoom } from './types';

const ymdInTimezone = (ts: number, timezone: string): { year: number; month: number; day: number } => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(ts));

  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);

  return { year, month, day };
};

const compareYmd = (
  a: { year: number; month: number; day: number },
  b: { year: number; month: number; day: number }
): number => {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
};

export const isSameLocalDay = (aTs: number, bTs: number, timezone: string): boolean => {
  const a = ymdInTimezone(aTs, timezone);
  const b = ymdInTimezone(bTs, timezone);
  return a.year === b.year && a.month === b.month && a.day === b.day;
};

export const isBeforeLocalDay = (aTs: number, dayRefTs: number, timezone: string): boolean => {
  const a = ymdInTimezone(aTs, timezone);
  const day = ymdInTimezone(dayRefTs, timezone);
  return compareYmd(a, day) < 0;
};

export const daysFromNowLocal = (ts: number, nowTs: number, timezone: string): number => {
  const a = ymdInTimezone(ts, timezone);
  const b = ymdInTimezone(nowTs, timezone);

  const utcA = Date.UTC(a.year, a.month - 1, a.day);
  const utcB = Date.UTC(b.year, b.month - 1, b.day);

  return Math.floor((utcA - utcB) / 86400000);
};

export type TimelineBucket = {
  start: number;
  end: number;
  label: string;
};

const clampToRange = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const STEP_MS: Record<TimelineZoom, number> = {
  day: 60 * 60 * 1000,
  week: 24 * 60 * 60 * 1000,
  month: 7 * 24 * 60 * 60 * 1000,
  quarter: 7 * 24 * 60 * 60 * 1000,
  year: 30 * 24 * 60 * 60 * 1000,
  all: 90 * 24 * 60 * 60 * 1000
};

const formatBucketLabel = (zoom: TimelineZoom, ts: number, timezone: string): string => {
  if (zoom === 'day') {
    return new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric' }).format(new Date(ts));
  }

  if (zoom === 'year' || zoom === 'all') {
    return new Intl.DateTimeFormat('en-US', { timeZone: timezone, month: 'short', year: '2-digit' }).format(new Date(ts));
  }

  return new Intl.DateTimeFormat('en-US', { timeZone: timezone, month: 'short', day: 'numeric' }).format(new Date(ts));
};

export const getDefaultTimelineWindow = (now: number): { windowStart: number; windowEnd: number } => ({
  // TODO(timezone): This uses UTC day boundaries because this helper does not receive a timezone.
  // We should anchor to user-local midnight once timezone is threaded through default-window callers.
  windowStart: Math.floor(now / 86400000) * 86400000 - 3 * 86400000,
  windowEnd: Math.floor(now / 86400000) * 86400000 + 4 * 86400000
});

export const normalizeTimelineWindow = (
  windowStart: number,
  windowEnd: number
): { windowStart: number; windowEnd: number } => {
  if (windowStart <= windowEnd) return { windowStart, windowEnd };
  return { windowStart: windowEnd, windowEnd: windowStart };
};

export const clampPlayhead = (playheadTs: number, windowStart: number, windowEnd: number): number =>
  clampToRange(playheadTs, windowStart, windowEnd);

export const buildTimelineBuckets = (input: {
  zoom: TimelineZoom;
  windowStart: number;
  windowEnd: number;
  timezone: string;
}): TimelineBucket[] => {
  const { zoom, timezone } = input;
  const normalized = normalizeTimelineWindow(input.windowStart, input.windowEnd);
  const step = STEP_MS[zoom];

  const buckets: TimelineBucket[] = [];
  let cursor = normalized.windowStart;

  while (cursor < normalized.windowEnd) {
    const end = Math.min(cursor + step, normalized.windowEnd);
    buckets.push({
      start: cursor,
      end,
      label: formatBucketLabel(zoom, cursor, timezone)
    });
    cursor = end;
  }

  if (buckets.length === 0) {
    buckets.push({
      start: normalized.windowStart,
      end: normalized.windowEnd,
      label: formatBucketLabel(zoom, normalized.windowStart, timezone)
    });
  }

  return buckets;
};

export const timelineBucketIndexForTs = (buckets: TimelineBucket[], ts: number): number => {
  if (buckets.length === 0) return -1;
  const first = buckets[0];
  const last = buckets[buckets.length - 1];
  if (!first || !last) return -1;
  if (ts <= first.start) return 0;
  if (ts >= last.end) return buckets.length - 1;

  for (let i = 0; i < buckets.length; i += 1) {
    const bucket = buckets[i];
    if (!bucket) continue;
    if (ts >= bucket.start && ts < bucket.end) {
      return i;
    }
  }

  return buckets.length - 1;
};

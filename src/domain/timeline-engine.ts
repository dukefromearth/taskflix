import {
  buildTimelineBuckets,
  clampPlayhead,
  getDefaultTimelineWindow,
  normalizeTimelineWindow,
  timelineBucketIndexForTs,
  type TimelineBucket
} from './time';
import type { TimelineMode, TimelineZoom } from './types';

export type TimelineBaseInput = {
  zoom?: TimelineZoom;
  mode?: TimelineMode;
  windowStart?: number;
  windowEnd?: number;
  now?: number;
};

export type NormalizedTimelineInput = {
  now: number;
  zoom: TimelineZoom;
  mode: TimelineMode;
  windowStart: number;
  windowEnd: number;
};

export type TimelineBucketSelection = {
  bucketStart: number;
  bucketEnd: number;
  bucketLabel: string;
  bucketIndex: number;
  bucketIdentity: string;
  playheadTs: number;
};

export const normalizeTimelineInput = (input: TimelineBaseInput): NormalizedTimelineInput => {
  const now = input.now ?? Date.now();
  const zoom = input.zoom ?? 'week';
  const mode = input.mode ?? 'dual';

  const defaultWindow = getDefaultTimelineWindow(now);
  const normalizedWindow = normalizeTimelineWindow(input.windowStart ?? defaultWindow.windowStart, input.windowEnd ?? defaultWindow.windowEnd);

  const windowStart = normalizedWindow.windowStart;
  const windowEnd = normalizedWindow.windowEnd === normalizedWindow.windowStart ? normalizedWindow.windowEnd + 1 : normalizedWindow.windowEnd;

  return {
    now,
    zoom,
    mode,
    windowStart,
    windowEnd
  };
};

export const timelineBucketIdentity = (input: {
  bucketStart: number;
  bucketEnd: number;
  zoom: TimelineZoom;
  windowStart: number;
  windowEnd: number;
}): string => `${input.bucketStart}:${input.bucketEnd}:${input.zoom}:${input.windowStart}:${input.windowEnd}`;

export const bucketFromPlayhead = (input: {
  buckets: TimelineBucket[];
  playheadTs: number;
  zoom: TimelineZoom;
  windowStart: number;
  windowEnd: number;
}): TimelineBucketSelection => {
  const playheadTs = clampPlayhead(input.playheadTs, input.windowStart, input.windowEnd);
  const bucketIndex = timelineBucketIndexForTs(input.buckets, playheadTs);
  const fallback = input.buckets[0] ?? {
    start: input.windowStart,
    end: input.windowEnd,
    label: ''
  };
  const bucket = input.buckets[bucketIndex] ?? fallback;

  return {
    bucketStart: bucket.start,
    bucketEnd: bucket.end,
    bucketLabel: bucket.label,
    bucketIndex,
    bucketIdentity: timelineBucketIdentity({
      bucketStart: bucket.start,
      bucketEnd: bucket.end,
      zoom: input.zoom,
      windowStart: input.windowStart,
      windowEnd: input.windowEnd
    }),
    playheadTs
  };
};

export const bucketFromRange = (input: {
  buckets: TimelineBucket[];
  bucketStart: number;
  bucketEnd: number;
  zoom: TimelineZoom;
  windowStart: number;
  windowEnd: number;
  playheadTs?: number;
}): TimelineBucketSelection | undefined => {
  const matchIndex = input.buckets.findIndex((bucket) => bucket.start === input.bucketStart && bucket.end === input.bucketEnd);
  if (matchIndex < 0) return undefined;
  const bucket = input.buckets[matchIndex];
  if (!bucket) return undefined;
  const playheadTs = clampPlayhead(input.playheadTs ?? bucket.start, bucket.start, bucket.end);

  return {
    bucketStart: bucket.start,
    bucketEnd: bucket.end,
    bucketLabel: bucket.label,
    bucketIndex: matchIndex,
    bucketIdentity: timelineBucketIdentity({
      bucketStart: bucket.start,
      bucketEnd: bucket.end,
      zoom: input.zoom,
      windowStart: input.windowStart,
      windowEnd: input.windowEnd
    }),
    playheadTs
  };
};

export const buildBucketsForTimeline = (input: {
  zoom: TimelineZoom;
  windowStart: number;
  windowEnd: number;
  timezone: string;
}): TimelineBucket[] => buildTimelineBuckets(input);

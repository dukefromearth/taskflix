export const timelineStructureQueryOptions = {
  staleTime: 60_000,
  gcTime: 15 * 60_000,
  refetchOnWindowFocus: false
} as const;

export const timelineSummaryQueryOptions = {
  staleTime: 2_000,
  gcTime: 8 * 60_000,
  refetchOnWindowFocus: false
} as const;

export const timelineNowSummaryQueryOptions = {
  staleTime: 10_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false
} as const;

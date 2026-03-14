export const queryKeys = {
  projects: ['projects'] as const,
  timelineStructure: (input: {
    windowStart: number;
    windowEnd: number;
    zoom: string;
    mode: string;
    projectIds: string;
  }) => ['timeline', 'structure', input.windowStart, input.windowEnd, input.zoom, input.mode, input.projectIds] as const,
  timelineSummary: (input: {
    windowStart: number;
    windowEnd: number;
    zoom: string;
    projectIds: string;
    bucketStart: number;
    bucketEnd: number;
  }) =>
    ['timeline', 'summary', input.windowStart, input.windowEnd, input.zoom, input.projectIds, input.bucketStart, input.bucketEnd] as const,
  timelineNowSummary: (input: { zoom: string; projectIds: string }) =>
    ['timeline', 'summary', 'now', input.zoom, input.projectIds] as const,
  today: ['views', 'today'] as const,
  upcoming: ['views', 'upcoming'] as const,
  inbox: ['views', 'inbox'] as const,
  history: ['views', 'history'] as const,
  projectView: (projectId: string) => ['views', 'project', projectId] as const,
  items: ['items'] as const,
  itemDetail: (itemId: string) => ['item', itemId, 'detail'] as const,
  search: (q: string, filters: string) => ['search', q, filters] as const,
  savedViews: ['savedViews'] as const
};

export const queryKeys = {
  projects: ['projects'] as const,
  timeline: ['timeline'] as const,
  timelineView: (input: {
    windowStart: number;
    windowEnd: number;
    zoom: string;
    mode: string;
    projectIds: string;
    playheadTs: number;
  }) => ['timeline', input.windowStart, input.windowEnd, input.zoom, input.mode, input.projectIds, input.playheadTs] as const,
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

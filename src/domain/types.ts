export type ProjectStatus = 'active' | 'paused' | 'done' | 'archived';
export type ItemKind = 'task' | 'note' | 'milestone';
export type ItemStatus = 'inbox' | 'active' | 'blocked' | 'waiting' | 'done' | 'canceled';
export type SourceKind = 'manual' | 'api' | 'import' | 'share' | 'email' | 'link' | 'upload';

export type PreviewStatus = 'none' | 'pending' | 'ready' | 'failed';
export type TextExtractionStatus = 'none' | 'pending' | 'ready' | 'failed';

export type GroupBy =
  | 'none'
  | 'project'
  | 'status'
  | 'kind'
  | 'parent'
  | 'dueDay'
  | 'scheduledDay'
  | 'tag';

export type SortBy =
  | 'manual'
  | 'createdAt'
  | 'updatedAt'
  | 'dueAt'
  | 'scheduledAt'
  | 'priority'
  | 'title'
  | 'relevance';

export type SortDir = 'asc' | 'desc';

export type QueryFilter = {
  statuses?: ItemStatus[];
  kinds?: ItemKind[];
  projectIds?: string[];
  tagAny?: string[];
  tagAll?: string[];
  includeDone?: boolean;
  search?: string;
  groupBy?: GroupBy;
  sortBy?: SortBy;
  sortDir?: SortDir;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  descriptionMd: string;
  status: ProjectStatus;
  colorToken?: string;
  icon?: string;
  orderKey: string;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
  deletedAt?: number;
};

export type Item = {
  id: string;
  projectId?: string;
  parentItemId?: string;
  kind: ItemKind;
  title: string;
  descriptionMd: string;
  status: ItemStatus;
  priority: 0 | 1 | 2 | 3 | 4;
  orderKey: string;
  scheduledAt?: number;
  dueAt?: number;
  completedAt?: number;
  snoozedUntil?: number;
  requestedBy?: string;
  isInterruption: boolean;
  sourceKind: SourceKind;
  sourceRef?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export type Tag = {
  id: string;
  name: string;
  displayName: string;
  createdAt: number;
};

export type LinkKind = 'github' | 'doc' | 'ticket' | 'chat' | 'calendar' | 'generic';

export type Link = {
  id: string;
  itemId: string;
  url: string;
  label?: string;
  kind?: LinkKind;
  createdAt: number;
};

export type Attachment = {
  id: string;
  itemId: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  previewStatus: PreviewStatus;
  textExtractionStatus: TextExtractionStatus;
  createdAt: number;
  deletedAt?: number;
};

export type AttachmentContent = {
  attachmentId: string;
  textContent: string;
  contentHash: string;
  extractedAt: number;
};

export type ItemEventType =
  | 'item.created'
  | 'item.updated'
  | 'item.statusChanged'
  | 'item.scheduled'
  | 'item.dueChanged'
  | 'item.completed'
  | 'item.reopened'
  | 'item.tagAdded'
  | 'item.tagRemoved'
  | 'item.linkAdded'
  | 'item.attachmentAdded'
  | 'item.moved'
  | 'item.reordered';

export type ItemEvent = {
  id: string;
  itemId: string;
  commandId: string;
  eventType: ItemEventType;
  payloadJson: Record<string, unknown>;
  occurredAt: number;
};

export type SavedView = {
  id: string;
  name: string;
  icon?: string;
  queryJson: QueryFilter;
  orderKey: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export type UserPreference = {
  id: string;
  timezone: string;
  theme: 'system' | 'light' | 'dark';
  density: 'comfortable' | 'compact';
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  defaultProjectId?: string;
  todayShowsDone: boolean;
  reduceMotion: boolean;
  createdAt: number;
  updatedAt: number;
};

export type ItemRowDto = {
  id: string;
  title: string;
  kind: ItemKind;
  status: ItemStatus;
  priority: number;
  project?: { id: string; title: string; slug: string };
  tags: string[];
  dueAt?: number;
  scheduledAt?: number;
  requestedBy?: string;
  isInterruption: boolean;
  hasLinks: boolean;
  attachmentCount: number;
  childCount: number;
  isOverdue: boolean;
};

export type TodayViewDto = {
  now: number;
  timezone: string;
  sections: Array<{
    key: 'triage' | 'overdue' | 'today' | 'inProgress';
    label: string;
    count: number;
    items: ItemRowDto[];
  }>;
};

export type UpcomingViewDto = {
  now: number;
  timezone: string;
  buckets: Array<{
    key: 'tomorrow' | 'thisWeek' | 'nextWeek' | 'later';
    label: string;
    items: ItemRowDto[];
  }>;
};

export type TimelineZoom = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
export type TimelineMode = 'dual' | 'plan' | 'reality';

export type TimelineLaneKey = 'plan' | 'reality' | 'overduePressure' | 'interruptions';

export type TimelineBucketDto = {
  start: number;
  end: number;
  label: string;
  count: number;
};

export type TimelineLaneDto = {
  key: TimelineLaneKey;
  label: string;
  buckets: TimelineBucketDto[];
};

export type TimelineMomentDto = {
  ts: number;
  label: string;
  kind: 'plan' | 'reality' | 'overdue' | 'interruption';
  count: number;
};

export type TimelineSummaryDto = {
  bucketStart: number;
  bucketEnd: number;
  bucketIdentity: string;
  playheadTs: number;
  playheadLabel: string;
  counts: {
    plan: number;
    reality: number;
    overdue: number;
    interruptions: number;
  };
  topItems: ItemRowDto[];
  recentEvents: ItemEvent[];
};

export type TimelineStructureDto = {
  now: number;
  timezone: string;
  zoom: TimelineZoom;
  mode: TimelineMode;
  windowStart: number;
  windowEnd: number;
  projectIds?: string[];
  lanes: TimelineLaneDto[];
  moments: TimelineMomentDto[];
};

export type InboxViewDto = {
  now: number;
  timezone: string;
  items: ItemRowDto[];
};

export type ProjectViewDto = {
  now: number;
  timezone: string;
  project: Project;
  items: ItemRowDto[];
  history: ItemEvent[];
};

export type HistoryViewDto = {
  now: number;
  timezone: string;
  events: ItemEvent[];
};

export type SearchResultDto = {
  item: ItemRowDto;
  snippet?: string;
  score: number;
};

export type ItemDetailDto = {
  item: Item;
  project?: Project;
  tags: Tag[];
  links: Link[];
  attachments: Attachment[];
  events: ItemEvent[];
};

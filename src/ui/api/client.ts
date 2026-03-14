import type { ApiError, ApiSuccess } from '@/api/contracts';
import type {
  Attachment,
  HistoryViewDto,
  InboxViewDto,
  Item,
  ItemDetailDto,
  ItemStatus,
  Link,
  Project,
  ProjectViewDto,
  SavedView,
  SearchResultDto,
  TimelineMode,
  TimelineViewDto,
  TimelineZoom,
  TodayViewDto,
  UpcomingViewDto
} from '@/domain/types';

type Envelope<T> = ApiSuccess<T> | ApiError;

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  signal?: AbortSignal;
};

const readErrorText = async (response: Response): Promise<string> => {
  try {
    const text = await response.text();
    return text || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

const parseEnvelope = <T>(payload: Envelope<T>): T => {
  if (!payload.ok) {
    throw new Error(payload.error.message);
  }
  return payload.data;
};

const request = async <T>(url: string, options?: RequestOptions): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
      ...(options?.body === undefined ? {} : { 'content-type': 'application/json' })
    },
    body: options?.body === undefined ? undefined : JSON.stringify(options.body)
  });

  if (!response.ok) {
    const message = await readErrorText(response);
    throw new Error(message);
  }

  const payload = (await response.json()) as Envelope<T>;
  return parseEnvelope(payload);
};

const toBase64 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

export const api = {
  listProjects: (includeArchived = false) =>
    request<Project[]>(`/api/projects?includeArchived=${includeArchived ? 'true' : 'false'}`),

  getTodayView: () => request<TodayViewDto>('/api/views/today'),
  getUpcomingView: () => request<UpcomingViewDto>('/api/views/upcoming'),
  getInboxView: () => request<InboxViewDto>('/api/views/inbox'),
  getHistoryView: () => request<HistoryViewDto>('/api/views/history'),
  getProjectView: (projectId: string) => request<ProjectViewDto>(`/api/views/project?projectId=${encodeURIComponent(projectId)}`),
  getTimelineView: (params?: {
    zoom?: TimelineZoom;
    mode?: TimelineMode;
    windowStart?: number;
    windowEnd?: number;
    playheadTs?: number;
    projectIds?: string[];
  }) => {
    const query = new URLSearchParams();
    if (params?.zoom) query.set('zoom', params.zoom);
    if (params?.mode) query.set('mode', params.mode);
    if (params?.windowStart !== undefined) query.set('windowStart', String(params.windowStart));
    if (params?.windowEnd !== undefined) query.set('windowEnd', String(params.windowEnd));
    if (params?.playheadTs !== undefined) query.set('playheadTs', String(params.playheadTs));
    if (params?.projectIds && params.projectIds.length > 0) query.set('projectIds', params.projectIds.join(','));
    const suffix = query.toString();
    return request<TimelineViewDto>(`/api/timeline${suffix ? `?${suffix}` : ''}`);
  },

  listItems: () => request<Item[]>('/api/items'),
  getItemDetail: (itemId: string) => request<ItemDetailDto>(`/api/items/${encodeURIComponent(itemId)}/detail`),
  updateItem: (itemId: string, patch: Partial<Item>) =>
    request<Item>(`/api/items/${encodeURIComponent(itemId)}`, { method: 'PATCH', body: patch }),
  completeItem: (itemId: string) => request<Item>(`/api/items/${encodeURIComponent(itemId)}/complete`, { method: 'POST' }),
  changeItemStatus: (itemId: string, to: ItemStatus, reason?: string) =>
    request<Item>(`/api/items/${encodeURIComponent(itemId)}/status`, { method: 'POST', body: { to, reason } }),
  scheduleItem: (itemId: string, scheduledAt?: number, dueAt?: number) =>
    request<Item>(`/api/items/${encodeURIComponent(itemId)}/schedule`, { method: 'POST', body: { scheduledAt, dueAt } }),
  deferItem: (itemId: string, snoozedUntil: number) =>
    request<Item>(`/api/items/${encodeURIComponent(itemId)}/defer`, { method: 'POST', body: { snoozedUntil } }),
  updateTags: (itemId: string, add?: string[], remove?: string[]) =>
    request<{ updated: boolean }>(`/api/items/${encodeURIComponent(itemId)}/tags`, {
      method: 'POST',
      body: { add, remove }
    }),
  addLink: (itemId: string, input: { url: string; label?: string; kind?: Link['kind'] }) =>
    request<Link>(`/api/items/${encodeURIComponent(itemId)}/links`, {
      method: 'POST',
      body: input
    }),
  uploadAttachment: async (itemId: string, file: File) => {
    const contentBase64 = await toBase64(file);
    return request<Attachment>(`/api/items/${encodeURIComponent(itemId)}/attachments`, {
      method: 'POST',
      body: {
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        contentBase64
      }
    });
  },

  search: (params: {
    q: string;
    statuses?: string[];
    projectIds?: string[];
    tagAny?: string[];
    tagAll?: string[];
    includeDone?: boolean;
  }) => {
    const query = new URLSearchParams({ q: params.q });
    if (params.statuses?.length) query.set('statuses', params.statuses.join(','));
    if (params.projectIds?.length) query.set('projectIds', params.projectIds.join(','));
    if (params.tagAny?.length) query.set('tagAny', params.tagAny.join(','));
    if (params.tagAll?.length) query.set('tagAll', params.tagAll.join(','));
    if (params.includeDone !== undefined) query.set('includeDone', params.includeDone ? 'true' : 'false');
    return request<SearchResultDto[]>(`/api/search?${query.toString()}`);
  },

  listSavedViews: () => request<SavedView[]>('/api/saved-views')
};

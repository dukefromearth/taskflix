import { z } from 'zod';
import {
  HistoryViewSchema,
  InboxViewSchema,
  ProjectViewSchema,
  TodayViewSchema,
  UpcomingViewSchema
} from '@/contracts/entities';
import { ENDPOINT_BY_ID } from '@/contracts/registry';
import type { EndpointById } from '@/contracts/registry';
import { createContractClient } from '@/contracts/runtime/client';
import type { EndpointInput } from '@/contracts/types';

type SignalOptions = {
  signal?: AbortSignal;
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

const toCsv = (values?: string[]): string | undefined => {
  if (!values || values.length === 0) return undefined;
  return values.join(',');
};

const toNumericQuery = (value?: number): string | undefined => (value === undefined ? undefined : String(value));

type QueryStringToNumber<T> = T extends string | undefined ? number : never;
type QueryStringToList<T> = T extends string | undefined ? string[] : never;
type QueryStringToBoolean<T> = T extends 'true' | 'false' | undefined ? boolean : never;

type ItemPatchInput = EndpointInput<EndpointById<'items.update'>>['body'];
type ItemStatusInput = EndpointInput<EndpointById<'items.status'>>['body']['to'];
type ItemScheduleInput = EndpointInput<EndpointById<'items.schedule'>>['body'];
type ItemDeferInput = EndpointInput<EndpointById<'items.defer'>>['body'];
type ItemTagUpdateInput = EndpointInput<EndpointById<'items.tags'>>['body'];
type ItemLinkInput = EndpointInput<EndpointById<'items.links'>>['body'];
type ProjectCreateInput = EndpointInput<EndpointById<'projects.create'>>['body'];
type ProjectPatchInput = EndpointInput<EndpointById<'projects.update'>>['body'];
type ProjectReorderInput = EndpointInput<EndpointById<'projects.reorder'>>['body'];
type SavedViewCreateInput = EndpointInput<EndpointById<'savedViews.create'>>['body'];
type SavedViewPatchInput = EndpointInput<EndpointById<'savedViews.update'>>['body'];
type SearchQueryInput = EndpointInput<EndpointById<'search.query'>>['query'];
type TimelineStructureQueryInput = EndpointInput<EndpointById<'timeline.structure'>>['query'];
type TimelineSummaryQueryInput = EndpointInput<EndpointById<'timeline.summary'>>['query'];
type ViewQueryInput = EndpointInput<EndpointById<'views.get'>>['query'];

type SearchParams = {
  q: NonNullable<SearchQueryInput['q']>;
  statuses?: QueryStringToList<SearchQueryInput['statuses']>;
  projectIds?: QueryStringToList<SearchQueryInput['projectIds']>;
  tagAny?: QueryStringToList<SearchQueryInput['tagAny']>;
  tagAll?: QueryStringToList<SearchQueryInput['tagAll']>;
  includeDone?: QueryStringToBoolean<SearchQueryInput['includeDone']>;
};

type TimelineStructureParams = {
  zoom?: TimelineStructureQueryInput['zoom'];
  mode?: TimelineStructureQueryInput['mode'];
  windowStart?: QueryStringToNumber<TimelineStructureQueryInput['windowStart']>;
  windowEnd?: QueryStringToNumber<TimelineStructureQueryInput['windowEnd']>;
  projectIds?: QueryStringToList<TimelineStructureQueryInput['projectIds']>;
};

type TimelineSummaryParams = {
  zoom?: TimelineSummaryQueryInput['zoom'];
  windowStart?: QueryStringToNumber<TimelineSummaryQueryInput['windowStart']>;
  windowEnd?: QueryStringToNumber<TimelineSummaryQueryInput['windowEnd']>;
  playheadTs?: QueryStringToNumber<TimelineSummaryQueryInput['playheadTs']>;
  bucketStart?: QueryStringToNumber<TimelineSummaryQueryInput['bucketStart']>;
  bucketEnd?: QueryStringToNumber<TimelineSummaryQueryInput['bucketEnd']>;
  projectIds?: QueryStringToList<TimelineSummaryQueryInput['projectIds']>;
};

const contractClient = createContractClient(ENDPOINT_BY_ID, (input, init) => globalThis.fetch(input, init));

const isViewErrorPayload = (value: unknown): value is { ok: false; error: string } => {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as { ok?: unknown; error?: unknown };
  return maybe.ok === false && typeof maybe.error === 'string';
};

const parseViewPayload = <T>(schema: z.ZodType<T>, payload: unknown): T => {
  if (isViewErrorPayload(payload)) {
    throw new Error(payload.error);
  }
  return schema.parse(payload);
};

export const api = {
  listProjects: (includeArchived = false) =>
    contractClient.call('projects.list', { query: { includeArchived: includeArchived ? 'true' : 'false' } }),
  getProject: (projectId: string) =>
    contractClient.call('projects.get', { params: { projectId } }),
  createProject: (input: ProjectCreateInput) =>
    contractClient.call('projects.create', { body: input }),
  updateProject: (projectId: string, patch: ProjectPatchInput) =>
    contractClient.call('projects.update', { params: { projectId }, body: patch }),
  deleteProject: (projectId: string) =>
    contractClient.call('projects.delete', { params: { projectId } }),
  reorderProjects: (input: ProjectReorderInput) =>
    contractClient.call('projects.reorder', { body: input }),

  getTodayView: async () => {
    const payload = await contractClient.call('views.get', { params: { name: 'today' } });
    return parseViewPayload(TodayViewSchema, payload);
  },
  getUpcomingView: async () => {
    const payload = await contractClient.call('views.get', { params: { name: 'upcoming' } });
    return parseViewPayload(UpcomingViewSchema, payload);
  },
  getInboxView: async () => {
    const payload = await contractClient.call('views.get', { params: { name: 'inbox' } });
    return parseViewPayload(InboxViewSchema, payload);
  },
  getHistoryView: async () => {
    const payload = await contractClient.call('views.get', { params: { name: 'history' } });
    return parseViewPayload(HistoryViewSchema, payload);
  },
  getProjectView: async (projectId: NonNullable<ViewQueryInput['projectId']>) => {
    const payload = await contractClient.call('views.get', { params: { name: 'project' }, query: { projectId } });
    return parseViewPayload(ProjectViewSchema, payload);
  },
  getTimelineStructure: (params?: TimelineStructureParams, options?: SignalOptions) => {
    const query: TimelineStructureQueryInput = {
      zoom: params?.zoom,
      mode: params?.mode,
      windowStart: toNumericQuery(params?.windowStart),
      windowEnd: toNumericQuery(params?.windowEnd),
      projectIds: toCsv(params?.projectIds)
    };

    return contractClient.call('timeline.structure', { query }, { signal: options?.signal });
  },
  getTimelineSummary: (params?: TimelineSummaryParams, options?: SignalOptions) => {
    const query: TimelineSummaryQueryInput = {
      zoom: params?.zoom,
      windowStart: toNumericQuery(params?.windowStart),
      windowEnd: toNumericQuery(params?.windowEnd),
      playheadTs: toNumericQuery(params?.playheadTs),
      bucketStart: toNumericQuery(params?.bucketStart),
      bucketEnd: toNumericQuery(params?.bucketEnd),
      projectIds: toCsv(params?.projectIds)
    };

    return contractClient.call('timeline.summary', { query }, { signal: options?.signal });
  },

  listItems: () => contractClient.call('items.list'),
  getItemDetail: (itemId: string) =>
    contractClient.call('items.detail', { params: { itemId } }),
  updateItem: (itemId: string, patch: ItemPatchInput) =>
    contractClient.call('items.update', { params: { itemId }, body: patch }),
  completeItem: (itemId: string) => contractClient.call('items.complete', { params: { itemId } }),
  changeItemStatus: (itemId: string, to: ItemStatusInput, reason?: string) =>
    contractClient.call('items.status', { params: { itemId }, body: { to, reason } }),
  scheduleItem: (itemId: string, scheduledAt?: ItemScheduleInput['scheduledAt'], dueAt?: ItemScheduleInput['dueAt']) =>
    contractClient.call('items.schedule', { params: { itemId }, body: { scheduledAt, dueAt } }),
  deferItem: (itemId: string, snoozedUntil: ItemDeferInput['snoozedUntil']) =>
    contractClient.call('items.defer', { params: { itemId }, body: { snoozedUntil } }),
  updateTags: (itemId: string, add?: ItemTagUpdateInput['add'], remove?: ItemTagUpdateInput['remove']) =>
    contractClient.call('items.tags', { params: { itemId }, body: { add, remove } }),
  addLink: (itemId: string, input: ItemLinkInput) =>
    contractClient.call('items.links', { params: { itemId }, body: input }),
  uploadAttachment: async (itemId: string, file: File) => {
    const contentBase64 = await toBase64(file);
    return contractClient.call('items.attachments.upload', {
      params: { itemId },
      body: {
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        contentBase64
      }
    });
  },

  search: (params: SearchParams) => {
    const query: SearchQueryInput = {
      q: params.q,
      statuses: toCsv(params.statuses),
      projectIds: toCsv(params.projectIds),
      tagAny: toCsv(params.tagAny),
      tagAll: toCsv(params.tagAll),
      includeDone: params.includeDone === undefined ? undefined : params.includeDone ? 'true' : 'false'
    };

    return contractClient.call('search.query', { query });
  },

  listSavedViews: () => contractClient.call('savedViews.list'),
  createSavedView: (input: SavedViewCreateInput) =>
    contractClient.call('savedViews.create', { body: input }),
  updateSavedView: (savedViewId: string, patch: SavedViewPatchInput) =>
    contractClient.call('savedViews.update', { params: { savedViewId }, body: patch }),
  deleteSavedView: (savedViewId: string) =>
    contractClient.call('savedViews.delete', { params: { savedViewId } })
};

export interface ProjectsTable {
  id: string;
  slug: string;
  title: string;
  description_md: string;
  status: string;
  color_token: string | null;
  icon: string | null;
  order_key: string;
  created_at: number;
  updated_at: number;
  archived_at: number | null;
  deleted_at: number | null;
}

export interface ItemsTable {
  id: string;
  project_id: string | null;
  parent_item_id: string | null;
  kind: string;
  title: string;
  description_md: string;
  status: string;
  priority: number;
  order_key: string;
  scheduled_at: number | null;
  due_at: number | null;
  completed_at: number | null;
  snoozed_until: number | null;
  requested_by: string | null;
  is_interruption: number;
  source_kind: string;
  source_ref: string | null;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface TagsTable {
  id: string;
  name: string;
  display_name: string;
  created_at: number;
}

export interface ItemTagsTable {
  item_id: string;
  tag_id: string;
  created_at: number;
}

export interface ItemLinksTable {
  id: string;
  item_id: string;
  url: string;
  label: string | null;
  kind: string | null;
  created_at: number;
}

export interface AttachmentsTable {
  id: string;
  item_id: string;
  storage_key: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  preview_status: string;
  text_extraction_status: string;
  created_at: number;
  deleted_at: number | null;
}

export interface AttachmentContentsTable {
  attachment_id: string;
  text_content: string;
  content_hash: string;
  extracted_at: number;
}

export interface ItemEventsTable {
  id: string;
  item_id: string;
  command_id: string;
  event_type: string;
  payload_json: string;
  occurred_at: number;
}

export interface SavedViewsTable {
  id: string;
  name: string;
  icon: string | null;
  query_json: string;
  order_key: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface UserPreferencesTable {
  id: string;
  timezone: string;
  theme: string;
  density: string;
  week_starts_on: number;
  default_project_id: string | null;
  today_shows_done: number;
  reduce_motion: number;
  created_at: number;
  updated_at: number;
}

export interface ItemsFtsTable {
  item_id: string;
  title: string;
  description: string;
  project_title: string;
  tag_names: string;
  attachment_text: string;
}

export interface SchemaMigrationsTable {
  name: string;
  applied_at: number;
}

export interface IdempotencyKeysTable {
  operation: string;
  idempotency_key: string;
  status_code: number;
  response_json: string;
  created_at: number;
}

export interface DatabaseSchema {
  projects: ProjectsTable;
  items: ItemsTable;
  tags: TagsTable;
  item_tags: ItemTagsTable;
  item_links: ItemLinksTable;
  attachments: AttachmentsTable;
  attachment_contents: AttachmentContentsTable;
  item_events: ItemEventsTable;
  saved_views: SavedViewsTable;
  user_preferences: UserPreferencesTable;
  items_fts: ItemsFtsTable;
  schema_migrations: SchemaMigrationsTable;
  idempotency_keys: IdempotencyKeysTable;
}

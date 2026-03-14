CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description_md TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  color_token TEXT,
  icon TEXT,
  order_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  archived_at INTEGER,
  deleted_at INTEGER
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_order_key ON projects(order_key);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);

CREATE TABLE items (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  parent_item_id TEXT REFERENCES items(id),
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  description_md TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 2,
  order_key TEXT NOT NULL,
  scheduled_at INTEGER,
  due_at INTEGER,
  completed_at INTEGER,
  snoozed_until INTEGER,
  requested_by TEXT,
  is_interruption INTEGER NOT NULL DEFAULT 0,
  source_kind TEXT NOT NULL DEFAULT 'manual',
  source_ref TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  CHECK (priority BETWEEN 0 AND 4)
);

CREATE INDEX idx_items_project_id ON items(project_id);
CREATE INDEX idx_items_parent_item_id ON items(parent_item_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_due_at ON items(due_at);
CREATE INDEX idx_items_scheduled_at ON items(scheduled_at);
CREATE INDEX idx_items_updated_at ON items(updated_at);
CREATE INDEX idx_items_deleted_at ON items(deleted_at);
CREATE INDEX idx_items_project_parent_order ON items(project_id, parent_item_id, order_key);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE item_tags (
  item_id TEXT NOT NULL REFERENCES items(id),
  tag_id TEXT NOT NULL REFERENCES tags(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (item_id, tag_id)
);

CREATE INDEX idx_item_tags_tag_id ON item_tags(tag_id);

CREATE TABLE item_links (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id),
  url TEXT NOT NULL,
  label TEXT,
  kind TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id),
  storage_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  preview_status TEXT NOT NULL DEFAULT 'none',
  text_extraction_status TEXT NOT NULL DEFAULT 'none',
  created_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX idx_attachments_item_id ON attachments(item_id);
CREATE INDEX idx_attachments_deleted_at ON attachments(deleted_at);

CREATE TABLE attachment_contents (
  attachment_id TEXT PRIMARY KEY REFERENCES attachments(id),
  text_content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  extracted_at INTEGER NOT NULL
);

CREATE TABLE item_events (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id),
  command_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  occurred_at INTEGER NOT NULL
);

CREATE INDEX idx_item_events_item_id_occurred_at ON item_events(item_id, occurred_at DESC);
CREATE INDEX idx_item_events_occurred_at ON item_events(occurred_at DESC);

CREATE TABLE saved_views (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  query_json TEXT NOT NULL,
  order_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY,
  timezone TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'system',
  density TEXT NOT NULL DEFAULT 'comfortable',
  week_starts_on INTEGER NOT NULL DEFAULT 1,
  default_project_id TEXT REFERENCES projects(id),
  today_shows_done INTEGER NOT NULL DEFAULT 0,
  reduce_motion INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE VIRTUAL TABLE items_fts USING fts5(
  item_id UNINDEXED,
  title,
  description,
  project_title,
  tag_names,
  attachment_text
);

CREATE TABLE idempotency_keys (
  operation TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (operation, idempotency_key)
);

CREATE INDEX idx_idempotency_created_at ON idempotency_keys(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_items_timeline_plan_scheduled ON items(project_id, scheduled_at, deleted_at);
CREATE INDEX IF NOT EXISTS idx_items_timeline_plan_due ON items(project_id, due_at, deleted_at);
CREATE INDEX IF NOT EXISTS idx_items_timeline_interruptions_created ON items(project_id, is_interruption, created_at, deleted_at);
CREATE INDEX IF NOT EXISTS idx_items_timeline_due_open ON items(project_id, status, due_at, deleted_at);
CREATE INDEX IF NOT EXISTS idx_item_events_timeline_type_window_item ON item_events(event_type, occurred_at DESC, item_id);

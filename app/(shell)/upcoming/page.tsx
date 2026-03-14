'use client';

import { DndContext, type DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ItemRowDto, UpcomingViewDto } from '@/domain/types';
import { api } from '@/ui/api/client';
import { ItemList } from '@/ui/components/item-list';
import { useItemActions } from '@/ui/hooks/use-item-actions';
import { queryKeys } from '@/ui/query/keys';
import { useUiStore } from '@/ui/state/ui-store';

const bucketOffsets: Record<UpcomingViewDto['buckets'][number]['key'], number> = {
  tomorrow: 1,
  thisWeek: 3,
  nextWeek: 8,
  later: 21
};

export default function UpcomingPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: queryKeys.upcoming, queryFn: api.getUpcomingView });
  const { complete, setStatus, schedule, defer } = useItemActions();

  const selectedItemId = useUiStore((state) => state.selectedItemId);
  const setSelectedItemId = useUiStore((state) => state.setSelectedItemId);
  const setListItemIds = useUiStore((state) => state.setListItemIds);

  useEffect(() => {
    if (!data) return;
    const ids = data.buckets.flatMap((bucket) => bucket.items.map((item) => item.id));
    setListItemIds(ids);
  }, [data, setListItemIds]);

  const bucketByItemId = useMemo(() => {
    const map = new Map<string, UpcomingViewDto['buckets'][number]['key']>();
    for (const bucket of data?.buckets ?? []) {
      for (const item of bucket.items) map.set(item.id, bucket.key);
    }
    return map;
  }, [data]);

  const onDragEnd = (event: DragEndEvent) => {
    const activeItemId = String(event.active.id);
    const overId = event.over?.id;
    if (!overId) return;

    let targetBucketKey: UpcomingViewDto['buckets'][number]['key'] | undefined;
    if (['tomorrow', 'thisWeek', 'nextWeek', 'later'].includes(String(overId))) {
      targetBucketKey = String(overId) as UpcomingViewDto['buckets'][number]['key'];
    } else {
      targetBucketKey = bucketByItemId.get(String(overId));
    }

    if (!targetBucketKey) return;

    const base = new Date();
    base.setDate(base.getDate() + bucketOffsets[targetBucketKey]);
    base.setHours(10, 0, 0, 0);
    schedule(activeItemId, base.getTime());
  };

  if (isLoading) return <div className="text-sm text-muted">Loading Upcoming view…</div>;
  if (isError || !data) return <div className="text-sm text-danger">Failed to load Upcoming view.</div>;
  const now = Date.now();

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-ink">Upcoming</h1>
        <p className="text-sm text-muted">Drag items between buckets to reschedule quickly.</p>
        <Link
          href={`/timeline?zoom=month&mode=dual&playheadTs=${now}&windowStart=${now - 15 * 24 * 60 * 60 * 1000}&windowEnd=${now + 15 * 24 * 60 * 60 * 1000}`}
          className="inline-flex rounded border border-stone-300 bg-white px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent"
        >
          Open in Timeline
        </Link>
      </header>

      <DndContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 xl:grid-cols-2">
          {data.buckets.map((bucket) => (
            <DroppableBucket key={bucket.key} bucketId={bucket.key} label={bucket.label}>
              <ul className="space-y-2">
                {bucket.items.map((item) => (
                  <DraggableItem key={item.id} item={item}>
                    <ItemList
                      items={[item]}
                      selectedItemId={selectedItemId}
                      onSelect={setSelectedItemId}
                      actions={{
                        onComplete: (itemId) => complete(itemId),
                        onActivate: (itemId) => setStatus(itemId, 'active'),
                        onInbox: (itemId) => setStatus(itemId, 'inbox'),
                        onScheduleTomorrow: (itemId) => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          tomorrow.setHours(10, 0, 0, 0);
                          schedule(itemId, tomorrow.getTime());
                        },
                        onDeferDay: (itemId) => defer(itemId, Date.now() + 24 * 60 * 60 * 1000)
                      }}
                    />
                  </DraggableItem>
                ))}
              </ul>
            </DroppableBucket>
          ))}
        </div>
      </DndContext>
    </div>
  );
}

const DroppableBucket = ({
  bucketId,
  label,
  children
}: {
  bucketId: string;
  label: string;
  children: ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: bucketId });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-xl border bg-panel p-3 transition ${isOver ? 'border-accent ring-2 ring-accent/25' : 'border-stone-300'}`}
    >
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{label}</h2>
      {children}
    </section>
  );
};

const DraggableItem = ({ item, children }: { item: ItemRowDto; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.65 : 1
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </li>
  );
};

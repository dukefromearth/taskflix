'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ItemStatus } from '@/domain/types';
import { api } from '@/ui/api/client';
import { invalidateTimelineCaches } from '@/ui/query/invalidate-timeline';
import { queryKeys } from '@/ui/query/keys';

export const useItemActions = () => {
  const queryClient = useQueryClient();

  const invalidate = async (itemId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.today }),
      queryClient.invalidateQueries({ queryKey: queryKeys.upcoming }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox }),
      queryClient.invalidateQueries({ queryKey: queryKeys.history }),
      queryClient.invalidateQueries({ queryKey: queryKeys.items }),
      queryClient.invalidateQueries({ queryKey: ['search'] })
    ]);
    await invalidateTimelineCaches(queryClient);
    if (itemId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.itemDetail(itemId) });
    }
  };

  const completeMutation = useMutation({
    mutationFn: (itemId: string) => api.completeItem(itemId),
    onSuccess: (_, itemId) => invalidate(itemId)
  });

  const statusMutation = useMutation({
    mutationFn: (input: { itemId: string; to: ItemStatus }) => api.changeItemStatus(input.itemId, input.to),
    onSuccess: (_, input) => invalidate(input.itemId)
  });

  const scheduleMutation = useMutation({
    mutationFn: (input: { itemId: string; scheduledAt?: number; dueAt?: number }) =>
      api.scheduleItem(input.itemId, input.scheduledAt, input.dueAt),
    onSuccess: (_, input) => invalidate(input.itemId)
  });

  const deferMutation = useMutation({
    mutationFn: (input: { itemId: string; snoozedUntil: number }) => api.deferItem(input.itemId, input.snoozedUntil),
    onSuccess: (_, input) => invalidate(input.itemId)
  });

  return {
    complete: (itemId: string) => completeMutation.mutate(itemId),
    setStatus: (itemId: string, to: ItemStatus) => statusMutation.mutate({ itemId, to }),
    schedule: (itemId: string, scheduledAt?: number, dueAt?: number) => scheduleMutation.mutate({ itemId, scheduledAt, dueAt }),
    defer: (itemId: string, snoozedUntil: number) => deferMutation.mutate({ itemId, snoozedUntil })
  };
};

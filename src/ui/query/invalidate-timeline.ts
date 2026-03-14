import type { QueryClient } from '@tanstack/react-query';

type TimelineInvalidateScope = 'all' | 'structure' | 'summary';

export const invalidateTimelineCaches = async (
  queryClient: QueryClient,
  scope: TimelineInvalidateScope = 'all'
): Promise<void> => {
  if (scope === 'all' || scope === 'structure') {
    await queryClient.invalidateQueries({ queryKey: ['timeline', 'structure'] });
  }

  if (scope === 'all' || scope === 'summary') {
    await queryClient.invalidateQueries({ queryKey: ['timeline', 'summary'] });
  }
};

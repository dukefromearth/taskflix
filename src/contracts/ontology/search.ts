import { z } from 'zod';
import { ItemKindSchema, ItemStatusSchema } from '@/contracts/ontology/items';

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  search: z.string().optional(),
  statuses: z.string().optional(),
  kinds: z.string().optional(),
  projectIds: z.string().optional(),
  tagAny: z.string().optional(),
  tagAll: z.string().optional(),
  includeDone: z.enum(['true', 'false']).optional()
});

const splitCsv = (value?: string): string[] | undefined => {
  if (!value) return undefined;

  const parts = value
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : undefined;
};

export const parseSearchFilter = (query: z.infer<typeof SearchQuerySchema>) => ({
  statuses: query.statuses ? z.array(ItemStatusSchema).parse(splitCsv(query.statuses)) : undefined,
  kinds: query.kinds ? z.array(ItemKindSchema).parse(splitCsv(query.kinds)) : undefined,
  projectIds: splitCsv(query.projectIds),
  tagAny: splitCsv(query.tagAny),
  tagAll: splitCsv(query.tagAll),
  includeDone: query.includeDone === undefined ? undefined : query.includeDone === 'true',
  search: query.search
});

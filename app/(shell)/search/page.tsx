import { SearchPageClient } from '@/ui/components/search-page-client';

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; statuses?: string; projectIds?: string; tagAny?: string }>;
}) {
  const params = await searchParams;

  return (
    <SearchPageClient
      initialQ={params.q ?? ''}
      initialStatuses={params.statuses ?? ''}
      initialProjectIds={params.projectIds ?? ''}
      initialTagAny={params.tagAny ?? ''}
    />
  );
}

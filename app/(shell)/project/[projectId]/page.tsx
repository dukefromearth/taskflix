import { redirect } from 'next/navigation';

export default async function LegacyProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolved = await params;
  redirect(`/projects/${resolved.projectId}`);
}

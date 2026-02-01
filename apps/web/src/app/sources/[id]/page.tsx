import { notFound } from 'next/navigation';
import { getSourceDetail } from './_lib/actions';
import { SourceDetailView } from './_components/source-detail-view';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SourceDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getSourceDetail(id);

  if (!data) {
    notFound();
  }

  return <SourceDetailView data={data} />;
}

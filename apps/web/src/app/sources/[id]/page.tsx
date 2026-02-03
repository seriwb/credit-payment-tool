import { notFound } from "next/navigation";
import { SourceDetailView } from "./_components/source-detail-view";
import { getSourceDetail } from "./_lib/actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnName?: string; returnCategoryId?: string }>;
};

export default async function SourceDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { returnName, returnCategoryId } = await searchParams;
  const data = await getSourceDetail(id);

  if (!data) {
    notFound();
  }

  // 戻り先のフィルターパラメータを構築
  const returnParams = {
    name: returnName,
    categoryId: returnCategoryId === "null" ? null : returnCategoryId,
  };

  return <SourceDetailView data={data} returnParams={returnParams} />;
}

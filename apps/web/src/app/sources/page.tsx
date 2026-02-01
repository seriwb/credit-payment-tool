import { SourcesView } from './_components/sources-view';
import { getPaymentSources, getCategoryOptions } from './_lib/actions';

export default async function SourcesPage() {
  const [sources, categories] = await Promise.all([
    getPaymentSources(),
    getCategoryOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">支払い元管理</h2>
        <p className="text-muted-foreground mt-1">
          支払い元にカテゴリを割り当てて分類できます
        </p>
      </div>
      <SourcesView initialSources={sources} categories={categories} />
    </div>
  );
}

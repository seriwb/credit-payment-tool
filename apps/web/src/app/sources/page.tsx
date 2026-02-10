import { Suspense } from "react";
import { getCardTypes } from "@/app/_lib/actions";
import { SourcesView } from "./_components/sources-view";
import { getCategoryOptions, getPaymentSources } from "./_lib/actions";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const [sources, categories, cardTypes] = await Promise.all([
    getPaymentSources(),
    getCategoryOptions(),
    getCardTypes(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">支払い元管理</h2>
        <p className="mt-1 text-muted-foreground">支払い元にカテゴリを割り当てて分類できます</p>
      </div>
      <Suspense fallback={<div className="text-sm text-muted-foreground">読み込み中...</div>}>
        <SourcesView initialSources={sources} categories={categories} cardTypes={cardTypes} />
      </Suspense>
    </div>
  );
}

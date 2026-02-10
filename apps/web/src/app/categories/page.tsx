import { CategoriesView } from "./_components/categories-view";
import { getCategories } from "./_lib/actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">カテゴリ管理</h2>
        <p className="mt-1 text-muted-foreground">支払いを分類するためのカテゴリを管理します</p>
      </div>
      <CategoriesView initialCategories={categories} />
    </div>
  );
}

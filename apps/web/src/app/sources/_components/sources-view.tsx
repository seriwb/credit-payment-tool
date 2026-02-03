"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type CategoryOption,
  type PaymentSourceDetail,
  type SourceFilterParams,
  getPaymentSources,
} from "../_lib/actions";
import { SourcesFilter } from "./sources-filter";
import { SourcesTable } from "./sources-table";

type Props = {
  initialSources: PaymentSourceDetail[];
  categories: CategoryOption[];
};

export function SourcesView({ initialSources, categories }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URLパラメータから初期値を取得
  const initialName = searchParams.get("name") || "";
  const initialCategoryIdParam = searchParams.get("categoryId");
  const initialCategoryId =
    initialCategoryIdParam === "null" ? null : initialCategoryIdParam === null ? undefined : initialCategoryIdParam;

  const [sources, setSources] = useState(initialSources);
  const [nameFilter, setNameFilter] = useState<string>(initialName);
  const [categoryFilter, setCategoryFilter] = useState<string | null | undefined>(initialCategoryId);
  const [isPending, startTransition] = useTransition();
  const hasUrlParams = useRef(initialName !== "" || initialCategoryId !== undefined);

  // URLを更新する関数
  const updateUrl = useCallback(
    (name: string, categoryId: string | null | undefined) => {
      const params = new URLSearchParams();
      if (name) params.set("name", name);
      if (categoryId !== undefined) {
        params.set("categoryId", categoryId === null ? "null" : categoryId);
      }
      const query = params.toString();
      router.replace(`/sources${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router]
  );

  // URLパラメータがある場合、初回マウント時にデータを再取得
  useEffect(() => {
    if (hasUrlParams.current) {
      const filter: SourceFilterParams = {};
      if (initialName) filter.name = initialName;
      if (initialCategoryId !== undefined) filter.categoryId = initialCategoryId;

      startTransition(async () => {
        const newSources = await getPaymentSources(filter);
        setSources(newSources);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // データ取得関数
  const fetchSources = useCallback((name: string, categoryId: string | null | undefined) => {
    const filter: SourceFilterParams = {};
    if (name) filter.name = name;
    if (categoryId !== undefined) filter.categoryId = categoryId;

    startTransition(async () => {
      const newSources = await getPaymentSources(filter);
      setSources(newSources);
    });
  }, []);

  // 名前フィルター変更ハンドラー（デバウンス後にSourcesFilterから呼ばれる）
  const handleNameChange = useCallback(
    (name: string) => {
      // 初回レンダリング時は何もしない（initialNameと同じ値が来るため）
      if (name === nameFilter) return;

      setNameFilter(name);
      fetchSources(name, categoryFilter);
      updateUrl(name, categoryFilter);
    },
    [nameFilter, categoryFilter, fetchSources, updateUrl]
  );

  // カテゴリフィルター変更ハンドラー（即座に反映）
  const handleCategoryChange = useCallback(
    (categoryId: string | null | undefined) => {
      setCategoryFilter(categoryId);
      fetchSources(nameFilter, categoryId);
      updateUrl(nameFilter, categoryId);
    },
    [nameFilter, fetchSources, updateUrl]
  );

  // クリアハンドラー
  const handleClear = useCallback(() => {
    setNameFilter("");
    setCategoryFilter(undefined);
    fetchSources("", undefined);
    updateUrl("", undefined);
  }, [fetchSources, updateUrl]);

  // カテゴリ更新後のリフレッシュ（現在のフィルターを維持）
  const handleRefresh = useCallback(() => {
    fetchSources(nameFilter, categoryFilter);
  }, [nameFilter, categoryFilter, fetchSources]);

  // 現在のフィルター状態
  const currentFilter: SourceFilterParams = {
    name: nameFilter || undefined,
    categoryId: categoryFilter,
  };

  return (
    <div className="space-y-6">
      <SourcesFilter
        categories={categories}
        initialName={initialName}
        categoryId={categoryFilter}
        onNameChange={handleNameChange}
        onCategoryChange={handleCategoryChange}
        onClear={handleClear}
      />
      {isPending && <div className="text-sm text-muted-foreground">検索中...</div>}
      <SourcesTable sources={sources} categories={categories} onRefresh={handleRefresh} currentFilter={currentFilter} />
    </div>
  );
}

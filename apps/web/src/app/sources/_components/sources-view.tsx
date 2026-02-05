"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardTypeFilter } from "@/components/card-type-filter";
import type { CardTypeOption } from "@/types/application";
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
  cardTypes: CardTypeOption[];
};

export function SourcesView({ initialSources, categories, cardTypes }: Props) {
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
  const [selectedCardTypeId, setSelectedCardTypeId] = useState<string>("all");
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
  const fetchSources = useCallback((name: string, categoryId: string | null | undefined, cardTypeId?: string) => {
    const filter: SourceFilterParams = {};
    if (name) filter.name = name;
    if (categoryId !== undefined) filter.categoryId = categoryId;
    if (cardTypeId && cardTypeId !== "all") filter.cardTypeId = cardTypeId;

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
      fetchSources(name, categoryFilter, selectedCardTypeId);
      updateUrl(name, categoryFilter);
    },
    [nameFilter, categoryFilter, selectedCardTypeId, fetchSources, updateUrl]
  );

  // カテゴリフィルター変更ハンドラー（即座に反映）
  const handleCategoryChange = useCallback(
    (categoryId: string | null | undefined) => {
      setCategoryFilter(categoryId);
      fetchSources(nameFilter, categoryId, selectedCardTypeId);
      updateUrl(nameFilter, categoryId);
    },
    [nameFilter, selectedCardTypeId, fetchSources, updateUrl]
  );

  // カード種別フィルター変更ハンドラー
  const handleCardTypeChange = useCallback(
    (cardTypeId: string) => {
      setSelectedCardTypeId(cardTypeId);
      fetchSources(nameFilter, categoryFilter, cardTypeId);
    },
    [nameFilter, categoryFilter, fetchSources]
  );

  // クリアハンドラー
  const handleClear = useCallback(() => {
    setNameFilter("");
    setCategoryFilter(undefined);
    fetchSources("", undefined, selectedCardTypeId);
    updateUrl("", undefined);
  }, [selectedCardTypeId, fetchSources, updateUrl]);

  // カテゴリ更新後のリフレッシュ（現在のフィルターを維持）
  const handleRefresh = useCallback(() => {
    fetchSources(nameFilter, categoryFilter, selectedCardTypeId);
  }, [nameFilter, categoryFilter, selectedCardTypeId, fetchSources]);

  // 現在のフィルター状態
  const currentFilter: SourceFilterParams = {
    name: nameFilter || undefined,
    categoryId: categoryFilter,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <CardTypeFilter
          cardTypes={cardTypes}
          selectedCardTypeId={selectedCardTypeId}
          onCardTypeChange={handleCardTypeChange}
          disabled={isPending}
        />
      </div>
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

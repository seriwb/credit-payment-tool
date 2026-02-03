'use client';

import { useState, useCallback, useTransition, useRef } from 'react';
import { useDebounce } from 'react-use';
import { SourcesFilter } from './sources-filter';
import { SourcesTable } from './sources-table';
import {
  getPaymentSources,
  type PaymentSourceDetail,
  type CategoryOption,
  type SourceFilterParams,
} from '../_lib/actions';

type Props = {
  initialSources: PaymentSourceDetail[];
  categories: CategoryOption[];
};

export function SourcesView({ initialSources, categories }: Props) {
  const [sources, setSources] = useState(initialSources);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string | null | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const isInitialMount = useRef(true);

  // データ取得関数
  const fetchSources = useCallback(
    (name: string, categoryId: string | null | undefined) => {
      const filter: SourceFilterParams = {};
      if (name) filter.name = name;
      if (categoryId !== undefined) filter.categoryId = categoryId;

      startTransition(async () => {
        const newSources = await getPaymentSources(filter);
        setSources(newSources);
      });
    },
    []
  );

  // デバウンスされた名前フィルターが変更されたらデータを再取得
  useDebounce(
    () => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      fetchSources(nameFilter, categoryFilter);
    },
    1000,
    [nameFilter]
  );

  // カテゴリフィルター変更時は即座にデータを再取得
  const handleCategoryChange = useCallback(
    (categoryId: string | null | undefined) => {
      setCategoryFilter(categoryId);
      fetchSources(nameFilter, categoryId);
    },
    [nameFilter, fetchSources]
  );

  // フィルター変更ハンドラー
  const handleFilterChange = useCallback(
    (filter: SourceFilterParams) => {
      const newName = filter.name || '';
      const newCategoryId = filter.categoryId;

      // 名前の変更
      if (newName !== nameFilter) {
        setNameFilter(newName);
      }

      // カテゴリの変更（即座に反映）
      if (newCategoryId !== categoryFilter) {
        handleCategoryChange(newCategoryId);
      }
    },
    [nameFilter, categoryFilter, handleCategoryChange]
  );

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
        filter={currentFilter}
        onFilterChange={handleFilterChange}
        disabled={isPending}
      />
      {isPending && (
        <div className="text-sm text-muted-foreground">検索中...</div>
      )}
      <SourcesTable
        sources={sources}
        categories={categories}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

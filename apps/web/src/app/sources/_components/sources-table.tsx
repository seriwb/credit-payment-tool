"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { type SortOrder, TableSortHeader } from "@/components/table-sort-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  type CategoryOption,
  type PaymentSourceDetail,
  type SourceFilterParams,
  bulkUpdateSourceCategory,
  updateSourceCategory,
} from "../_lib/actions";
import { CategorySelectCell } from "./category-select-cell";

type Props = {
  sources: PaymentSourceDetail[];
  categories: CategoryOption[];
  onRefresh: () => void;
  currentFilter?: SourceFilterParams;
};

type SortKey = "name" | "categoryName" | "paymentCount" | "lastPaymentDate" | "totalAmount";

/**
 * 詳細ページへのリンクURLを構築（フィルター条件をreturnパラメータとして付与）
 */
function buildDetailLink(sourceId: string, currentFilter?: SourceFilterParams): string {
  const params = new URLSearchParams();
  if (currentFilter?.name) {
    params.set("returnName", currentFilter.name);
  }
  if (currentFilter?.categoryId !== undefined) {
    params.set("returnCategoryId", currentFilter.categoryId === null ? "null" : currentFilter.categoryId);
  }
  const query = params.toString();
  return `/sources/${sourceId}${query ? `?${query}` : ""}`;
}

const formatAmount = (amount: number) => {
  return `¥${amount.toLocaleString()}`;
};

const formatDate = (date: Date | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ja-JP");
};

export function SourcesTable({ sources, categories, onRefresh, currentFilter }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategoryId, setBulkCategoryId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleSort = useCallback(
    (key: string) => {
      const k = key as SortKey;
      if (k === sortKey) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(k);
        setSortOrder("asc");
      }
    },
    [sortKey]
  );

  // ソート済みデータを計算
  const sortedSources = useMemo(() => {
    return [...sources].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name, "ja");
      } else if (sortKey === "categoryName") {
        // nullは最後にソート
        if (a.categoryName === null && b.categoryName === null) cmp = 0;
        else if (a.categoryName === null) cmp = 1;
        else if (b.categoryName === null) cmp = -1;
        else cmp = a.categoryName.localeCompare(b.categoryName, "ja");
      } else if (sortKey === "paymentCount") {
        cmp = a.paymentCount - b.paymentCount;
      } else if (sortKey === "lastPaymentDate") {
        // nullは最後にソート
        if (a.lastPaymentDate === null && b.lastPaymentDate === null) cmp = 0;
        else if (a.lastPaymentDate === null) cmp = 1;
        else if (b.lastPaymentDate === null) cmp = -1;
        else cmp = new Date(a.lastPaymentDate).getTime() - new Date(b.lastPaymentDate).getTime();
      } else {
        cmp = a.totalAmount - b.totalAmount;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [sources, sortKey, sortOrder]);

  const isAllSelected = sources.length > 0 && selectedIds.size === sources.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < sources.length;

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sources.map((s) => s.id)));
    }
  }, [isAllSelected, sources]);

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleCategoryChange = useCallback(
    (sourceId: string, categoryId: string) => {
      const finalCategoryId = categoryId === "none" ? null : categoryId;
      startTransition(async () => {
        const result = await updateSourceCategory(sourceId, finalCategoryId);
        if (result.success) {
          toast.success(result.message);
          onRefresh();
        } else {
          toast.error(result.message);
        }
      });
    },
    [onRefresh]
  );

  const handleBulkUpdate = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.error("支払い元を選択してください");
      return;
    }
    if (!bulkCategoryId) {
      toast.error("カテゴリを選択してください");
      return;
    }

    const finalCategoryId = bulkCategoryId === "none" ? null : bulkCategoryId;
    startTransition(async () => {
      const result = await bulkUpdateSourceCategory(Array.from(selectedIds), finalCategoryId);
      if (result.success) {
        toast.success(result.message);
        setSelectedIds(new Set());
        setBulkCategoryId("");
        onRefresh();
      } else {
        toast.error(result.message);
      }
    });
  }, [selectedIds, bulkCategoryId, onRefresh]);

  const selectedCount = selectedIds.size;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">支払い元一覧</CardTitle>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selectedCount}件選択中</span>
              <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="カテゴリ" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  <SelectItem value="none">未分類</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleBulkUpdate} disabled={isPending || !bulkCategoryId}>
                一括適用
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sources.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">支払い元データがありません</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isSomeSelected ? "indeterminate" : isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="全選択"
                  />
                </TableHead>
                <TableHead>
                  <TableSortHeader
                    title="支払い元"
                    sortKey="name"
                    currentSortKey={sortKey}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead>
                  <TableSortHeader
                    title="カテゴリ"
                    sortKey="categoryName"
                    currentSortKey={sortKey}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="text-right">
                  <TableSortHeader
                    title="件数"
                    sortKey="paymentCount"
                    currentSortKey={sortKey}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-full justify-end"
                  />
                </TableHead>
                <TableHead className="text-right">
                  <TableSortHeader
                    title="最終支払日"
                    sortKey="lastPaymentDate"
                    currentSortKey={sortKey}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-full justify-end"
                  />
                </TableHead>
                <TableHead className="text-right">
                  <TableSortHeader
                    title="合計金額"
                    sortKey="totalAmount"
                    currentSortKey={sortKey}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-full justify-end"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSources.map((source) => (
                <TableRow key={source.id} data-state={selectedIds.has(source.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(source.id)}
                      onCheckedChange={(checked) => handleSelectOne(source.id, !!checked)}
                      aria-label={`${source.name}を選択`}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={buildDetailLink(source.id, currentFilter)}
                      className="font-medium text-primary hover:underline"
                    >
                      {source.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <CategorySelectCell
                      categoryId={source.categoryId}
                      categoryName={source.categoryName}
                      categories={categories}
                      isPending={isPending}
                      onCategoryChange={(value) => handleCategoryChange(source.id, value)}
                    />
                  </TableCell>
                  <TableCell className="text-right">{`${source.paymentCount.toLocaleString()}件`}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(source.lastPaymentDate)}
                  </TableCell>
                  <TableCell className="text-right font-mono">{formatAmount(source.totalAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

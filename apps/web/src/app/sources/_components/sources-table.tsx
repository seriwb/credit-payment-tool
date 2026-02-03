'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  updateSourceCategory,
  bulkUpdateSourceCategory,
  type PaymentSourceDetail,
  type CategoryOption,
} from '../_lib/actions';

// ソート関連の型
type SortKey =
  | 'name'
  | 'categoryName'
  | 'paymentCount'
  | 'lastPaymentDate'
  | 'totalAmount';
type SortOrder = 'asc' | 'desc';

type Props = {
  sources: PaymentSourceDetail[];
  categories: CategoryOption[];
  onRefresh: () => void;
};

export function SourcesTable({ sources, categories, onRefresh }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategoryId, setBulkCategoryId] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ja-JP');
  };

  // ソートアイコンを取得
  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="ml-1 h-4 w-4 inline" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 inline" />
    );
  };

  // ソートのトグル
  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortOrder('asc');
      }
    },
    [sortKey]
  );

  // ソートされたデータ
  const sortedSources = useMemo(() => {
    return [...sources].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'ja');
          break;
        case 'categoryName':
          // nullは最後にソート
          if (a.categoryName === null && b.categoryName === null) comparison = 0;
          else if (a.categoryName === null) comparison = 1;
          else if (b.categoryName === null) comparison = -1;
          else comparison = a.categoryName.localeCompare(b.categoryName, 'ja');
          break;
        case 'paymentCount':
          comparison = a.paymentCount - b.paymentCount;
          break;
        case 'lastPaymentDate':
          // nullは最後にソート
          if (a.lastPaymentDate === null && b.lastPaymentDate === null)
            comparison = 0;
          else if (a.lastPaymentDate === null) comparison = 1;
          else if (b.lastPaymentDate === null) comparison = -1;
          else {
            const dateA = new Date(a.lastPaymentDate).getTime();
            const dateB = new Date(b.lastPaymentDate).getTime();
            comparison = dateA - dateB;
          }
          break;
        case 'totalAmount':
          comparison = a.totalAmount - b.totalAmount;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [sources, sortKey, sortOrder]);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(sources.map((s) => s.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [sources]
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const handleCategoryChange = useCallback(
    (sourceId: string, categoryId: string) => {
      const finalCategoryId = categoryId === 'none' ? null : categoryId;
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
      toast.error('支払い元を選択してください');
      return;
    }
    if (!bulkCategoryId) {
      toast.error('カテゴリを選択してください');
      return;
    }

    const finalCategoryId = bulkCategoryId === 'none' ? null : bulkCategoryId;
    startTransition(async () => {
      const result = await bulkUpdateSourceCategory(
        Array.from(selectedIds),
        finalCategoryId
      );
      if (result.success) {
        toast.success(result.message);
        setSelectedIds(new Set());
        setBulkCategoryId('');
        onRefresh();
      } else {
        toast.error(result.message);
      }
    });
  }, [selectedIds, bulkCategoryId, onRefresh]);

  const isAllSelected =
    sources.length > 0 && selectedIds.size === sources.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < sources.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">支払い元一覧</CardTitle>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIds.size}件選択中
              </span>
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
              <Button
                size="sm"
                onClick={handleBulkUpdate}
                disabled={isPending || !bulkCategoryId}
              >
                一括適用
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sources.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            支払い元データがありません
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(ref) => {
                      if (ref) {
                        (ref as HTMLInputElement).indeterminate = isSomeSelected;
                      }
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center hover:text-foreground"
                    onClick={() => handleSort('name')}
                  >
                    支払い元{getSortIcon('name')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center hover:text-foreground"
                    onClick={() => handleSort('categoryName')}
                  >
                    カテゴリ{getSortIcon('categoryName')}
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    type="button"
                    className="flex items-center justify-end w-full hover:text-foreground"
                    onClick={() => handleSort('paymentCount')}
                  >
                    件数{getSortIcon('paymentCount')}
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    type="button"
                    className="flex items-center justify-end w-full hover:text-foreground"
                    onClick={() => handleSort('lastPaymentDate')}
                  >
                    最終支払日{getSortIcon('lastPaymentDate')}
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    type="button"
                    className="flex items-center justify-end w-full hover:text-foreground"
                    onClick={() => handleSort('totalAmount')}
                  >
                    合計金額{getSortIcon('totalAmount')}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(source.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(source.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/sources/${source.id}`}
                      className="hover:underline text-primary"
                    >
                      {source.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={source.categoryId || 'none'}
                      onValueChange={(value) =>
                        handleCategoryChange(source.id, value)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue>
                          {source.categoryName ? (
                            <Badge variant="outline">{source.categoryName}</Badge>
                          ) : (
                            <span className="text-muted-foreground">未分類</span>
                          )}
                        </SelectValue>
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
                  </TableCell>
                  <TableCell className="text-right">
                    {source.paymentCount.toLocaleString()}件
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(source.lastPaymentDate)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatAmount(source.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

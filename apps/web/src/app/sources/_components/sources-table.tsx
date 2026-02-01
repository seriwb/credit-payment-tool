'use client';

import { useState, useCallback, useTransition } from 'react';
import Link from 'next/link';
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

type Props = {
  sources: PaymentSourceDetail[];
  categories: CategoryOption[];
  onRefresh: () => void;
};

export function SourcesTable({ sources, categories, onRefresh }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategoryId, setBulkCategoryId] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

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
                <SelectContent>
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
                <TableHead>支払い元</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead className="text-right">件数</TableHead>
                <TableHead className="text-right">合計金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
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
                      <SelectContent>
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

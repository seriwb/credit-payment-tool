'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { CategoryOption, SourceFilterParams } from '../_lib/actions';

type Props = {
  categories: CategoryOption[];
  filter: SourceFilterParams;
  onFilterChange: (filter: SourceFilterParams) => void;
  disabled?: boolean;
};

export function SourcesFilter({
  categories,
  filter,
  onFilterChange,
  disabled,
}: Props) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, name: e.target.value || undefined });
  };

  const handleCategoryChange = (value: string) => {
    let categoryId: string | null | undefined;
    if (value === 'all') {
      categoryId = undefined; // 全て
    } else if (value === 'none') {
      categoryId = null; // 未分類
    } else {
      categoryId = value; // 特定のカテゴリ
    }
    onFilterChange({ ...filter, categoryId });
  };

  const handleClear = () => {
    onFilterChange({});
  };

  // フィルターが設定されているかどうか
  const hasFilter = filter.name || filter.categoryId !== undefined;

  // カテゴリSelectの値を決定
  const categoryValue =
    filter.categoryId === undefined
      ? 'all'
      : filter.categoryId === null
        ? 'none'
        : filter.categoryId;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[200px] max-w-[300px]">
        <Input
          placeholder="支払い元名で検索..."
          value={filter.name || ''}
          onChange={handleNameChange}
          disabled={disabled}
        />
      </div>
      <div className="w-[180px]">
        <Select
          value={categoryValue}
          onValueChange={handleCategoryChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent className="max-h-[250px]">
            <SelectItem value="all">すべてのカテゴリ</SelectItem>
            <SelectItem value="none">未分類</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          クリア
        </Button>
      )}
    </div>
  );
}

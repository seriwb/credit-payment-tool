"use client";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoryOption } from "../_lib/actions";

type Props = {
  categoryId: string | null;
  categoryName: string | null;
  categories: CategoryOption[];
  isPending: boolean;
  onCategoryChange: (categoryId: string) => void;
};

/**
 * カテゴリ選択セルコンポーネント（インライン編集用）
 */
export function CategorySelectCell({ categoryId, categoryName, categories, isPending, onCategoryChange }: Props) {
  return (
    <Select value={categoryId || "none"} onValueChange={onCategoryChange} disabled={isPending}>
      <SelectTrigger className="w-[150px]">
        <SelectValue>
          {categoryName ? (
            <Badge variant="outline">{categoryName}</Badge>
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
  );
}

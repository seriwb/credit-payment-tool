"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useDebounce } from "react-use";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoryOption } from "../_lib/actions";

type Props = {
  categories: CategoryOption[];
  initialName?: string;
  categoryId?: string | null;
  onNameChange: (name: string) => void;
  onCategoryChange: (categoryId: string | null | undefined) => void;
  onClear: () => void;
  disabled?: boolean;
};

export function SourcesFilter({
  categories,
  initialName,
  categoryId,
  onNameChange,
  onCategoryChange,
  onClear,
  disabled,
}: Props) {
  const [localName, setLocalName] = useState(initialName || "");

  useDebounce(
    () => {
      onNameChange(localName);
    },
    1000,
    [localName]
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    let newCategoryId: string | null | undefined;
    if (value === "all") {
      newCategoryId = undefined; // 全て
    } else if (value === "none") {
      newCategoryId = null; // 未分類
    } else {
      newCategoryId = value; // 特定のカテゴリ
    }
    onCategoryChange(newCategoryId);
  };

  const handleClear = () => {
    setLocalName("");
    onClear();
  };

  const hasFilter = localName || categoryId !== undefined;
  const categoryValue = categoryId === undefined ? "all" : categoryId === null ? "none" : categoryId;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="max-w-[300px] min-w-[200px] flex-1">
        <Input placeholder="支払い元名で検索..." value={localName} onChange={handleNameChange} disabled={disabled} />
      </div>
      <div className="w-[180px]">
        <Select value={categoryValue} onValueChange={handleCategoryChange} disabled={disabled}>
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
        <Button variant="ghost" size="sm" onClick={handleClear} disabled={disabled} className="text-muted-foreground">
          <X className="mr-1 h-4 w-4" />
          クリア
        </Button>
      )}
    </div>
  );
}

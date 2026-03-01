"use client";

import type { Table } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

type HeaderProps<TData> = {
  table: Table<TData>;
};

/**
 * テーブルヘッダーの全選択チェックボックス
 */
export function DataTableCheckboxHeader<TData>({ table }: HeaderProps<TData>) {
  const isAllSelected = table.getIsAllPageRowsSelected();
  const isSomeSelected = table.getIsSomePageRowsSelected();

  return (
    <Checkbox
      checked={isAllSelected}
      ref={(ref) => {
        if (ref) {
          (ref as HTMLInputElement).indeterminate = isSomeSelected;
        }
      }}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="全て選択"
    />
  );
}

type CellProps = {
  row: { id: string; getIsSelected: () => boolean; toggleSelected: (value?: boolean) => void };
};

/**
 * テーブル行の選択チェックボックス
 */
export function DataTableCheckboxCell({ row }: CellProps) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="行を選択"
    />
  );
}

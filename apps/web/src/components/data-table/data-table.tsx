"use client";

import type { ReactNode } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type TableState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableEmpty } from "./data-table-empty";

// ファクトリ関数をモジュールレベルでキャッシュして毎レンダリングの再生成を防ぐ
const coreRowModel = getCoreRowModel();
const sortedRowModel = getSortedRowModel();

// カラムメタデータの型拡張
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/consistent-type-definitions
  interface ColumnMeta<TData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
  }
}

type Props<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sorting?: SortingState; // ソート機能
  onSortingChange?: OnChangeFn<SortingState>; // ソート変更時のコールバック
  rowSelection?: RowSelectionState; // 行選択機能
  onRowSelectionChange?: OnChangeFn<RowSelectionState>; // 行選択変更時のコールバック
  getRowId?: (row: TData) => string; // 行ID取得関数
  footer?: ReactNode; // フッター
  emptyMessage?: string; // 空状態
};

/**
 * TanStack Tableを使用した汎用DataTableコンポーネント
 */
export const DataTable = <TData, TValue>({
  columns,
  data,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  footer,
  emptyMessage = "データがありません",
}: Props<TData, TValue>) => {
  "use no memo";

  // テーブル状態オブジェクトの構築
  const tableState: Partial<TableState> = {};
  if (sorting !== undefined) tableState.sorting = sorting;
  if (rowSelection !== undefined) tableState.rowSelection = rowSelection;

  // MEMO: https://github.com/TanStack/table/issues/5567
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: coreRowModel,
    getSortedRowModel: sortedRowModel,
    state: tableState,
    ...(onSortingChange && { onSortingChange }),
    ...(onRowSelectionChange && { onRowSelectionChange }),
    manualSorting: false,
    enableRowSelection: !!onRowSelectionChange,
    ...(getRowId && { getRowId }),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className={header.column.columnDef.meta?.headerClassName}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className={cell.column.columnDef.meta?.cellClassName}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <DataTableEmpty message={emptyMessage} colSpan={columns.length} />
        )}
      </TableBody>
      {footer}
    </Table>
  );
};

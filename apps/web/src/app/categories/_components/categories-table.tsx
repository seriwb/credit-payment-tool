"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryDetail } from "../_lib/actions";

type Props = {
  categories: CategoryDetail[];
  onEdit: (category: CategoryDetail) => void;
  onDelete: (category: CategoryDetail) => void;
};

export function CategoriesTable({ categories, onEdit, onDelete }: Props) {
  // カラム定義（onEdit/onDeleteが変わらない限り再生成しない）
  const columns: ColumnDef<CategoryDetail>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "カテゴリ名",
        cell: ({ row }) => <Badge variant="outline">{row.original.name}</Badge>,
      },
      {
        accessorKey: "displayOrder",
        header: "表示順",
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right",
        },
      },
      {
        accessorKey: "sourceCount",
        header: "割り当て数",
        cell: ({ row }) => `${row.original.sourceCount}件`,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right",
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row.original)}
              disabled={row.original.sourceCount > 0}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
        meta: {
          headerClassName: "w-[100px]",
        },
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">カテゴリ一覧</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable columns={columns} data={categories} emptyMessage="カテゴリがありません" />
      </CardContent>
    </Card>
  );
}

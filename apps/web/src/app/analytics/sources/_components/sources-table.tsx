"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SourceData } from "../../_lib/actions";

type SortKey = "sourceName" | "totalAmount" | "paymentCount";
type SortOrder = "asc" | "desc";

type Props = {
  data: SourceData[];
};

// ソートボタンコンポーネント
type SortButtonProps = {
  columnKey: SortKey;
  children: React.ReactNode;
  onSort: (key: SortKey) => void;
};

function SortButton({ columnKey, children, onSort }: SortButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => onSort(columnKey)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function SourcesTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("totalAmount");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // ソート処理
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" ? aValue.localeCompare(bValue, "ja") : bValue.localeCompare(aValue, "ja");
    }

    return sortOrder === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  });

  // 合計値を計算
  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.paymentCount, 0);

  // ソート切り替え
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  if (data.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">データがありません</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>
            <SortButton columnKey="sourceName" onSort={handleSort}>
              支払い元名
            </SortButton>
          </TableHead>
          <TableHead className="text-right">
            <SortButton columnKey="paymentCount" onSort={handleSort}>
              支払い回数
            </SortButton>
          </TableHead>
          <TableHead className="text-right">
            <SortButton columnKey="totalAmount" onSort={handleSort}>
              合計金額
            </SortButton>
          </TableHead>
          <TableHead className="w-[100px] text-right">構成比</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item, index) => {
          const ratio = totalAmount > 0 ? (item.totalAmount / totalAmount) * 100 : 0;
          return (
            <TableRow key={item.sourceId}>
              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
              <TableCell className="font-medium">
                <Link href={`/sources/${item.sourceId}`} className="text-primary underline-offset-4 hover:underline">
                  {item.sourceName}
                </Link>
              </TableCell>
              <TableCell className="text-right">{item.paymentCount.toLocaleString()}回</TableCell>
              <TableCell className="text-right">¥{item.totalAmount.toLocaleString()}</TableCell>
              <TableCell className="text-right text-muted-foreground">{ratio.toFixed(1)}%</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2} className="font-bold">
            合計
          </TableCell>
          <TableCell className="text-right font-bold">{totalCount.toLocaleString()}回</TableCell>
          <TableCell className="text-right font-bold">¥{totalAmount.toLocaleString()}</TableCell>
          <TableCell className="text-right">100%</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

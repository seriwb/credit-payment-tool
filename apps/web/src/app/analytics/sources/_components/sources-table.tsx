"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { type SortOrder, TableSortHeader } from "@/components/table-sort-header";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SourceData } from "../../_lib/actions";

type Props = {
  data: SourceData[];
};

type SortKey = "sourceName" | "paymentCount" | "totalAmount";

export function SourcesTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("totalAmount");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // 合計値を計算
  const totalAmount = useMemo(() => data.reduce((sum, item) => sum + item.totalAmount, 0), [data]);
  const totalCount = useMemo(() => data.reduce((sum, item) => sum + item.paymentCount, 0), [data]);

  const handleSort = useCallback(
    (key: string) => {
      const k = key as SortKey;
      if (k === sortKey) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(k);
        setSortOrder("desc");
      }
    },
    [sortKey]
  );

  // ソート済みデータを計算
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "sourceName") {
        cmp = a.sourceName.localeCompare(b.sourceName, "ja");
      } else if (sortKey === "paymentCount") {
        cmp = a.paymentCount - b.paymentCount;
      } else {
        cmp = a.totalAmount - b.totalAmount;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortOrder]);

  if (data.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">データがありません</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>
            <TableSortHeader
              title="支払い元名"
              sortKey="sourceName"
              currentSortKey={sortKey}
              currentSortOrder={sortOrder}
              onSort={handleSort}
            />
          </TableHead>
          <TableHead className="text-right">
            <TableSortHeader
              title="支払い回数"
              sortKey="paymentCount"
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
          <TableHead className="w-[100px] text-right">構成比</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item, index) => {
          const ratio = totalAmount > 0 ? (item.totalAmount / totalAmount) * 100 : 0;
          return (
            <TableRow key={item.sourceId}>
              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
              <TableCell>
                <Link
                  href={`/sources/${item.sourceId}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {item.sourceName}
                </Link>
              </TableCell>
              <TableCell className="text-right">{`${item.paymentCount.toLocaleString()}回`}</TableCell>
              <TableCell className="text-right">{`¥${item.totalAmount.toLocaleString()}`}</TableCell>
              <TableCell className="text-right text-muted-foreground">{`${ratio.toFixed(1)}%`}</TableCell>
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

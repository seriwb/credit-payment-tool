"use client";

import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { SourceData } from "../_lib/actions";

type Props = {
  data: SourceData[];
  startMonth?: string;
  endMonth?: string;
};

const chartConfig = {
  totalAmount: {
    label: "金額",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function SourceChart({ data, startMonth, endMonth }: Props) {
  // 詳細ページへのリンクを生成
  const detailUrl = (() => {
    const params = new URLSearchParams();
    if (startMonth) params.set("start", startMonth);
    if (endMonth) params.set("end", endMonth);
    const query = params.toString();
    return `/analytics/sources${query ? `?${query}` : ""}`;
  })();
  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    }
    return amount.toLocaleString();
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">支払い元別 TOP10</CardTitle>
          <Link href={detailUrl} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            すべて表示 →
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">データがありません</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">支払い元別 TOP10</CardTitle>
        <Link href={detailUrl} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          すべて表示 →
        </Link>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatAmount} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="sourceName" tick={{ fontSize: 11 }} width={75} />
              <ChartTooltip
                content={
                  <ChartTooltipContent formatter={(value) => [`¥${Number(value).toLocaleString()}`, "支払い金額"]} />
                }
              />
              <Bar dataKey="totalAmount" fill="var(--color-totalAmount)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { SourceData } from "../../_lib/actions";

type Props = {
  data: SourceData[];
};

const chartConfig = {
  totalAmount: {
    label: "金額",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function SourcesChart({ data }: Props) {
  // TOP20を表示
  const chartData = data.slice(0, 20);

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    }
    return amount.toLocaleString();
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">支払い元別 TOP20</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[500px] items-center justify-center text-muted-foreground">データがありません</div>
        </CardContent>
      </Card>
    );
  }

  // データ件数に応じてグラフの高さを調整
  const chartHeight = Math.max(300, chartData.length * 30);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          支払い元別 TOP20
          {data.length > 20 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">（全{data.length}件中）</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
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

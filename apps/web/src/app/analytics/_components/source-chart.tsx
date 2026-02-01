'use client';

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { SourceData } from '../_lib/actions';

type Props = {
  data: SourceData[];
};

const chartConfig = {
  totalAmount: {
    label: '金額',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function SourceChart({ data }: Props) {
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
          <CardTitle className="text-base">支払い元別 TOP10</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            データがありません
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">支払い元別 TOP10</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatAmount} tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="sourceName"
                tick={{ fontSize: 11 }}
                width={75}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`¥${Number(value).toLocaleString()}`, '支払い金額']}
                  />
                }
              />
              <Bar
                dataKey="totalAmount"
                fill="var(--color-totalAmount)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

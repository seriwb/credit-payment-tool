'use client';

import {
  Line,
  LineChart,
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
import type { MonthlyData } from '../_lib/actions';

type Props = {
  data: MonthlyData[];
};

const chartConfig = {
  totalAmount: {
    label: '金額',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function MonthlyChart({ data }: Props) {
  const formatYearMonth = (yearMonth: string) => {
    return `${yearMonth.slice(2, 4)}/${yearMonth.slice(4, 6)}`;
  };

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    }
    return amount.toLocaleString();
  };

  const chartData = data.map((item) => ({
    ...item,
    label: formatYearMonth(item.yearMonth),
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">月別推移</CardTitle>
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
        <CardTitle className="text-base">月別推移</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatAmount} tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`¥${Number(value).toLocaleString()}`, '支払い金額']}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="totalAmount"
                stroke="var(--color-totalAmount)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-totalAmount)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

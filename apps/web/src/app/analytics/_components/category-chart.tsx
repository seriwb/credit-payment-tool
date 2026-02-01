'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { CategoryData } from '../_lib/actions';

type Props = {
  data: CategoryData[];
};

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00C49F',
];

export function CategoryChart({ data }: Props) {
  // カテゴリごとにチャート設定を生成
  const chartConfig = data.reduce(
    (acc, item, index) => {
      acc[item.categoryName] = {
        label: item.categoryName,
        color: COLORS[index % COLORS.length],
      };
      return acc;
    },
    {} as ChartConfig
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">カテゴリ別内訳</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            データがありません
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">カテゴリ別内訳</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="totalAmount"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name }) => `${name}`}
                labelLine={true}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const percent = ((Number(value) / totalAmount) * 100).toFixed(1);
                      return [
                        `¥${Number(value).toLocaleString()} (${percent}%)`,
                        name,
                      ];
                    }}
                  />
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

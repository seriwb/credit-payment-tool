'use client';

import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUp, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DashboardData } from '../_lib/actions';

type Props = {
  data: DashboardData;
};

export function DashboardView({ data }: Props) {
  const formatYearMonth = (yearMonth: string) => {
    return `${yearMonth.slice(0, 4)}年${yearMonth.slice(4, 6)}月`;
  };

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 前月比計算
  const monthDiff =
    data.currentMonth && data.previousMonth
      ? data.currentMonth.totalAmount - data.previousMonth.totalAmount
      : null;

  const monthDiffPercent =
    data.currentMonth && data.previousMonth && data.previousMonth.totalAmount > 0
      ? ((data.currentMonth.totalAmount - data.previousMonth.totalAmount) /
          data.previousMonth.totalAmount) *
        100
      : null;

  return (
    <div className="space-y-6">
      {/* 今月の概要 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今月の支払い
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.currentMonth ? (
              <>
                <p className="text-2xl font-bold">
                  {formatAmount(data.currentMonth.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.currentMonth.paymentCount}件の支払い
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">データなし</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              先月の支払い
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.previousMonth ? (
              <>
                <p className="text-2xl font-bold">
                  {formatAmount(data.previousMonth.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.previousMonth.paymentCount}件の支払い
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">データなし</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              前月比
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthDiff !== null ? (
              <div className="flex items-center gap-2">
                {monthDiff > 0 ? (
                  <ArrowUp className="h-5 w-5 text-destructive" />
                ) : monthDiff < 0 ? (
                  <ArrowDown className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                )}
                <p className="text-2xl font-bold">
                  {monthDiff > 0 ? '+' : ''}
                  {formatAmount(monthDiff)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">比較データなし</p>
            )}
            {monthDiffPercent !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                {monthDiffPercent > 0 ? '+' : ''}
                {monthDiffPercent.toFixed(1)}%
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              インポート
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.recentImports.length}件</p>
            <Link href="/import">
              <Button variant="link" className="p-0 h-auto mt-1">
                <Upload className="h-3 w-3 mr-1" />
                インポートする
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 今月の支払い元TOP5 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">今月の支払い元 TOP5</CardTitle>
              <Link href="/sources">
                <Button variant="ghost" size="sm">
                  すべて表示
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.topSources.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                データがありません
              </p>
            ) : (
              <div className="space-y-3">
                {data.topSources.map((source, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <span className="text-sm">{source.sourceName}</span>
                    </div>
                    <span className="font-mono text-sm">
                      {formatAmount(source.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* カテゴリ別内訳 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">今月のカテゴリ別内訳</CardTitle>
              <Link href="/analytics">
                <Button variant="ghost" size="sm">
                  詳細分析
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.categoryBreakdown.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                データがありません
              </p>
            ) : (
              <div className="space-y-3">
                {data.categoryBreakdown.slice(0, 5).map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <Badge variant="outline">{category.categoryName}</Badge>
                    <span className="font-mono text-sm">
                      {formatAmount(category.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 最近のインポート */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">最近のインポート</CardTitle>
            <Link href="/import">
              <Button variant="ghost" size="sm">
                すべて表示
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentImports.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                インポート履歴がありません
              </p>
              <Link href="/import">
                <Button variant="outline" className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  CSVをインポート
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ファイル名</TableHead>
                  <TableHead>対象年月</TableHead>
                  <TableHead className="text-right">件数</TableHead>
                  <TableHead>インポート日時</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentImports.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">
                      {item.fileName}
                    </TableCell>
                    <TableCell>{formatYearMonth(item.yearMonth)}</TableCell>
                    <TableCell className="text-right">
                      {item.paymentCount}件
                    </TableCell>
                    <TableCell>{formatDate(item.importedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

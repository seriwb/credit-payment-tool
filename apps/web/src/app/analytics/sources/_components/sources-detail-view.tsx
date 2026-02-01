'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { SourcesChart } from './sources-chart';
import { SourcesTable } from './sources-table';
import { getSourceAnalytics, type SourceData } from '../../_lib/actions';

type Props = {
  initialData: SourceData[];
  yearMonths: string[];
  initialStartMonth?: string;
  initialEndMonth?: string;
};

export function SourcesDetailView({
  initialData,
  yearMonths,
  initialStartMonth,
  initialEndMonth,
}: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [startMonth, setStartMonth] = useState<string>(initialStartMonth ?? '');
  const [endMonth, setEndMonth] = useState<string>(initialEndMonth ?? '');
  const [isPending, startTransition] = useTransition();

  // 年月をフォーマット
  const formatYearMonth = (yearMonth: string) => {
    return `${yearMonth.slice(0, 4)}年${yearMonth.slice(4, 6)}月`;
  };

  // URLを更新
  const updateUrl = useCallback(
    (start: string, end: string) => {
      const params = new URLSearchParams();
      if (start) params.set('start', start);
      if (end) params.set('end', end);
      const query = params.toString();
      router.push(`/analytics/sources${query ? `?${query}` : ''}`);
    },
    [router]
  );

  // 期間変更ハンドラー
  const handlePeriodChange = useCallback(
    (start: string, end: string) => {
      startTransition(async () => {
        const startYM = start || undefined;
        const endYM = end || undefined;

        // 全件取得（limitを大きな値に）
        const sourceData = await getSourceAnalytics(startYM, endYM, 10000);
        setData(sourceData);
        updateUrl(start, end);
      });
    },
    [updateUrl]
  );

  const handleStartChange = useCallback(
    (value: string) => {
      const newStart = value === 'all' ? '' : value;
      setStartMonth(newStart);
      handlePeriodChange(newStart, endMonth);
    },
    [endMonth, handlePeriodChange]
  );

  const handleEndChange = useCallback(
    (value: string) => {
      const newEnd = value === 'all' ? '' : value;
      setEndMonth(newEnd);
      handlePeriodChange(startMonth, newEnd);
    },
    [startMonth, handlePeriodChange]
  );

  // サマリー計算
  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.paymentCount, 0);

  return (
    <div className="space-y-6">
      {/* 戻るリンク */}
      <Link
        href="/analytics"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        分析ページに戻る
      </Link>

      {/* 期間選択 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">期間選択</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">開始:</span>
              <Select value={startMonth || 'all'} onValueChange={handleStartChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="指定なし" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">指定なし</SelectItem>
                  {yearMonths.map((ym) => (
                    <SelectItem key={ym} value={ym}>
                      {formatYearMonth(ym)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-muted-foreground">〜</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">終了:</span>
              <Select value={endMonth || 'all'} onValueChange={handleEndChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="指定なし" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">指定なし</SelectItem>
                  {yearMonths.map((ym) => (
                    <SelectItem key={ym} value={ym}>
                      {formatYearMonth(ym)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isPending && (
              <span className="text-sm text-muted-foreground ml-4">
                読み込み中...
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              支払い元数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.length.toLocaleString()}件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              合計金額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              合計件数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCount.toLocaleString()}回</p>
          </CardContent>
        </Card>
      </div>

      {/* グラフ */}
      <SourcesChart data={data} />

      {/* テーブル */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">支払い元一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <SourcesTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
}

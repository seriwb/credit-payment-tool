import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SourcePaymentsTable } from './source-payments-table';
import type { SourceDetailResult } from '../_lib/actions';

type Props = {
  data: SourceDetailResult;
};

/**
 * 金額をフォーマット
 */
function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function SourceDetailView({ data }: Props) {
  const { source, payments, summary } = data;

  return (
    <div className="space-y-6">
      {/* 戻るリンク */}
      <Link
        href="/sources"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        支払い元管理に戻る
      </Link>

      {/* ヘッダー情報 */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{source.name}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">カテゴリ:</span>
          {source.categoryName ? (
            <Badge variant="outline">{source.categoryName}</Badge>
          ) : (
            <Badge variant="secondary">未分類</Badge>
          )}
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">支払い件数</div>
            <div className="text-2xl font-bold">
              {summary.paymentCount.toLocaleString()}件
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">合計金額</div>
            <div className="text-2xl font-bold font-mono">
              {formatAmount(summary.totalAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">平均金額</div>
            <div className="text-2xl font-bold font-mono">
              {formatAmount(summary.averageAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 支払い一覧テーブル */}
      <SourcePaymentsTable payments={payments} summary={summary} />
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SourceDetailResult } from "../_lib/actions";
import { SourcePaymentsTable } from "./source-payments-table";

type ReturnParams = {
  name?: string;
  categoryId?: string | null;
};

type Props = {
  data: SourceDetailResult;
  returnParams?: ReturnParams;
};

/**
 * 一覧ページへの戻りリンクURLを構築
 */
function buildBackLink(returnParams?: ReturnParams): string {
  const params = new URLSearchParams();
  if (returnParams?.name) {
    params.set("name", returnParams.name);
  }
  if (returnParams?.categoryId !== undefined) {
    params.set("categoryId", returnParams.categoryId === null ? "null" : returnParams.categoryId);
  }
  const query = params.toString();
  return `/sources${query ? `?${query}` : ""}`;
}

/**
 * 金額をフォーマット
 */
function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function SourceDetailView({ data, returnParams }: Props) {
  const { source, payments, summary, yearlyTotals } = data;

  return (
    <div className="space-y-6">
      {/* 戻るリンク */}
      <Link
        href={buildBackLink(returnParams)}
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
            <div className="text-2xl font-bold">{summary.paymentCount.toLocaleString()}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">合計金額</div>
            <div className="font-mono text-2xl font-bold">{formatAmount(summary.totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">平均金額</div>
            <div className="font-mono text-2xl font-bold">{formatAmount(summary.averageAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 年ごとの支払い合計 */}
      {yearlyTotals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">年ごとの支払い合計</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>年</TableHead>
                  <TableHead className="text-right">件数</TableHead>
                  <TableHead className="text-right">合計金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyTotals.map((yearly) => (
                  <TableRow key={yearly.year}>
                    <TableCell className="font-medium">{yearly.year}年</TableCell>
                    <TableCell className="text-right">{yearly.paymentCount.toLocaleString()}件</TableCell>
                    <TableCell className="text-right font-mono">{formatAmount(yearly.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 支払い一覧テーブル */}
      <SourcePaymentsTable payments={payments} summary={summary} />
    </div>
  );
}

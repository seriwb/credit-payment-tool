import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PaymentItem, SourceSummary } from '../_lib/actions';

type Props = {
  payments: PaymentItem[];
  summary: SourceSummary;
};

/**
 * 年月文字列をフォーマット（YYYYMM → YYYY年MM月）
 */
function formatYearMonth(yearMonth: string): string {
  const year = yearMonth.slice(0, 4);
  const month = yearMonth.slice(4, 6);
  return `${year}年${parseInt(month, 10)}月`;
}

/**
 * 日付をフォーマット（YYYY/MM/DD）
 */
function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * 金額をフォーマット
 */
function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function SourcePaymentsTable({ payments, summary }: Props) {
  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">支払い履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            支払いデータがありません
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">支払い履歴</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日付</TableHead>
              <TableHead className="text-right">金額</TableHead>
              <TableHead className="text-right">個数</TableHead>
              <TableHead>年月</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatAmount(payment.amount)}
                </TableCell>
                <TableCell className="text-right">{payment.quantity}</TableCell>
                <TableCell>{formatYearMonth(payment.yearMonth)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>
                {summary.paymentCount.toLocaleString()}件の支払い
              </TableCell>
              <TableCell colSpan={2} className="text-right font-mono">
                合計: {formatAmount(summary.totalAmount)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}

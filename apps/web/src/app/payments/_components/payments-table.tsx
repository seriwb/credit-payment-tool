'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PaymentDetail } from '../_lib/actions';

type Props = {
  payments: PaymentDetail[];
  totalAmount: number;
};

export function PaymentsTable({ payments, totalAmount }: Props) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            データがありません
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>支払い元</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead className="text-right">個数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">
                    {formatDate(payment.paymentDate)}
                  </TableCell>
                  <TableCell>{payment.sourceName}</TableCell>
                  <TableCell>
                    {payment.categoryName ? (
                      <Badge variant="outline">{payment.categoryName}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">未分類</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatAmount(payment.amount)}
                  </TableCell>
                  <TableCell className="text-right">{payment.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="border-t p-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {payments.length}件の支払い
          </span>
          <div className="text-right">
            <span className="text-sm text-muted-foreground mr-2">合計:</span>
            <span className="text-lg font-bold">{formatAmount(totalAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

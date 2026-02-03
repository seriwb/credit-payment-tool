"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type PaymentDetail, getPaymentsByMonth } from "../_lib/actions";
import { MonthSelector } from "./month-selector";
import { PaymentsTable } from "./payments-table";

type Props = {
  initialYearMonths: string[];
  initialPayments: PaymentDetail[];
  initialTotalAmount: number;
  initialYearMonth: string | null;
};

export function PaymentsView({ initialYearMonths, initialPayments, initialTotalAmount, initialYearMonth }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [yearMonths] = useState(initialYearMonths);
  const [selectedMonth, setSelectedMonth] = useState(initialYearMonth || (initialYearMonths[0] ?? ""));
  const [payments, setPayments] = useState<PaymentDetail[]>(initialPayments);
  const [totalAmount, setTotalAmount] = useState(initialTotalAmount);

  const handleMonthChange = useCallback(
    (yearMonth: string) => {
      setSelectedMonth(yearMonth);
      router.push(`/payments?month=${yearMonth}`);

      startTransition(async () => {
        const result = await getPaymentsByMonth(yearMonth);
        setPayments(result.payments);
        setTotalAmount(result.totalAmount);
      });
    },
    [router]
  );

  // URLパラメータの変更を監視
  useEffect(() => {
    const monthParam = searchParams.get("month");
    if (monthParam && monthParam !== selectedMonth && yearMonths.includes(monthParam)) {
      setSelectedMonth(monthParam);
      startTransition(async () => {
        const result = await getPaymentsByMonth(monthParam);
        setPayments(result.payments);
        setTotalAmount(result.totalAmount);
      });
    }
  }, [searchParams, selectedMonth, yearMonths]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <MonthSelector yearMonths={yearMonths} selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />
        {isPending && <span className="text-sm text-muted-foreground">読み込み中...</span>}
      </div>

      {selectedMonth ? (
        <PaymentsTable payments={payments} totalAmount={totalAmount} />
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">データがありません。CSVをインポートしてください。</p>
        </div>
      )}
    </div>
  );
}

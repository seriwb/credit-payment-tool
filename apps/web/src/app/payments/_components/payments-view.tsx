"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardTypeFilter } from "@/components/card-type-filter";
import type { CardTypeOption } from "@/types/application";
import { type PaymentDetail, getAvailableYearMonths, getPaymentsByMonth } from "../_lib/actions";
import { MonthSelector } from "./month-selector";
import { PaymentsTable } from "./payments-table";

type Props = {
  initialYearMonths: string[];
  initialPayments: PaymentDetail[];
  initialTotalAmount: number;
  initialYearMonth: string | null;
  cardTypes: CardTypeOption[];
};

export function PaymentsView({
  initialYearMonths,
  initialPayments,
  initialTotalAmount,
  initialYearMonth,
  cardTypes,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [yearMonths, setYearMonths] = useState(initialYearMonths);
  const [selectedMonth, setSelectedMonth] = useState(initialYearMonth || (initialYearMonths[0] ?? ""));
  const [payments, setPayments] = useState<PaymentDetail[]>(initialPayments);
  const [totalAmount, setTotalAmount] = useState(initialTotalAmount);
  const [selectedCardTypeId, setSelectedCardTypeId] = useState<string>("all");

  const fetchData = useCallback((yearMonth: string, cardTypeId: string) => {
    startTransition(async () => {
      const ctId = cardTypeId === "all" ? undefined : cardTypeId;
      const newYearMonths = await getAvailableYearMonths(ctId);
      setYearMonths(newYearMonths);

      const targetMonth = newYearMonths.includes(yearMonth) ? yearMonth : (newYearMonths[0] ?? "");
      if (targetMonth) {
        const result = await getPaymentsByMonth(targetMonth, ctId);
        setPayments(result.payments);
        setTotalAmount(result.totalAmount);
        setSelectedMonth(targetMonth);
      } else {
        setPayments([]);
        setTotalAmount(0);
        setSelectedMonth("");
      }
    });
  }, []);

  const handleMonthChange = useCallback(
    (yearMonth: string) => {
      setSelectedMonth(yearMonth);
      router.push(`/payments?month=${yearMonth}`);

      startTransition(async () => {
        const ctId = selectedCardTypeId === "all" ? undefined : selectedCardTypeId;
        const result = await getPaymentsByMonth(yearMonth, ctId);
        setPayments(result.payments);
        setTotalAmount(result.totalAmount);
      });
    },
    [router, selectedCardTypeId]
  );

  const handleCardTypeChange = useCallback(
    (cardTypeId: string) => {
      setSelectedCardTypeId(cardTypeId);
      fetchData(selectedMonth, cardTypeId);
    },
    [selectedMonth, fetchData]
  );

  useEffect(() => {
    const monthParam = searchParams.get("month");
    if (monthParam && monthParam !== selectedMonth && yearMonths.includes(monthParam)) {
      startTransition(async () => {
        setSelectedMonth(monthParam);
        const ctId = selectedCardTypeId === "all" ? undefined : selectedCardTypeId;
        const result = await getPaymentsByMonth(monthParam, ctId);
        setPayments(result.payments);
        setTotalAmount(result.totalAmount);
      });
    }
  }, [searchParams, selectedMonth, yearMonths, selectedCardTypeId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MonthSelector yearMonths={yearMonths} selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />
          <CardTypeFilter
            cardTypes={cardTypes}
            selectedCardTypeId={selectedCardTypeId}
            onCardTypeChange={handleCardTypeChange}
            disabled={isPending}
          />
        </div>
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

import { PaymentsView } from './_components/payments-view';
import { getPaymentsByMonth, getAvailableYearMonths } from './_lib/actions';

type Props = {
  searchParams: Promise<{ month?: string }>;
};

export default async function PaymentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const yearMonths = await getAvailableYearMonths();
  const selectedMonth = params.month || yearMonths[0] || null;

  let payments: Awaited<ReturnType<typeof getPaymentsByMonth>>['payments'] = [];
  let totalAmount = 0;

  if (selectedMonth) {
    const result = await getPaymentsByMonth(selectedMonth);
    payments = result.payments;
    totalAmount = result.totalAmount;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">支払い一覧</h2>
        <p className="text-muted-foreground mt-1">
          月別の支払い履歴を確認できます
        </p>
      </div>
      <PaymentsView
        initialYearMonths={yearMonths}
        initialPayments={payments}
        initialTotalAmount={totalAmount}
        initialYearMonth={selectedMonth}
      />
    </div>
  );
}

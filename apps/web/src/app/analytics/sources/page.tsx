import { getCardTypes } from "@/app/_lib/actions";
import { getSourceAnalytics, getYearMonthRange } from "../_lib/actions";
import { SourcesDetailView } from "./_components/sources-detail-view";
import { sourcesDetailParamsSchema } from "./_lib/schemas";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>;
};

export default async function SourcesDetailPage({ searchParams }: Props) {
  const params = await searchParams;
  const parsed = sourcesDetailParamsSchema.safeParse(params);

  const startMonth = parsed.success ? parsed.data.start : undefined;
  const endMonth = parsed.success ? parsed.data.end : undefined;

  const [sourceData, yearMonthRange, cardTypes] = await Promise.all([
    getSourceAnalytics(startMonth, endMonth, 10000),
    getYearMonthRange(),
    getCardTypes(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">支払い元別詳細</h2>
        <p className="mt-1 text-muted-foreground">支払い元ごとの集計を表示します</p>
      </div>
      <SourcesDetailView
        initialData={sourceData}
        yearMonths={yearMonthRange.all}
        initialStartMonth={startMonth}
        initialEndMonth={endMonth}
        cardTypes={cardTypes}
      />
    </div>
  );
}

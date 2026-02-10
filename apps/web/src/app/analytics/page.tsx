import { getCardTypes } from "../_lib/actions";
import { AnalyticsView } from "./_components/analytics-view";
import { getCategoryAnalytics, getMonthlyAnalytics, getSourceAnalytics, getYearMonthRange } from "./_lib/actions";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [monthlyData, sourceData, categoryData, yearMonthRange, cardTypes] = await Promise.all([
    getMonthlyAnalytics(),
    getSourceAnalytics(),
    getCategoryAnalytics(),
    getYearMonthRange(),
    getCardTypes(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">分析</h2>
        <p className="mt-1 text-muted-foreground">支払いデータをグラフで可視化します</p>
      </div>
      <AnalyticsView
        initialMonthlyData={monthlyData}
        initialSourceData={sourceData}
        initialCategoryData={categoryData}
        yearMonths={yearMonthRange.all}
        cardTypes={cardTypes}
      />
    </div>
  );
}

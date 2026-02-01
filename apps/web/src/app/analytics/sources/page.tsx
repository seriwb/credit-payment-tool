import { SourcesDetailView } from './_components/sources-detail-view';
import { getSourceAnalytics, getYearMonthRange } from '../_lib/actions';
import { sourcesDetailParamsSchema } from './_lib/schemas';

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>;
};

export default async function SourcesDetailPage({ searchParams }: Props) {
  const params = await searchParams;
  const parsed = sourcesDetailParamsSchema.safeParse(params);

  // バリデーション結果から期間を取得
  const startMonth = parsed.success ? parsed.data.start : undefined;
  const endMonth = parsed.success ? parsed.data.end : undefined;

  // データ取得（全件）
  const [sourceData, yearMonthRange] = await Promise.all([
    getSourceAnalytics(startMonth, endMonth, 10000),
    getYearMonthRange(),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">支払い元別詳細</h2>
        <p className="text-muted-foreground mt-1">
          支払い元ごとの集計を表示します
        </p>
      </div>
      <SourcesDetailView
        initialData={sourceData}
        yearMonths={yearMonthRange.all}
        initialStartMonth={startMonth}
        initialEndMonth={endMonth}
      />
    </div>
  );
}

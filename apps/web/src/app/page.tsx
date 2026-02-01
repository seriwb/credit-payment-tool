import { DashboardView } from './_components/dashboard-view';
import { getDashboardData } from './_lib/actions';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">ダッシュボード</h2>
        <p className="text-muted-foreground mt-1">
          ゴールドポイントカードの支払い状況を確認できます
        </p>
      </div>
      <DashboardView data={data} />
    </div>
  );
}

import { DashboardView } from "./_components/dashboard-view";
import { getCardTypes, getDashboardData } from "./_lib/actions";

export default async function DashboardPage() {
  const [data, cardTypes] = await Promise.all([getDashboardData(), getCardTypes()]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">ダッシュボード</h2>
        <p className="mt-1 text-muted-foreground">カードの支払い状況を確認できます</p>
      </div>
      <DashboardView data={data} cardTypes={cardTypes} />
    </div>
  );
}

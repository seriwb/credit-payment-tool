import { ImportView } from "./_components/import-view";
import { getImportHistory } from "./_lib/actions";

export default async function ImportPage() {
  const history = await getImportHistory();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">CSVインポート</h2>
        <p className="mt-1 text-muted-foreground">ヨドバシゴールドポイントカードの支払い履歴CSVをインポートします</p>
      </div>
      <ImportView initialHistory={history} />
    </div>
  );
}

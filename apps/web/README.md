# web - クレジットカード支払い分析ツール

クレジットカード支払い分析を行うWebアプリケーションです。  
Electronデスクトップアプリとしても動作します。

## 各ページの機能

### ダッシュボード (`/`)

- 今月・先月の支払い金額
- 前月比
- 支払い元TOP5
- カテゴリ別内訳
- 最近のインポート履歴

### CSVインポート (`/import`)

- ファイルアップロード（ドラッグ&ドロップ対応）
- ディレクトリ指定インポート
- インポート履歴表示・削除

### 支払い一覧 (`/payments`)

- 月別の支払い履歴表示
- 支払い元・カテゴリ・金額・個数の一覧

### 支払い元管理 (`/sources`)

- 支払い元一覧
- カテゴリ割り当て（個別・一括）

### カテゴリ管理 (`/categories`)

- カテゴリのCRUD
- 表示順の設定

### 分析 (`/analytics`)

- 月別推移グラフ（折れ線）
- 支払い元別TOP10（横棒グラフ）
- カテゴリ別内訳（円グラフ）
- 期間フィルター

## 開発

### Web版

```bash
# 開発サーバー起動
yarn dev

# フォーマット、型、Lintチェックをすべて行う
yarn code-check
```

### Electronデスクトップ版

**※現在開発モードのみ対応しています**

注意：Web版起動後は.nextディレクトリを削除してからでないと起動できません。逆も然り

```bash
# Electron開発モード起動
yarn electron:dev
```

詳細は [ELECTRON.md](./ELECTRON.md) を参照してください。

## 使用ライブラリ

- **UI**: shadcn/ui, Radix UI, Lucide React
- **フォーム**: React Hook Form, Zod
- **グラフ**: Recharts
- **スタイル**: TailwindCSS 4
- **DB**: Prisma Client

## Tips

Prismaを使って直接DBからデータを取得する実装となっているため、各page.tsxは基本的に`force-dynamic`とする

```ts
// ビルド時のプリレンダリングを無効化してデータベース接続エラーを回避
export const dynamic = "force-dynamic";
```

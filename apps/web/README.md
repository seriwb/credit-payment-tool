# web - クレジットカード支払い分析ツール フロントエンド

Next.js 16 (App Router) を使用したフロントエンドアプリケーション。

## ディレクトリ構成

```
src/
├── app/                      # App Router
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # ダッシュボード
│   ├── _components/          # ページコンポーネント
│   ├── _lib/                 # Server Actions
│   ├── import/               # CSVインポート
│   ├── payments/             # 支払い一覧
│   ├── sources/              # 支払い元管理
│   ├── categories/           # カテゴリ管理
│   └── analytics/            # 分析・グラフ
├── components/
│   ├── ui/                   # shadcn/ui コンポーネント
│   └── layout/               # レイアウトコンポーネント
├── hooks/                    # カスタムフック
├── lib/                      # ユーティリティ
└── styles/                   # グローバルスタイル
```

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

```bash
# 開発サーバー起動
yarn dev

# 型チェック
yarn check-types

# リント
yarn lint

# フォーマット
yarn prettier
```

## 使用ライブラリ

- **UI**: shadcn/ui, Radix UI, Lucide React
- **フォーム**: React Hook Form, Zod
- **グラフ**: Recharts
- **スタイル**: TailwindCSS 4
- **DB**: Prisma Client

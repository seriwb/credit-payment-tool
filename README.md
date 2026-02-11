# クレジットカード支払い分析ツール

クレジットカードの支払い履歴を管理・分析するWebアプリケーションで、以下のカードに対応しています。

- ヨドバシゴールドポイントカード

## 機能

- **CSVインポート**: クレジットカードのCSV明細をインポート（ファイルアップロード・ディレクトリ指定）
- **支払い一覧**: 月別の支払い履歴を確認
- **支払い元管理**: 支払い元にカテゴリを割り当てて分類
- **カテゴリ管理**: 分類用カテゴリのCRUD
- **分析・可視化**: 月別推移、支払い元別、カテゴリ別のグラフ表示
- **ダッシュボード**: 今月の概要、前月比、最近のインポート情報


## セットアップ

### 必要要件

- Node.js 22+
- Yarn 4
- Docker / Docker Compose

### インストール

```bash
# 依存関係のインストール
yarn install

# PostgreSQL起動
docker compose up -d

# Prisma Clientの生成
yarn db:generate

# マイグレーション実行
yarn db:dev

# 初期データ投入（カテゴリ）
yarn db:seed
```

### 開発サーバー起動

```bash
yarn web:dev
```

http://localhost:3000 にアクセス

## 利用可能なスクリプト

| コマンド           | 説明                         |
| ------------------ | ---------------------------- |
| `yarn web:dev`     | 開発サーバー起動             |
| `yarn web:build`   | プロダクションビルド         |
| `yarn web:start`   | プロダクションサーバー起動   |
| `yarn db:dev`      | マイグレーション実行（開発） |
| `yarn db:deploy`   | マイグレーション実行（本番） |
| `yarn db:generate` | Prisma Client生成            |
| `yarn db:seed`     | 初期データ投入               |
| `yarn db:studio`   | Prisma Studio起動            |

## CSVファイル形式

### ファイル名
- `YYYYMM.csv` または `YYYYMM-num.csv`
- 例: `202501.csv`, `202501-1.csv`

### フォーマット
```
名前,カード番号,カード名,,,
2025/01/15,支払い元名,1234,1,1,1234
2025/01/20,支払い元名,5678,2,2,5678
,,,,,合計金額
```

## 環境変数

`.env`ファイルを作成（`packages/db/.env`）:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:35432/cptool?schema=public"
```

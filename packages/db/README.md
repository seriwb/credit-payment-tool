# @credit-payment-tool/db - データベースパッケージ

Prisma 7を使用したデータベーススキーマ・マイグレーション管理。

## テーブル構成

### ImportedFile（インポート済みファイル）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | String | 主キー |
| fileName | String | ファイル名（ユニーク） |
| yearMonth | String | 対象年月（YYYYMM） |
| importedAt | DateTime | インポート日時 |

### PaymentSource（支払い元）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | String | 主キー |
| name | String | 支払い元名（ユニーク） |
| categoryId | String? | カテゴリID |

### Category（カテゴリ）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | String | 主キー |
| name | String | カテゴリ名（ユニーク） |
| displayOrder | Int | 表示順 |

### Payment（支払い明細）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | String | 主キー |
| importedFileId | String | インポートファイルID |
| paymentSourceId | String | 支払い元ID |
| paymentDate | DateTime | 支払い日 |
| amount | Int | 金額 |
| quantity | Int | 個数 |
| yearMonth | String | 年月（YYYYMM、集計用） |

## コマンド

```bash
# マイグレーション実行（開発）
yarn dev

# マイグレーション実行（本番）
yarn deploy

# Prisma Client生成
yarn generate

# 初期データ投入
yarn seed

# Prisma Studio起動
yarn studio

# マイグレーションリセット
yarn reset
```

## 環境変数

`.env`ファイルを作成:

```env
DATABASE_URL="postgresql://admin:admin@localhost:35432/payment?schema=public"
```

## 初期カテゴリ

シードデータで以下のカテゴリが作成されます:

1. 食費
2. 外食
3. 趣味
4. 仕事
5. 交通費
6. 日用品
7. その他

## データベース接続

```bash
psql postgresql://admin:admin@localhost:35432/payment
```

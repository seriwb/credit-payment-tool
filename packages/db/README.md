# @credit-payment-tool/db - データベースパッケージ

Prisma 7を使用したデータベーススキーマ・マイグレーション管理。

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
yarn web:dev              # 開発サーバー起動 (http://localhost:3000)
yarn web:build            # プロダクションビルド
yarn web:start            # プロダクションサーバー起動
```

### Database (packages/db)
```bash
yarn db:generate          # Prisma Client生成
yarn db:dev               # マイグレーション実行（開発）
yarn db:deploy            # マイグレーション実行（本番）
yarn db:seed              # 初期データ投入（カテゴリ）
yarn db:studio            # Prisma Studio起動（GUIでDB確認）
```

### Code Quality (apps/web内で実行)
```bash
yarn lint                 # ESLintチェック
yarn lint:fix             # ESLint自動修正
yarn check-types          # TypeScript型チェック
yarn prettier-check       # Prettierフォーマットチェック
yarn prettier             # Prettier自動整形
yarn code-check           # 全チェック実行（prettier, types, lint）
```

### Testing
```bash
yarn test                 # Jestウォッチモード
yarn test:ci              # Jest CIモード（単一実行）
```

### Docker
```bash
docker compose up -d      # PostgreSQL起動（ポート35432）
docker compose down       # PostgreSQL停止
```

## Architecture

### Monorepo構成
- **Package Manager**: Yarn 4（npmは使用不可）
- **Node.js**: 24.1.0
- `apps/web` - Next.js 16フロントエンド
- `packages/db` - Prisma 7データベーススキーマ

### 技術スタック
- Next.js 16 (App Router, Server Actions)
- React 19 + TypeScript 5
- TailwindCSS 4 + shadcn/ui
- Prisma 7 + PostgreSQL 18
- React Hook Form + Zod（フォーム）
- Recharts（グラフ）
- Zustand（状態管理）

### データベース
- PostgreSQL on Docker: `localhost:35432`（標準の5432ではない）
- DATABASE_URL: `postgresql://admin:admin@localhost:35432/goldpoint`

### Path Aliases
- `@/*` → `src/*`
- `@images/*` → `public/images/*`

## Coding Rules

### General
- **日本語でコメントすること**
- 文字コードはUTF-8
- ファイル構成はコロケーションを意識

### Next.js Application Rules
- ESLint、Prettierのルールを守って実装
- `components/ui`配下の既存コードは編集しない（追加は許可）
- **page.tsxから呼び出すコンポーネントは`_components`ディレクトリに配置**
  ```
  feature/
  ├── page.tsx
  └── _components/
  │   └── component-name.tsx
  └── _lib/
      ├── schemas.ts       # Zodスキーマ
      ├── constants.ts     # 定数
      ├── functions.ts     # ユーティリティ関数
      ├── actions.ts       # Server Actions
      └── types.ts         # 型定義
  ```
- **型定義**: 共通的な型以外は利用箇所で直接定義、コンポーネントプロパティの型名は`Props`
- **Form実装**: React Hook Form + Zod
- **アイコン**: Lucide Reactを優先使用
- **Zodスキーマ**: schemas.tsに出力、defaultは使用しない

### File Naming
- ケバブケースを使用（例: `component-name.tsx`）
- メインコンポーネント: ディレクトリ名と同じ
- ユーティリティ: `[機能名]-utils.ts`

### Props/Event Rules
- 全てのpropsに型を定義
- イベントハンドラーは`on[Event]`形式（例: `onFileUpload`）

## Key Directories

- `apps/web/src/app/` - App Routerページ（dashboard, import, payments, sources, categories, analytics）
- `apps/web/src/components/ui/` - shadcn/uiコンポーネント（編集不可、追加のみ）
- `apps/web/src/components/layout/` - レイアウトコンポーネント
- `apps/web/src/lib/` - 共通ユーティリティ（prisma.ts, logger.ts, utils/）
- `packages/db/prisma/` - Prismaスキーマとマイグレーション

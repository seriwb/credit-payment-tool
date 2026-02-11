# デスクトップアプリ

このNext.jsアプリケーションはElectronのデスクトップアプリとして動作します。

## 2つの動作モード

### Web版（従来通り）

- Next.js + PostgreSQL (Docker)
- ブラウザでアクセス: `http://localhost:3000`

### デスクトップ版（Electron）

- Electron + Next.js + PGlite
- ダブルクリックで起動可能なスタンドアロンアプリ
- データはローカルファイルに保存（PGlite）

## セットアップ

### 1. パッケージのインストール

```bash
cd apps/web
yarn install
```

### 2. 環境変数の設定

デスクトップ版では環境変数は自動設定されるため、`.env`ファイルは不要です。

Web版を使用する場合は従来通り`.env`に`DATABASE_URL`を設定してください。

## 開発

### Web版の開発

```bash
# PostgreSQLを起動（Docker）
docker compose up -d

# 開発サーバー起動
yarn web:dev
```

ブラウザで http://localhost:3000 にアクセス

### Electron版の開発

```bash
# Electron開発モード起動
yarn electron:dev
```

Electronウィンドウが自動的に開きます。開発モードではDevToolsも自動で開きます。

## ビルド

**※現在はビルドした成果物が正しく動作しません**

### デスクトップアプリのビルド

#### Mac用

```bash
yarn electron:build:mac
```

生成物: `dist-electron/クレジット支払い管理ツール-*.dmg`

#### Windows用

```bash
yarn electron:build:win
```

生成物: `dist-electron/クレジット支払い管理ツール Setup *.exe`


## 技術詳細

### データベース切り替え

`src/lib/prisma.ts`が環境変数`DATABASE_MODE`を見て自動的に切り替えます：

- `DATABASE_MODE=pglite` → PGlite使用（Electron）
- それ以外 → PostgreSQL使用（Web）

### マイグレーション

- **Web版**: `yarn db:dev` でPrisma Migrateを実行
- **Electron版**: アプリ起動時に `src/lib/pglite-migrations.ts` が自動実行

新しいマイグレーションを作成したら、`pglite-migrations.ts`も更新してください。

### データ保存場所（Electron）

PGliteのデータは以下の場所に保存されます：

- **Mac**: `~/Library/Application Support/credit-payment-tool-app/pgdata`
- **Windows**: `%APPDATA%\credit-payment-tool-app\pgdata`

### アプリアイコン

`resources/`ディレクトリにアイコンファイルを配置してください：

- `icon.icns` - Mac用
- `icon.ico` - Windows用

詳細は `resources/README.md` を参照。

## トラブルシューティング

### Electron起動時にエラーが出る

1. `.next`ディレクトリを削除して再ビルド:

   ```bash
   rm -rf .next
   yarn electron:dev
   ```

2. PGliteのデータをリセット:
   ```bash
   rm -rf pgdata
   ```

### ビルドしたアプリが起動しない

1. 開発モードで動作確認:

   ```bash
   yarn electron:dev
   ```

2. コンソールログを確認して、エラーメッセージを特定

### データベースマイグレーションエラー

Electron版で新しいマイグレーションを適用するには：

1. `packages/db/prisma/migrations/`の最新マイグレーションSQLを確認
2. `src/lib/pglite-migrations.ts`に追加
3. アプリを再起動

## 注意事項

1. **データ分離**: Web版とElectron版のデータは別々です
2. **ネイティブモジュール**: sharpなどはElectronビルド時に自動的に再ビルドされます
3. **セキュリティ**: Electronのコンテキスト分離を有効化しています（`contextIsolation: true`）

# Electron App

クレジット支払い管理ツールのElectronデスクトップアプリパッケージです。

`apps/web`（Next.js）をElectronでラップし、PGliteによるローカルDBを使ったスタンドアロンアプリとして動作します。

## ディレクトリ構成

```
apps/electron/
├── src/
│   ├── main.ts           # Electronメインプロセス
│   ├── preload.ts        # プリロードスクリプト
│   └── pglite-migrate.ts # PGliteマイグレーション
├── resources/
│   ├── icon.icns         # Mac用アイコン
│   ├── icon.ico          # Windows用アイコン
│   └── icon.png          # 共通PNG
├── electron-builder.yml  # electron-builder設定
└── package.json
```

## スクリプト

```bash
yarn compile    # TypeScriptコンパイルのみ
yarn dev        # コンパイル＋起動
yarn build:mac  # Mac向けビルド
yarn build:win  # Windows向けビルド
```

## 動作の仕組み

1. 起動時に `apps/web/.next/` を削除（開発モードのみ）
2. `pglite-migrate.ts` で PGlite にマイグレーションを適用
3. Next.js dev サーバーを `http://127.0.0.1:3000` で起動
4. BrowserWindow でそのURLを表示
5. 終了時に `apps/web/.next/` を削除（開発モードのみ）

## ビルド成果物

`release/` ディレクトリに出力されます。

- Mac: `release/クレジット支払い管理ツール-*.dmg`
- Windows: `release/クレジット支払い管理ツール Setup *.exe`

詳細は [apps/web/ELECTRON.md](../web/ELECTRON.md) を参照してください。

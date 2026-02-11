# アプリケーションアイコン

Electronアプリのアイコンファイルを配置するディレクトリです。

## 必要なファイル

- `icon.icns` - Mac用アイコン（512x512px以上のPNGから生成）
- `icon.ico` - Windows用アイコン（256x256px以上のPNGから生成）

## アイコンの作成方法

1. 1024x1024pxの正方形PNG画像を用意
2. オンラインツールで変換:
   - Mac (.icns): https://cloudconvert.com/png-to-icns
   - Windows (.ico): https://cloudconvert.com/png-to-ico

## 注意

現在アイコンファイルが配置されていないため、electron-builderはデフォルトアイコンを使用します。
本番環境では必ずカスタムアイコンを配置してください。

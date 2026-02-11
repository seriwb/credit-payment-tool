#!/usr/bin/env node

/**
 * アプリケーションアイコン生成スクリプト
 * SVGからPNG、ICNS、ICOファイルを生成します
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// アイコンのSVGコンテンツ（クレジットカードのアイコン）
const iconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景グラデーション -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4F46E5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="180" fill="url(#bgGradient)"/>

  <!-- クレジットカード -->
  <rect x="192" y="312" width="640" height="400" rx="32" fill="#FFFFFF" filter="drop-shadow(0 20px 40px rgba(0,0,0,0.3))"/>

  <!-- 磁気ストライプ -->
  <rect x="192" y="392" width="640" height="80" fill="#1F2937"/>

  <!-- カード番号（簡略化）-->
  <rect x="232" y="532" width="120" height="20" rx="4" fill="#E5E7EB"/>
  <rect x="372" y="532" width="120" height="20" rx="4" fill="#E5E7EB"/>
  <rect x="512" y="532" width="120" height="20" rx="4" fill="#E5E7EB"/>
  <rect x="652" y="532" width="80" height="20" rx="4" fill="#E5E7EB"/>

  <!-- チップ -->
  <g>
    <rect x="232" y="600" width="80" height="64" rx="8" fill="#FCD34D"/>
    <line x1="252" y1="600" x2="252" y2="664" stroke="#F59E0B" stroke-width="3"/>
    <line x1="272" y1="600" x2="272" y2="664" stroke="#F59E0B" stroke-width="3"/>
    <line x1="292" y1="600" x2="292" y2="664" stroke="#F59E0B" stroke-width="3"/>
  </g>

  <!-- 決済マーク -->
  <circle cx="752" cy="632" r="48" fill="#EF4444" opacity="0.85"/>
  <circle cx="792" cy="632" r="48" fill="#F59E0B" opacity="0.85"/>

  <!-- 日本円マーク -->
  <text x="512" y="260" font-size="120" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="Arial, sans-serif">¥</text>
</svg>`;

const resourcesDir = path.join(__dirname, "..", "resources");
const tempDir = path.join(resourcesDir, "temp");

// ディレクトリを作成
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// SVGファイルを保存
const svgPath = path.join(tempDir, "icon.svg");
fs.writeFileSync(svgPath, iconSVG);
console.log("✓ SVGファイルを作成しました:", svgPath);

// sharpを使ってPNGを生成
async function generatePNGWithSharp(size) {
  try {
    const sharp = require("sharp");
    const outputPath = path.join(tempDir, `icon-${size}.png`);

    await sharp(svgPath).resize(size, size).png().toFile(outputPath);

    console.log(`✓ PNG ${size}x${size} を生成しました`);
    return outputPath;
  } catch (error) {
    console.error(`✗ PNG ${size}x${size} 生成エラー:`, error.message);
    return null;
  }
}

// ICNSファイルを生成（Mac用）
async function generateICNS() {
  const iconsetDir = path.join(tempDir, "icon.iconset");

  if (!fs.existsSync(iconsetDir)) {
    fs.mkdirSync(iconsetDir);
  }

  // 必要なサイズのPNGを生成
  const sizes = [
    { size: 16, name: "icon_16x16.png" },
    { size: 32, name: "icon_16x16@2x.png" },
    { size: 32, name: "icon_32x32.png" },
    { size: 64, name: "icon_32x32@2x.png" },
    { size: 128, name: "icon_128x128.png" },
    { size: 256, name: "icon_128x128@2x.png" },
    { size: 256, name: "icon_256x256.png" },
    { size: 512, name: "icon_256x256@2x.png" },
    { size: 512, name: "icon_512x512.png" },
    { size: 1024, name: "icon_512x512@2x.png" },
  ];

  console.log("\n📦 ICNS用のPNGファイルを生成中...");

  // 一意のサイズを取得
  const uniqueSizes = [...new Set(sizes.map((s) => s.size))];

  // PNGファイルを生成
  const generatedPNGs = {};
  for (const size of uniqueSizes) {
    const pngPath = await generatePNGWithSharp(size);
    if (pngPath) {
      generatedPNGs[size] = pngPath;
    }
  }

  // iconsetディレクトリにコピー
  for (const { size, name } of sizes) {
    if (generatedPNGs[size]) {
      const destPath = path.join(iconsetDir, name);
      fs.copyFileSync(generatedPNGs[size], destPath);
    }
  }

  try {
    const icnsPath = path.join(resourcesDir, "icon.icns");
    execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`);
    console.log("\n✅ ICNS ファイルを生成しました:", icnsPath);
    return true;
  } catch (error) {
    console.error("\n✗ ICNS生成エラー:", error.message);
    console.log(
      "\n手動での生成方法:\n  iconutil -c icns " + iconsetDir + " -o " + path.join(resourcesDir, "icon.icns")
    );
    return false;
  }
}

// ICOファイルを生成（Windows用）
async function generateICO() {
  try {
    const sharp = require("sharp");
    const png256Path = path.join(tempDir, "icon-256.png");

    if (!fs.existsSync(png256Path)) {
      await generatePNGWithSharp(256);
    }

    console.log("\n💡 Windows用ICOファイルは256x256 PNGから変換できます:");
    console.log(`   元ファイル: ${png256Path}`);
    console.log(`   オンラインツール: https://cloudconvert.com/png-to-ico`);
    console.log(`   保存先: ${path.join(resourcesDir, "icon.ico")}`);
  } catch (error) {
    console.error("✗ ICO準備エラー:", error.message);
  }
}

// メイン処理
async function main() {
  console.log("🎨 アプリケーションアイコンを生成中...\n");

  try {
    // sharpが利用可能か確認
    require.resolve("sharp");

    // 1024x1024のPNGを生成
    const png1024 = await generatePNGWithSharp(1024);
    if (png1024) {
      console.log("\n✓ 基本PNGファイル:", png1024);
    }

    // ICNSファイルを生成（Mac用）
    await generateICNS();

    // ICO生成の案内
    await generateICO();

    console.log("\n✅ アイコン生成完了！");
    console.log(`\n📁 生成されたファイル:`);
    console.log(`   resources/icon.icns (Mac用)`);
    console.log(`   resources/temp/icon-*.png (PNG各サイズ)`);
  } catch (error) {
    console.error("\n✗ エラー:", error.message);
    console.log("\nsharpライブラリが必要です。インストールしてください:\n  yarn add sharp");
  }
}

main().catch(console.error);

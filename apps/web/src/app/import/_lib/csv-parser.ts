import type { CsvParseResult, ParsedPayment } from "./types";

/**
 * 文字コードを判定し、文字列に変換
 */
function decodeBuffer(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);

  // UTF-8 BOMチェック
  if (uint8Array[0] === 0xef && uint8Array[1] === 0xbb && uint8Array[2] === 0xbf) {
    return new TextDecoder("utf-8").decode(uint8Array.slice(3));
  }

  // Shift_JIS判定（簡易版）
  // Shift_JISの2バイト文字の先頭バイト範囲: 0x81-0x9F, 0xE0-0xEF
  let isShiftJis = false;
  for (let i = 0; i < Math.min(uint8Array.length, 1000); i++) {
    const byte = uint8Array[i];
    if ((byte >= 0x81 && byte <= 0x9f) || (byte >= 0xe0 && byte <= 0xef)) {
      isShiftJis = true;
      break;
    }
  }

  if (isShiftJis) {
    return new TextDecoder("shift_jis").decode(uint8Array);
  }

  // デフォルトはUTF-8
  return new TextDecoder("utf-8").decode(uint8Array);
}

/**
 * 日付文字列をパース（YYYY/MM/DD形式）
 */
function parseDate(dateStr: string): Date {
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) {
    throw new Error(`不正な日付形式: ${dateStr}`);
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  return new Date(year, month, day);
}

/**
 * 金額文字列をパース（カンマ区切り、円記号対応）
 */
function parseAmount(amountStr: string): number {
  // カンマ、円記号、スペースを除去
  const cleaned = amountStr.replace(/[,¥\s]/g, "").trim();
  const amount = parseInt(cleaned, 10);

  if (isNaN(amount)) {
    throw new Error(`不正な金額形式: ${amountStr}`);
  }

  return amount;
}

/**
 * ファイル名から年月を抽出
 */
export function extractYearMonth(fileName: string): string {
  const match = /^(\d{6})(-\d+)?\.csv$/.exec(fileName);
  if (!match) {
    throw new Error(`不正なファイル名形式: ${fileName}`);
  }
  return match[1];
}

/**
 * CSVをパース
 * フォーマット:
 * 1行目: 名前, カード番号, カード名, (空), (空), (空)
 * 2行目～: 日付, 支払い元, 金額, 個数, 個数, 金額
 * 最終行: (空), (空), (空), (空), (空), 合計金額
 */
export function parseCSV(buffer: ArrayBuffer, fileName: string): CsvParseResult {
  const content = decodeBuffer(buffer);
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");

  if (lines.length < 2) {
    throw new Error("CSVファイルにデータ行がありません");
  }

  const yearMonth = extractYearMonth(fileName);
  const payments: ParsedPayment[] = [];
  let totalAmount = 0;

  // 1行目はヘッダー（スキップ）
  // 最終行は合計（totalAmount取得用）
  // 2行目から最終行の手前までがデータ行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split(",");

    if (columns.length < 6) {
      continue;
    }

    // 最終行かどうかを判定（日付カラムが空または数字で始まらない）
    const firstCol = columns[0].trim();
    if (!firstCol || !/^\d{4}\//.test(firstCol)) {
      // 合計行
      const lastCol = columns[columns.length - 1];
      if (lastCol) {
        try {
          totalAmount = parseAmount(lastCol);
        } catch {
          // パースエラーは無視
        }
      }
      continue;
    }

    try {
      const paymentDate = parseDate(columns[0]);
      const sourceName = columns[1].trim();
      const amount = parseAmount(columns[2]);
      const quantity = parseInt(columns[3].trim(), 10) || 1;

      if (sourceName) {
        payments.push({
          paymentDate,
          sourceName,
          amount,
          quantity,
        });
      }
    } catch (error) {
      // パースエラーのある行はスキップ
      console.warn(`行 ${i + 1} のパースをスキップ:`, error);
    }
  }

  return {
    yearMonth,
    payments,
    totalAmount,
  };
}

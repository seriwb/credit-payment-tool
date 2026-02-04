import type { CsvParseResult, ParsedPayment } from "../types";
import type { CsvParser } from "./types";
import { decodeBuffer, parseAmount, parseDate } from "./utils";

/**
 * ファイル名から年月を抽出
 */
function extractYearMonth(fileName: string): string {
  const match = /^(\d{6})(-\d+)?\.csv$/.exec(fileName);
  if (!match) {
    throw new Error(`不正なファイル名形式: ${fileName}`);
  }
  return match[1];
}

/**
 * ファイル名がヨドバシCSV形式かどうかを検証
 */
function isValidFileName(fileName: string): boolean {
  return /^\d{6}(-\d+)?\.csv$/.test(fileName);
}

/**
 * ヨドバシCSVをパース
 * フォーマット:
 * 1行目: 名前, カード番号, カード名, (空), (空), (空)
 * 2行目～: 日付, 支払い元, 金額, 個数, 個数, 金額
 * 最終行: (空), (空), (空), (空), (空), 合計金額
 */
function parse(buffer: ArrayBuffer, fileName: string): CsvParseResult {
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

// ヨドバシゴールドポイントカードCSVパーサー
export const yodobashiParser: CsvParser = {
  code: "yodobashi",
  parse,
  extractYearMonth,
  isValidFileName,
};

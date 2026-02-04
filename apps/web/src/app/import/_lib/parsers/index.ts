import type { CsvParser } from "./types";
import { yodobashiParser } from "./yodobashi-parser";

// パーサーレジストリ
const parsers = new Map<string, CsvParser>();

// パーサー登録
parsers.set(yodobashiParser.code, yodobashiParser);

/**
 * カード種別コードに対応するパーサーを取得
 */
export function getParser(code: string): CsvParser {
  const parser = parsers.get(code);
  if (!parser) {
    throw new Error(`未対応のカード種別: ${code}`);
  }
  return parser;
}

/**
 * 登録済みの全パーサーコードを取得
 */
export function getParserCodes(): string[] {
  return Array.from(parsers.keys());
}

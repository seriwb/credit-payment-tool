import type { CsvParseResult } from "../types";

// CSVパーサーインターフェース
export type CsvParser = {
  code: string;
  parse: (buffer: ArrayBuffer, fileName: string) => CsvParseResult;
  extractYearMonth: (fileName: string) => string;
  isValidFileName: (fileName: string) => boolean;
};

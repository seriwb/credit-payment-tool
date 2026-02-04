import { z } from "zod";

// ファイル名バリデーション（YYYYMM.csv または YYYYMM-num.csv）
export const fileNameSchema = z
  .string()
  .regex(/^\d{6}(-\d+)?\.csv$/, "ファイル名は YYYYMM.csv または YYYYMM-num.csv 形式である必要があります");

// ディレクトリインポートスキーマ
export const directoryImportSchema = z.object({
  path: z.string().min(1, "ディレクトリパスを入力してください"),
  cardTypeCode: z.string().min(1, "カード種別を選択してください"),
});

export type DirectoryImportInput = z.infer<typeof directoryImportSchema>;

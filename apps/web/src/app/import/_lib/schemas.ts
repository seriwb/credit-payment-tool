import { z } from "zod";

// ファイル名バリデーション（YYYYMM.csv または YYYYMM-num.csv）
export const fileNameSchema = z
  .string()
  .regex(/^\d{6}(-\d+)?\.csv$/, "ファイル名は YYYYMM.csv または YYYYMM-num.csv 形式である必要があります");

// ディレクトリパスバリデーション
export const directoryPathSchema = z.object({
  path: z.string().min(1, "ディレクトリパスを入力してください"),
});

export type DirectoryPathInput = z.infer<typeof directoryPathSchema>;

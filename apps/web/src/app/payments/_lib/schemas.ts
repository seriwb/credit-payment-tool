import { z } from "zod";

// 月選択用スキーマ
export const monthSelectSchema = z.object({
  yearMonth: z.string().regex(/^\d{6}$/, "年月形式が不正です"),
});

export type MonthSelectInput = z.infer<typeof monthSelectSchema>;

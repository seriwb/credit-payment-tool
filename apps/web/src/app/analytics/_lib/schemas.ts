import { z } from "zod";

// 分析期間スキーマ
export const analyticsPeriodSchema = z.object({
  startYearMonth: z.string().regex(/^\d{6}$/, "年月形式が不正です"),
  endYearMonth: z.string().regex(/^\d{6}$/, "年月形式が不正です"),
});

export type AnalyticsPeriodInput = z.infer<typeof analyticsPeriodSchema>;

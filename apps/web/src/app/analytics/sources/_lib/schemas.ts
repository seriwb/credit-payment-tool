import { z } from 'zod';

// URLパラメータのZodスキーマ（6桁の数字で年月を表す）
export const sourcesDetailParamsSchema = z.object({
  start: z.string().regex(/^\d{6}$/).optional(),
  end: z.string().regex(/^\d{6}$/).optional(),
});

export type SourcesDetailParams = z.infer<typeof sourcesDetailParamsSchema>;

import { z } from 'zod';

// 支払い元カテゴリ更新スキーマ
export const updateSourceCategorySchema = z.object({
  sourceId: z.string().min(1, '支払い元IDが必要です'),
  categoryId: z.string().nullable(),
});

export type UpdateSourceCategoryInput = z.infer<typeof updateSourceCategorySchema>;

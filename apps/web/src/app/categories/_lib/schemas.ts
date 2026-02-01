import { z } from 'zod';

// カテゴリ作成・更新スキーマ
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'カテゴリ名を入力してください')
    .max(50, 'カテゴリ名は50文字以内で入力してください'),
  displayOrder: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(z.number().int().min(0, '表示順は0以上の整数を入力してください')),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

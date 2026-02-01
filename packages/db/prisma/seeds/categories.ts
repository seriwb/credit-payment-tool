import { Prisma } from '@prisma/client';

// 初期カテゴリデータ
export const CATEGORIES: Prisma.CategoryCreateInput[] = [
  {
    name: '食費',
    displayOrder: 1,
  },
  {
    name: '外食',
    displayOrder: 2,
  },
  {
    name: '趣味',
    displayOrder: 3,
  },
  {
    name: '仕事',
    displayOrder: 4,
  },
  {
    name: '交通費',
    displayOrder: 5,
  },
  {
    name: '日用品',
    displayOrder: 6,
  },
  {
    name: 'その他',
    displayOrder: 99,
  },
];

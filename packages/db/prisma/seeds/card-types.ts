import { Prisma } from '../generated/prisma/client';

// 初期カード種別データ
export const CARD_TYPES: Prisma.CardTypeCreateInput[] = [
  {
    code: 'yodobashi',
    name: 'ヨドバシゴールドポイントカード',
    displayOrder: 1,
  },
];

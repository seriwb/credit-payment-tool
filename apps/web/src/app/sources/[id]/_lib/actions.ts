'use server';

import prisma from '@/lib/prisma';

// 支払い元詳細の型
export type SourceDetailData = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// 支払い明細の型
export type PaymentItem = {
  id: string;
  paymentDate: Date;
  amount: number;
  quantity: number;
  yearMonth: string;
};

// サマリーの型
export type SourceSummary = {
  paymentCount: number;
  totalAmount: number;
  averageAmount: number;
};

// 取得結果の型
export type SourceDetailResult = {
  source: SourceDetailData;
  payments: PaymentItem[];
  summary: SourceSummary;
};

/**
 * 支払い元詳細を取得
 */
export async function getSourceDetail(
  id: string
): Promise<SourceDetailResult | null> {
  const source = await prisma.paymentSource.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      payments: {
        select: {
          id: true,
          paymentDate: true,
          amount: true,
          quantity: true,
          yearMonth: true,
        },
        orderBy: {
          paymentDate: 'desc',
        },
      },
    },
  });

  if (!source) {
    return null;
  }

  const payments: PaymentItem[] = source.payments.map((p) => ({
    id: p.id,
    paymentDate: p.paymentDate,
    amount: p.amount,
    quantity: p.quantity,
    yearMonth: p.yearMonth,
  }));

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paymentCount = payments.length;

  return {
    source: {
      id: source.id,
      name: source.name,
      categoryId: source.categoryId,
      categoryName: source.category?.name ?? null,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
    },
    payments,
    summary: {
      paymentCount,
      totalAmount,
      averageAmount: paymentCount > 0 ? Math.round(totalAmount / paymentCount) : 0,
    },
  };
}

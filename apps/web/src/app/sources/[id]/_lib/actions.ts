"use server";

import prisma from "@/lib/prisma";

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

// 年ごとの合計の型
export type YearlyTotal = {
  year: number;
  paymentCount: number;
  totalAmount: number;
};

// 取得結果の型
export type SourceDetailResult = {
  source: SourceDetailData;
  payments: PaymentItem[];
  summary: SourceSummary;
  yearlyTotals: YearlyTotal[];
};

/**
 * 支払い元詳細を取得
 */
export async function getSourceDetail(id: string, cardTypeId?: string): Promise<SourceDetailResult | null> {
  const paymentWhere = cardTypeId ? { cardTypeId } : {};

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
        where: paymentWhere,
        orderBy: {
          paymentDate: "desc",
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

  // 年ごとの集計を計算
  const yearlyMap = new Map<number, { paymentCount: number; totalAmount: number }>();
  for (const payment of payments) {
    const year = new Date(payment.paymentDate).getFullYear();
    const existing = yearlyMap.get(year) || { paymentCount: 0, totalAmount: 0 };
    yearlyMap.set(year, {
      paymentCount: existing.paymentCount + 1,
      totalAmount: existing.totalAmount + payment.amount,
    });
  }

  // 年の降順でソート
  const yearlyTotals: YearlyTotal[] = Array.from(yearlyMap.entries())
    .map(([year, data]) => ({
      year,
      paymentCount: data.paymentCount,
      totalAmount: data.totalAmount,
    }))
    .sort((a, b) => b.year - a.year);

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
    yearlyTotals,
  };
}

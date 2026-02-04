"use server";

import prisma from "@/lib/prisma";

// 支払い詳細の型
export type PaymentDetail = {
  id: string;
  paymentDate: Date;
  amount: number;
  quantity: number;
  sourceName: string;
  categoryName: string | null;
};

// 支払い一覧取得結果
export type PaymentsResult = {
  payments: PaymentDetail[];
  totalAmount: number;
  yearMonths: string[];
};

/**
 * 利用可能な年月リストを取得
 */
export async function getAvailableYearMonths(cardTypeId?: string): Promise<string[]> {
  const yearMonths = await prisma.payment.findMany({
    select: { yearMonth: true },
    distinct: ["yearMonth"],
    orderBy: { yearMonth: "desc" },
    ...(cardTypeId ? { where: { cardTypeId } } : {}),
  });

  return yearMonths.map((item) => item.yearMonth);
}

/**
 * 月別支払い一覧を取得
 */
export async function getPaymentsByMonth(yearMonth: string, cardTypeId?: string): Promise<PaymentsResult> {
  const yearMonths = await getAvailableYearMonths(cardTypeId);

  const where = cardTypeId ? { yearMonth, cardTypeId } : { yearMonth };

  const payments = await prisma.payment.findMany({
    where,
    include: {
      paymentSource: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { paymentDate: "desc" },
  });

  const paymentDetails: PaymentDetail[] = payments.map((payment) => ({
    id: payment.id,
    paymentDate: payment.paymentDate,
    amount: payment.amount,
    quantity: payment.quantity,
    sourceName: payment.paymentSource.name,
    categoryName: payment.paymentSource.category?.name ?? null,
  }));

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return {
    payments: paymentDetails,
    totalAmount,
    yearMonths,
  };
}

/**
 * 支払い元別の集計を取得
 */
export async function getPaymentSummaryBySource(yearMonth: string, cardTypeId?: string) {
  const where = cardTypeId ? { yearMonth, cardTypeId } : { yearMonth };

  const summary = await prisma.payment.groupBy({
    by: ["paymentSourceId"],
    where,
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  // 支払い元情報を取得
  const sourceIds = summary.map((item) => item.paymentSourceId);
  const sources = await prisma.paymentSource.findMany({
    where: { id: { in: sourceIds } },
    include: { category: true },
  });

  const sourceMap = new Map(sources.map((s) => [s.id, s]));

  return summary.map((item) => {
    const source = sourceMap.get(item.paymentSourceId);
    return {
      sourceId: item.paymentSourceId,
      sourceName: source?.name ?? "不明",
      categoryName: source?.category?.name ?? null,
      totalAmount: item._sum.amount ?? 0,
      count: item._count.id,
    };
  });
}

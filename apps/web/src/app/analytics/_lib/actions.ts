"use server";

import prisma from "@/lib/prisma";

// 月別集計データ
export type MonthlyData = {
  yearMonth: string;
  totalAmount: number;
  paymentCount: number;
};

// 支払い元別集計データ
export type SourceData = {
  sourceId: string;
  sourceName: string;
  totalAmount: number;
  paymentCount: number;
};

// カテゴリ別集計データ
export type CategoryData = {
  categoryName: string;
  totalAmount: number;
  paymentCount: number;
};

/**
 * 月別の支払い集計を取得
 */
export async function getMonthlyAnalytics(
  startYearMonth?: string,
  endYearMonth?: string,
  cardTypeId?: string
): Promise<MonthlyData[]> {
  const where: { yearMonth?: { gte?: string; lte?: string }; cardTypeId?: string } = {};

  if (startYearMonth || endYearMonth) {
    where.yearMonth = {};
    if (startYearMonth) where.yearMonth.gte = startYearMonth;
    if (endYearMonth) where.yearMonth.lte = endYearMonth;
  }

  if (cardTypeId) {
    where.cardTypeId = cardTypeId;
  }

  const data = await prisma.payment.groupBy({
    by: ["yearMonth"],
    where,
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { yearMonth: "asc" },
  });

  return data.map((item) => ({
    yearMonth: item.yearMonth,
    totalAmount: item._sum.amount ?? 0,
    paymentCount: item._count.id,
  }));
}

/**
 * 支払い元別の集計を取得
 */
export async function getSourceAnalytics(
  startYearMonth?: string,
  endYearMonth?: string,
  limit = 10,
  cardTypeId?: string
): Promise<SourceData[]> {
  const where: { yearMonth?: { gte?: string; lte?: string }; cardTypeId?: string } = {};

  if (startYearMonth || endYearMonth) {
    where.yearMonth = {};
    if (startYearMonth) where.yearMonth.gte = startYearMonth;
    if (endYearMonth) where.yearMonth.lte = endYearMonth;
  }

  if (cardTypeId) {
    where.cardTypeId = cardTypeId;
  }

  const data = await prisma.payment.groupBy({
    by: ["paymentSourceId"],
    where,
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  // 支払い元名を取得
  const sourceIds = data.map((item) => item.paymentSourceId);
  const sources = await prisma.paymentSource.findMany({
    where: { id: { in: sourceIds } },
    select: { id: true, name: true },
  });

  const sourceMap = new Map(sources.map((s) => [s.id, s.name]));

  return data.map((item) => ({
    sourceId: item.paymentSourceId,
    sourceName: sourceMap.get(item.paymentSourceId) ?? "不明",
    totalAmount: item._sum.amount ?? 0,
    paymentCount: item._count.id,
  }));
}

/**
 * カテゴリ別の集計を取得
 */
export async function getCategoryAnalytics(
  startYearMonth?: string,
  endYearMonth?: string,
  cardTypeId?: string
): Promise<CategoryData[]> {
  const where: { yearMonth?: { gte?: string; lte?: string }; cardTypeId?: string } = {};

  if (startYearMonth || endYearMonth) {
    where.yearMonth = {};
    if (startYearMonth) where.yearMonth.gte = startYearMonth;
    if (endYearMonth) where.yearMonth.lte = endYearMonth;
  }

  if (cardTypeId) {
    where.cardTypeId = cardTypeId;
  }

  // 支払いデータを取得
  const payments = await prisma.payment.findMany({
    where,
    include: {
      paymentSource: {
        include: {
          category: true,
        },
      },
    },
  });

  // カテゴリ別に集計
  const categoryMap = new Map<string, { totalAmount: number; paymentCount: number }>();

  for (const payment of payments) {
    const categoryName = payment.paymentSource.category?.name ?? "未分類";

    const current = categoryMap.get(categoryName) ?? {
      totalAmount: 0,
      paymentCount: 0,
    };

    categoryMap.set(categoryName, {
      totalAmount: current.totalAmount + payment.amount,
      paymentCount: current.paymentCount + 1,
    });
  }

  // 配列に変換してソート
  return Array.from(categoryMap.entries())
    .map(([categoryName, data]) => ({
      categoryName,
      ...data,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * 利用可能な年月の範囲を取得
 */
export async function getYearMonthRange(cardTypeId?: string): Promise<{
  min: string | null;
  max: string | null;
  all: string[];
}> {
  const yearMonths = await prisma.payment.findMany({
    select: { yearMonth: true },
    distinct: ["yearMonth"],
    orderBy: { yearMonth: "asc" },
    ...(cardTypeId ? { where: { cardTypeId } } : {}),
  });

  if (yearMonths.length === 0) {
    return { min: null, max: null, all: [] };
  }

  const all = yearMonths.map((item) => item.yearMonth);

  return {
    min: all[0],
    max: all[all.length - 1],
    all,
  };
}

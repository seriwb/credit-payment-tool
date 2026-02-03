"use server";

import prisma from "@/lib/prisma";

// ダッシュボード用データ型
export type DashboardData = {
  currentMonth: {
    yearMonth: string;
    totalAmount: number;
    paymentCount: number;
  } | null;
  previousMonth: {
    yearMonth: string;
    totalAmount: number;
    paymentCount: number;
  } | null;
  recentImports: {
    id: string;
    fileName: string;
    yearMonth: string;
    importedAt: Date;
    paymentCount: number;
  }[];
  topSources: {
    sourceName: string;
    totalAmount: number;
  }[];
  categoryBreakdown: {
    categoryName: string;
    totalAmount: number;
  }[];
};

/**
 * ダッシュボード用データを取得
 */
export async function getDashboardData(): Promise<DashboardData> {
  // 現在の年月を取得
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousYearMonth = `${prevMonth.getFullYear()}${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

  // 今月のデータ
  const currentMonthData = await prisma.payment.aggregate({
    where: { yearMonth: currentYearMonth },
    _sum: { amount: true },
    _count: { id: true },
  });

  // 先月のデータ
  const previousMonthData = await prisma.payment.aggregate({
    where: { yearMonth: previousYearMonth },
    _sum: { amount: true },
    _count: { id: true },
  });

  // 最近のインポート
  const recentImports = await prisma.importedFile.findMany({
    take: 5,
    orderBy: { importedAt: "desc" },
    include: {
      _count: {
        select: { payments: true },
      },
    },
  });

  // 今月の支払い元TOP5
  const topSourcesData = await prisma.payment.groupBy({
    by: ["paymentSourceId"],
    where: { yearMonth: currentYearMonth },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 5,
  });

  const topSourceIds = topSourcesData.map((item) => item.paymentSourceId);
  const topSources = await prisma.paymentSource.findMany({
    where: { id: { in: topSourceIds } },
    select: { id: true, name: true },
  });

  const sourceNameMap = new Map(topSources.map((s) => [s.id, s.name]));

  // 今月のカテゴリ別内訳
  const payments = await prisma.payment.findMany({
    where: { yearMonth: currentYearMonth },
    include: {
      paymentSource: {
        include: { category: true },
      },
    },
  });

  const categoryMap = new Map<string, number>();
  for (const payment of payments) {
    const categoryName = payment.paymentSource.category?.name ?? "未分類";
    categoryMap.set(categoryName, (categoryMap.get(categoryName) ?? 0) + payment.amount);
  }

  return {
    currentMonth:
      currentMonthData._count.id > 0
        ? {
            yearMonth: currentYearMonth,
            totalAmount: currentMonthData._sum.amount ?? 0,
            paymentCount: currentMonthData._count.id,
          }
        : null,
    previousMonth:
      previousMonthData._count.id > 0
        ? {
            yearMonth: previousYearMonth,
            totalAmount: previousMonthData._sum.amount ?? 0,
            paymentCount: previousMonthData._count.id,
          }
        : null,
    recentImports: recentImports.map((item) => ({
      id: item.id,
      fileName: item.fileName,
      yearMonth: item.yearMonth,
      importedAt: item.importedAt,
      paymentCount: item._count.payments,
    })),
    topSources: topSourcesData.map((item) => ({
      sourceName: sourceNameMap.get(item.paymentSourceId) ?? "不明",
      totalAmount: item._sum.amount ?? 0,
    })),
    categoryBreakdown: Array.from(categoryMap.entries())
      .map(([categoryName, totalAmount]) => ({ categoryName, totalAmount }))
      .sort((a, b) => b.totalAmount - a.totalAmount),
  };
}

'use server';

import prisma from '@/lib/prisma';

// 支払い元詳細の型
export type PaymentSourceDetail = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  paymentCount: number;
  totalAmount: number;
  lastPaymentDate: Date | null;
};

// カテゴリの型
export type CategoryOption = {
  id: string;
  name: string;
};

// フィルター条件の型
export type SourceFilterParams = {
  name?: string; // 支払い元名（前方一致）
  categoryId?: string | null; // カテゴリID（nullは未分類）
};

/**
 * 支払い元一覧を取得（フィルター対応）
 */
export async function getPaymentSources(
  filter?: SourceFilterParams
): Promise<PaymentSourceDetail[]> {
  // フィルター条件を構築
  const where: {
    name?: { startsWith: string; mode: 'insensitive' };
    categoryId?: string | null;
  } = {};

  if (filter?.name) {
    where.name = { startsWith: filter.name, mode: 'insensitive' };
  }

  // categoryIdが明示的に指定されている場合のみフィルター
  if (filter?.categoryId !== undefined) {
    where.categoryId = filter.categoryId;
  }

  const sources = await prisma.paymentSource.findMany({
    where,
    include: {
      category: true,
      payments: {
        select: {
          amount: true,
          paymentDate: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return sources.map((source) => {
    // 最新の支払日を取得
    const lastPaymentDate =
      source.payments.length > 0
        ? source.payments.reduce((latest, p) => {
            return p.paymentDate > latest ? p.paymentDate : latest;
          }, source.payments[0].paymentDate)
        : null;

    return {
      id: source.id,
      name: source.name,
      categoryId: source.categoryId,
      categoryName: source.category?.name ?? null,
      paymentCount: source.payments.length,
      totalAmount: source.payments.reduce((sum, p) => sum + p.amount, 0),
      lastPaymentDate,
    };
  });
}

/**
 * カテゴリ一覧を取得（セレクト用）
 */
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { displayOrder: 'asc' },
  });

  return categories;
}

/**
 * 支払い元のカテゴリを更新
 */
export async function updateSourceCategory(
  sourceId: string,
  categoryId: string | null
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.paymentSource.update({
      where: { id: sourceId },
      data: { categoryId },
    });

    return { success: true, message: 'カテゴリを更新しました' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '更新に失敗しました',
    };
  }
}

/**
 * 複数の支払い元のカテゴリを一括更新
 */
export async function bulkUpdateSourceCategory(
  sourceIds: string[],
  categoryId: string | null
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.paymentSource.updateMany({
      where: { id: { in: sourceIds } },
      data: { categoryId },
    });

    return { success: true, message: `${sourceIds.length}件のカテゴリを更新しました` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '更新に失敗しました',
    };
  }
}

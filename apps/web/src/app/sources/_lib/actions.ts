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
};

// カテゴリの型
export type CategoryOption = {
  id: string;
  name: string;
};

/**
 * 支払い元一覧を取得
 */
export async function getPaymentSources(): Promise<PaymentSourceDetail[]> {
  const sources = await prisma.paymentSource.findMany({
    include: {
      category: true,
      payments: {
        select: {
          amount: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    categoryId: source.categoryId,
    categoryName: source.category?.name ?? null,
    paymentCount: source.payments.length,
    totalAmount: source.payments.reduce((sum, p) => sum + p.amount, 0),
  }));
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

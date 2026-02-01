'use server';

import prisma from '@/lib/prisma';

// カテゴリ詳細の型
export type CategoryDetail = {
  id: string;
  name: string;
  displayOrder: number;
  sourceCount: number;
};

/**
 * カテゴリ一覧を取得
 */
export async function getCategories(): Promise<CategoryDetail[]> {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { paymentSources: true },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    displayOrder: category.displayOrder,
    sourceCount: category._count.paymentSources,
  }));
}

/**
 * カテゴリを作成
 */
export async function createCategory(
  name: string,
  displayOrder: number
): Promise<{ success: boolean; message: string }> {
  try {
    // 重複チェック
    const existing = await prisma.category.findUnique({
      where: { name },
    });

    if (existing) {
      return { success: false, message: '同じ名前のカテゴリが既に存在します' };
    }

    await prisma.category.create({
      data: { name, displayOrder },
    });

    return { success: true, message: 'カテゴリを作成しました' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '作成に失敗しました',
    };
  }
}

/**
 * カテゴリを更新
 */
export async function updateCategory(
  id: string,
  name: string,
  displayOrder: number
): Promise<{ success: boolean; message: string }> {
  try {
    // 重複チェック（自分以外）
    const existing = await prisma.category.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, message: '同じ名前のカテゴリが既に存在します' };
    }

    await prisma.category.update({
      where: { id },
      data: { name, displayOrder },
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
 * カテゴリを削除
 */
export async function deleteCategory(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 使用中チェック
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { paymentSources: true },
        },
      },
    });

    if (!category) {
      return { success: false, message: 'カテゴリが見つかりません' };
    }

    if (category._count.paymentSources > 0) {
      return {
        success: false,
        message: 'このカテゴリは支払い元に割り当てられているため削除できません',
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    return { success: true, message: 'カテゴリを削除しました' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '削除に失敗しました',
    };
  }
}

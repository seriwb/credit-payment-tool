"use server";

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import prisma from "@/lib/prisma";
import { parseCSV } from "./csv-parser";
import type { ImportHistory, ImportResult } from "./types";

/**
 * インポート履歴を取得
 */
export async function getImportHistory(): Promise<ImportHistory[]> {
  const files = await prisma.importedFile.findMany({
    orderBy: { importedAt: "desc" },
    include: {
      _count: {
        select: { payments: true },
      },
    },
  });

  return files.map((file) => ({
    id: file.id,
    fileName: file.fileName,
    yearMonth: file.yearMonth,
    importedAt: file.importedAt,
    paymentCount: file._count.payments,
  }));
}

/**
 * CSVファイルをインポート
 */
export async function importCsvFile(formData: FormData): Promise<ImportResult[]> {
  const files = formData.getAll("files") as File[];
  const results: ImportResult[] = [];

  for (const file of files) {
    try {
      // ファイル名バリデーション
      if (!/^\d{6}(-\d+)?\.csv$/.test(file.name)) {
        results.push({
          success: false,
          fileName: file.name,
          message: "ファイル名は YYYYMM.csv または YYYYMM-num.csv 形式である必要があります",
        });
        continue;
      }

      // 重複チェック
      const existingFile = await prisma.importedFile.findUnique({
        where: { fileName: file.name },
      });

      if (existingFile) {
        results.push({
          success: false,
          fileName: file.name,
          message: "このファイルは既にインポート済みです",
        });
        continue;
      }

      // CSVパース
      const buffer = await file.arrayBuffer();
      const parseResult = parseCSV(buffer, file.name);

      // トランザクションで保存
      const importedFile = await prisma.$transaction(async (tx) => {
        // インポートファイル作成
        const newFile = await tx.importedFile.create({
          data: {
            fileName: file.name,
            yearMonth: parseResult.yearMonth,
          },
        });

        // 支払い元マスタと支払い明細を登録
        for (const payment of parseResult.payments) {
          // 支払い元をupsert
          const paymentSource = await tx.paymentSource.upsert({
            where: { name: payment.sourceName },
            update: {},
            create: { name: payment.sourceName },
          });

          // 支払い明細を作成
          await tx.payment.create({
            data: {
              importedFileId: newFile.id,
              paymentSourceId: paymentSource.id,
              paymentDate: payment.paymentDate,
              amount: payment.amount,
              quantity: payment.quantity,
              yearMonth: parseResult.yearMonth,
            },
          });
        }

        return newFile;
      });

      results.push({
        success: true,
        fileName: file.name,
        message: "インポート完了",
        paymentCount: parseResult.payments.length,
      });
    } catch (error) {
      results.push({
        success: false,
        fileName: file.name,
        message: error instanceof Error ? error.message : "不明なエラーが発生しました",
      });
    }
  }

  return results;
}

/**
 * ディレクトリからCSVファイルをインポート
 */
export async function importFromDirectory(path: string): Promise<ImportResult[]> {
  const results: ImportResult[] = [];

  try {
    // ディレクトリの存在確認
    const stat = statSync(path);
    if (!stat.isDirectory()) {
      return [
        {
          success: false,
          fileName: path,
          message: "指定されたパスはディレクトリではありません",
        },
      ];
    }

    // CSVファイルを検索
    const fileNames = readdirSync(path).filter((name) => /^\d{6}(-\d+)?\.csv$/.test(name));

    if (fileNames.length === 0) {
      return [
        {
          success: false,
          fileName: path,
          message: "インポート対象のCSVファイルが見つかりません",
        },
      ];
    }

    // 各ファイルをインポート
    for (const fileName of fileNames) {
      try {
        // 重複チェック
        const existingFile = await prisma.importedFile.findUnique({
          where: { fileName },
        });

        if (existingFile) {
          results.push({
            success: false,
            fileName,
            message: "このファイルは既にインポート済みです",
          });
          continue;
        }

        // ファイル読み込み
        const filePath = join(path, fileName);
        const fileBuffer = readFileSync(filePath);
        const arrayBuffer = fileBuffer.buffer.slice(
          fileBuffer.byteOffset,
          fileBuffer.byteOffset + fileBuffer.byteLength
        );

        // CSVパース
        const parseResult = parseCSV(arrayBuffer, fileName);

        // トランザクションで保存
        await prisma.$transaction(async (tx) => {
          // インポートファイル作成
          const newFile = await tx.importedFile.create({
            data: {
              fileName,
              yearMonth: parseResult.yearMonth,
            },
          });

          // 支払い元マスタと支払い明細を登録
          for (const payment of parseResult.payments) {
            // 支払い元をupsert
            const paymentSource = await tx.paymentSource.upsert({
              where: { name: payment.sourceName },
              update: {},
              create: { name: payment.sourceName },
            });

            // 支払い明細を作成
            await tx.payment.create({
              data: {
                importedFileId: newFile.id,
                paymentSourceId: paymentSource.id,
                paymentDate: payment.paymentDate,
                amount: payment.amount,
                quantity: payment.quantity,
                yearMonth: parseResult.yearMonth,
              },
            });
          }
        });

        results.push({
          success: true,
          fileName,
          message: "インポート完了",
          paymentCount: parseResult.payments.length,
        });
      } catch (error) {
        results.push({
          success: false,
          fileName,
          message: error instanceof Error ? error.message : "不明なエラーが発生しました",
        });
      }
    }
  } catch (error) {
    return [
      {
        success: false,
        fileName: path,
        message: error instanceof Error ? error.message : "ディレクトリの読み込みに失敗しました",
      },
    ];
  }

  return results;
}

/**
 * インポートファイルを削除（関連する支払いデータも削除）
 */
export async function deleteImportedFile(fileId: string): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.importedFile.delete({
      where: { id: fileId },
    });

    return { success: true, message: "削除しました" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "削除に失敗しました",
    };
  }
}

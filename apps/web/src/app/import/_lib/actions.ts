"use server";

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { getCardTypes } from "@/app/_lib/actions";
import prisma from "@/lib/prisma";
import { getParser } from "./parsers";
import type { ImportHistory, ImportResult } from "./types";

// 共有のカード種別取得を再エクスポート
export { getCardTypes };

/**
 * インポート履歴を取得
 */
export async function getImportHistory(): Promise<ImportHistory[]> {
  const files = await prisma.importedFile.findMany({
    orderBy: { importedAt: "desc" },
    include: {
      cardType: { select: { name: true } },
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
    cardTypeName: file.cardType.name,
  }));
}

/**
 * CSVファイルをインポート
 */
export async function importCsvFile(formData: FormData): Promise<ImportResult[]> {
  const files = formData.getAll("files") as File[];
  const cardTypeCode = formData.get("cardTypeCode") as string;
  const results: ImportResult[] = [];

  if (!cardTypeCode) {
    return [{ success: false, fileName: "", message: "カード種別が指定されていません" }];
  }

  // カード種別を取得
  const cardType = await prisma.cardType.findUnique({
    where: { code: cardTypeCode },
  });

  if (!cardType) {
    return [{ success: false, fileName: "", message: "不正なカード種別です" }];
  }

  // パーサーを取得
  const parser = getParser(cardTypeCode);

  for (const file of files) {
    try {
      // ファイル名バリデーション
      if (!parser.isValidFileName(file.name)) {
        results.push({
          success: false,
          fileName: file.name,
          message: "ファイル名形式が不正です",
        });
        continue;
      }

      // 重複チェック（composite unique）
      const existingFile = await prisma.importedFile.findUnique({
        where: {
          fileName_cardTypeId: {
            fileName: file.name,
            cardTypeId: cardType.id,
          },
        },
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
      const parseResult = parser.parse(buffer, file.name);

      // トランザクションで保存
      await prisma.$transaction(async (tx) => {
        // インポートファイル作成
        const newFile = await tx.importedFile.create({
          data: {
            fileName: file.name,
            cardTypeId: cardType.id,
            yearMonth: parseResult.yearMonth,
          },
        });

        // 支払い元マスタと支払い明細を登録
        for (const payment of parseResult.payments) {
          // 支払い元をupsert（カード種別横断で共有）
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
              cardTypeId: cardType.id,
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
        fileName: file.name,
        message: "インポート完了",
        paymentCount: parseResult.payments.length,
        cardTypeName: cardType.name,
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
export async function importFromDirectory(path: string, cardTypeCode: string): Promise<ImportResult[]> {
  const results: ImportResult[] = [];

  if (!cardTypeCode) {
    return [{ success: false, fileName: path, message: "カード種別が指定されていません" }];
  }

  // カード種別を取得
  const cardType = await prisma.cardType.findUnique({
    where: { code: cardTypeCode },
  });

  if (!cardType) {
    return [{ success: false, fileName: path, message: "不正なカード種別です" }];
  }

  // パーサーを取得
  const parser = getParser(cardTypeCode);

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

    // CSVファイルを検索（パーサーのバリデーションを使用）
    const fileNames = readdirSync(path).filter((name) => parser.isValidFileName(name));

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
        // 重複チェック（composite unique）
        const existingFile = await prisma.importedFile.findUnique({
          where: {
            fileName_cardTypeId: {
              fileName,
              cardTypeId: cardType.id,
            },
          },
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
        const parseResult = parser.parse(arrayBuffer, fileName);

        // トランザクションで保存
        await prisma.$transaction(async (tx) => {
          // インポートファイル作成
          const newFile = await tx.importedFile.create({
            data: {
              fileName,
              cardTypeId: cardType.id,
              yearMonth: parseResult.yearMonth,
            },
          });

          // 支払い元マスタと支払い明細を登録
          for (const payment of parseResult.payments) {
            // 支払い元をupsert（カード種別横断で共有）
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
                cardTypeId: cardType.id,
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
          cardTypeName: cardType.name,
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

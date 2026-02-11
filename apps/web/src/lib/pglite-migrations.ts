import type { PrismaClient } from "@credit-payment-tool/db/prisma/generated/prisma/client";

/**
 * PGliteデータベースのマイグレーションを実行
 * Prisma Migrateは本番環境向けではないため、SQLを直接実行する
 * 注意: PGliteでは1つのクエリで複数のSQL文を実行できないため、個別に実行する
 */
export async function runPGliteMigrations(prisma: PrismaClient): Promise<void> {
  try {
    console.log("[PGlite] マイグレーション開始");

    // マイグレーションテーブルが存在するか確認
    const tableCheck = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'categories'
      ) as exists;
    `;

    if (tableCheck[0]?.exists) {
      console.log("[PGlite] マイグレーション済み（スキップ）");
      return;
    }

    console.log("[PGlite] 初回マイグレーション実行中...");

    // 1. 基本スキーマの作成（20260201085703）- 各テーブルを個別に作成
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "imported_files" (
          "id" TEXT NOT NULL,
          "fileName" TEXT NOT NULL,
          "yearMonth" TEXT NOT NULL,
          "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "imported_files_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "payment_sources" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "categoryId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "payment_sources_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "categories" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "displayOrder" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "payments" (
          "id" TEXT NOT NULL,
          "importedFileId" TEXT NOT NULL,
          "paymentSourceId" TEXT NOT NULL,
          "paymentDate" TIMESTAMP(3) NOT NULL,
          "amount" INTEGER NOT NULL,
          "quantity" INTEGER NOT NULL DEFAULT 1,
          "yearMonth" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
      )
    `);

    // インデックス作成
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "imported_files_fileName_key" ON "imported_files"("fileName")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "imported_files_yearMonth_idx" ON "imported_files"("yearMonth")`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "payment_sources_name_key" ON "payment_sources"("name")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "payment_sources_categoryId_idx" ON "payment_sources"("categoryId")`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "payments_paymentSourceId_idx" ON "payments"("paymentSourceId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "payments_yearMonth_idx" ON "payments"("yearMonth")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "payments_importedFileId_idx" ON "payments"("importedFileId")`);

    // 外部キー制約
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "payment_sources" ADD CONSTRAINT "payment_sources_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "payments" ADD CONSTRAINT "payments_importedFileId_fkey"
        FOREIGN KEY ("importedFileId") REFERENCES "imported_files"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "payments" ADD CONSTRAINT "payments_paymentSourceId_fkey"
        FOREIGN KEY ("paymentSourceId") REFERENCES "payment_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    // 2. card_typesテーブルの追加（20260204000000_add_card_type）
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "card_types" (
          "id" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "displayOrder" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "card_types_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "card_types_code_key" ON "card_types"("code")`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "card_types_name_key" ON "card_types"("name")`);

    // ヨドバシカードの初期データを挿入
    await prisma.$executeRawUnsafe(`
      INSERT INTO "card_types" ("id", "code", "name", "displayOrder", "createdAt", "updatedAt")
      VALUES ('default-yodobashi', 'yodobashi', 'ヨドバシゴールドポイントカード', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    // imported_filesにcardTypeIdカラムを追加
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "imported_files" ADD COLUMN "cardTypeId" TEXT NOT NULL DEFAULT 'default-yodobashi'
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "imported_files" ALTER COLUMN "cardTypeId" DROP DEFAULT
    `);

    // paymentsにcardTypeIdカラムを追加
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "payments" ADD COLUMN "cardTypeId" TEXT NOT NULL DEFAULT 'default-yodobashi'
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "payments" ALTER COLUMN "cardTypeId" DROP DEFAULT
    `);

    // imported_filesのfileNameのunique制約を削除
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "imported_files_fileName_key"`);

    // composite uniqueインデックスを作成
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX "imported_files_fileName_cardTypeId_key" ON "imported_files"("fileName", "cardTypeId")`
    );
    await prisma.$executeRawUnsafe(`CREATE INDEX "imported_files_cardTypeId_idx" ON "imported_files"("cardTypeId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "payments_cardTypeId_idx" ON "payments"("cardTypeId")`);

    // 外部キー制約を追加
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "imported_files" ADD CONSTRAINT "imported_files_cardTypeId_fkey"
        FOREIGN KEY ("cardTypeId") REFERENCES "card_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "payments" ADD CONSTRAINT "payments_cardTypeId_fkey"
        FOREIGN KEY ("cardTypeId") REFERENCES "card_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    console.log("[PGlite] マイグレーション完了");
  } catch (error) {
    console.error("[PGlite] マイグレーションエラー:", error);
    throw error;
  }
}

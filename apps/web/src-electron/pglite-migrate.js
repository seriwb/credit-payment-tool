const { PGlite } = require("@electric-sql/pglite");
const logger = require("electron-log/main");

// マイグレーション定義: 20260201085703_initial_schema
const MIGRATION_20260201085703 = `
-- CreateTable
CREATE TABLE "imported_files" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imported_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
);

-- CreateIndex
CREATE UNIQUE INDEX "imported_files_fileName_key" ON "imported_files"("fileName");

-- CreateIndex
CREATE INDEX "imported_files_yearMonth_idx" ON "imported_files"("yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "payment_sources_name_key" ON "payment_sources"("name");

-- CreateIndex
CREATE INDEX "payment_sources_categoryId_idx" ON "payment_sources"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "payments_paymentSourceId_idx" ON "payments"("paymentSourceId");

-- CreateIndex
CREATE INDEX "payments_yearMonth_idx" ON "payments"("yearMonth");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate");

-- CreateIndex
CREATE INDEX "payments_importedFileId_idx" ON "payments"("importedFileId");

-- AddForeignKey
ALTER TABLE "payment_sources" ADD CONSTRAINT "payment_sources_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_importedFileId_fkey" FOREIGN KEY ("importedFileId") REFERENCES "imported_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_paymentSourceId_fkey" FOREIGN KEY ("paymentSourceId") REFERENCES "payment_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
`;

// マイグレーション定義: 20260204000000_add_card_type
const MIGRATION_20260204000000 = `
-- CreateTable
CREATE TABLE "card_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "card_types_code_key" ON "card_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "card_types_name_key" ON "card_types"("name");

-- ヨドバシカードの初期データを挿入
INSERT INTO "card_types" ("id", "code", "name", "displayOrder", "createdAt", "updatedAt")
VALUES ('default-yodobashi', 'yodobashi', 'ヨドバシゴールドポイントカード', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- imported_filesにcardTypeIdカラムを追加（既存データはヨドバシのIDで埋める）
ALTER TABLE "imported_files" ADD COLUMN "cardTypeId" TEXT NOT NULL DEFAULT 'default-yodobashi';

-- デフォルト値を削除
ALTER TABLE "imported_files" ALTER COLUMN "cardTypeId" DROP DEFAULT;

-- paymentsにcardTypeIdカラムを追加（既存データはヨドバシのIDで埋める）
ALTER TABLE "payments" ADD COLUMN "cardTypeId" TEXT NOT NULL DEFAULT 'default-yodobashi';

-- デフォルト値を削除
ALTER TABLE "payments" ALTER COLUMN "cardTypeId" DROP DEFAULT;

-- imported_filesのfileNameのunique制約を削除し、composite uniqueに変更
DROP INDEX IF EXISTS "imported_files_fileName_key";

-- CreateIndex
CREATE UNIQUE INDEX "imported_files_fileName_cardTypeId_key" ON "imported_files"("fileName", "cardTypeId");

-- CreateIndex
CREATE INDEX "imported_files_cardTypeId_idx" ON "imported_files"("cardTypeId");

-- CreateIndex
CREATE INDEX "payments_cardTypeId_idx" ON "payments"("cardTypeId");

-- AddForeignKey
ALTER TABLE "imported_files" ADD CONSTRAINT "imported_files_cardTypeId_fkey" FOREIGN KEY ("cardTypeId") REFERENCES "card_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_cardTypeId_fkey" FOREIGN KEY ("cardTypeId") REFERENCES "card_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
`;

// マイグレーション一覧
const MIGRATIONS = [
  { name: "20260201085703_initial_schema", sql: MIGRATION_20260201085703 },
  { name: "20260204000000_add_card_type", sql: MIGRATION_20260204000000 },
];

/**
 * PGliteマイグレーションを実行
 * @param {string} dataDir PGliteデータディレクトリ
 */
async function runMigrations(dataDir) {
  let client;

  try {
    logger.info(`[PGlite Migration] データディレクトリ: ${dataDir}`);
    logger.info("[PGlite Migration] マイグレーション開始");

    // PGliteインスタンスを作成
    client = new PGlite(dataDir);

    // マイグレーション管理テーブルを作成
    await client.exec(`
      CREATE TABLE IF NOT EXISTS _pglite_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 既存DBの検出: categoriesテーブルが存在するが_pglite_migrationsが空の場合、既存データベースとみなす
    const categoriesCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'categories'
      ) as exists;
    `);
    const categoriesExists = categoriesCheckResult.rows[0]?.exists === true;

    const migrationCountResult = await client.query("SELECT COUNT(*) as count FROM _pglite_migrations");
    const migrationCount = parseInt(migrationCountResult.rows[0]?.count || "0", 10);

    // 既存DBで_pglite_migrationsが空の場合、全マイグレーションを適用済みとしてバックフィル
    if (categoriesExists && migrationCount === 0) {
      logger.info("[PGlite Migration] 既存データベースを検出。マイグレーション履歴をバックフィル中...");
      for (const migration of MIGRATIONS) {
        await client.exec(`
          INSERT INTO _pglite_migrations (name, applied_at)
          VALUES ('${migration.name}', CURRENT_TIMESTAMP);
        `);
        logger.info(`[PGlite Migration] バックフィル完了: ${migration.name}`);
      }
      logger.info("[PGlite Migration] バックフィル完了");
      return;
    }

    // 適用済みマイグレーションを取得
    const appliedMigrationsResult = await client.query("SELECT name FROM _pglite_migrations ORDER BY name");
    const appliedMigrations = new Set(appliedMigrationsResult.rows.map((row) => row.name));

    // 未適用マイグレーションを実行
    let appliedCount = 0;
    for (const migration of MIGRATIONS) {
      if (appliedMigrations.has(migration.name)) {
        logger.info(`[PGlite Migration] スキップ（適用済み）: ${migration.name}`);
        continue;
      }

      logger.info(`[PGlite Migration] 適用中: ${migration.name}`);
      await client.exec(migration.sql);

      // マイグレーション適用記録を挿入
      await client.exec(`
        INSERT INTO _pglite_migrations (name, applied_at)
        VALUES ('${migration.name}', CURRENT_TIMESTAMP);
      `);

      logger.info(`[PGlite Migration] 適用完了: ${migration.name}`);
      appliedCount++;
    }

    if (appliedCount === 0) {
      logger.info("[PGlite Migration] 未適用のマイグレーションはありません");
    } else {
      logger.info(`[PGlite Migration] ${appliedCount}件のマイグレーションを適用しました`);
    }

    logger.info("[PGlite Migration] マイグレーション完了");
  } catch (error) {
    logger.error("[PGlite Migration] マイグレーションエラー:", error);
    throw error;
  } finally {
    // PGliteインスタンスを閉じる（Next.jsが別インスタンスを作成できるように）
    if (client) {
      await client.close();
      logger.info("[PGlite Migration] PGliteインスタンスをクローズしました");
    }
  }
}

module.exports = { runMigrations };

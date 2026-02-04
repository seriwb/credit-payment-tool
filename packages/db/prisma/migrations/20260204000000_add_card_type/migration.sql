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

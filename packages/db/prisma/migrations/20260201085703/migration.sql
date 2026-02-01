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

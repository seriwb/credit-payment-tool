import { PrismaClient } from "@credit-payment-tool/db/prisma/generated/prisma/client";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaPGlite } from "pglite-prisma-adapter";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const createPrismaClient = (): PrismaClient => {
  if (process.env.DATABASE_MODE === "pglite") {
    // Electron用: PGliteアダプターを使用
    const dataDir = process.env.PGLITE_DATA_PATH || "./pgdata";
    console.log(`[PGlite] データディレクトリ: ${dataDir}`);

    const client = new PGlite(dataDir);
    const prismaClient = new PrismaClient({ adapter: new PrismaPGlite(client) });

    return prismaClient;
  }

  // Web版デフォルト: PostgreSQLアダプターを使用
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
};

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

import { PrismaClient } from "@credit-payment-tool/db/prisma/generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  prismaPromise: Promise<PrismaClient> | undefined;
};

/**
 * Prismaクライアントを作成
 * DATABASE_MODE環境変数で動作モードを切り替え:
 * - pglite: Electron用のPGlite（ファイルベースDB）
 * - それ以外: PostgreSQL（Web版デフォルト）
 */
async function createPrismaClient(): Promise<PrismaClient> {
  if (process.env.DATABASE_MODE === "pglite") {
    // Electron用: PGliteアダプターを使用
    const { PGlite } = await import("@electric-sql/pglite");
    const { PrismaPGlite } = await import("pglite-prisma-adapter");

    const dataDir = process.env.PGLITE_DATA_PATH || "./pgdata";
    console.log(`[PGlite] データディレクトリ: ${dataDir}`);

    const client = new PGlite(dataDir);
    const adapter = new PrismaPGlite(client);

    // PrismaPGliteの型がPrismaClientのadapterオプションと完全に互換性がないため型アサーション
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const prismaClient = new PrismaClient({ adapter: adapter as any });

    // PGliteモードの場合はマイグレーションを実行
    const { runPGliteMigrations } = await import("./pglite-migrations");
    await runPGliteMigrations(prismaClient);

    return prismaClient;
  }

  // Web版デフォルト: PostgreSQLアダプターを使用
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
}

/**
 * 非同期でPrismaクライアントを取得（推奨）
 */
async function getPrismaAsync(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  if (!globalForPrisma.prismaPromise) {
    globalForPrisma.prismaPromise = createPrismaClient().then((client) => {
      globalForPrisma.prisma = client;
      return client;
    });
  }

  return globalForPrisma.prismaPromise;
}

// サーバー起動時に初期化を開始（バックグラウンドで実行）
if (typeof window === "undefined") {
  getPrismaAsync().catch((error) => {
    console.error("[Prisma] 初期化エラー:", error);
  });
}

/**
 * Proxyハンドラー: PrismaClientのプロパティアクセスを処理
 */
const prismaProxyHandler: ProxyHandler<PrismaClient> = {
  get(_target, prop: string | symbol) {
    // シンボルの場合は無視
    if (typeof prop === "symbol") {
      return undefined;
    }

    // 初期化が完了している場合は即座に返す
    if (globalForPrisma.prisma) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(globalForPrisma.prisma, prop);
    }

    // 初期化が完了していない場合は、非同期でアクセスできるProxyを返す
    return new Proxy(
      {},
      {
        get(_innerTarget, innerProp: string | symbol) {
          if (typeof innerProp === "symbol") {
            return undefined;
          }

          // 関数を返す（findMany, create等）
          return async (...args: unknown[]) => {
            const client = await getPrismaAsync();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const modelOrMethod = Reflect.get(client, prop);

            if (typeof modelOrMethod === "function") {
              // $queryRaw, $executeRaw等のメソッド
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              return Reflect.apply(modelOrMethod, client, args);
            }

            // モデルオブジェクト（user, payment等）
            if (modelOrMethod && typeof modelOrMethod === "object") {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const method = Reflect.get(modelOrMethod, innerProp);
              if (typeof method === "function") {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return Reflect.apply(method, modelOrMethod, args);
              }
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return method;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return modelOrMethod;
          };
        },
      }
    );
  },
};

// デフォルトエクスポート（後方互換性のため）
const prisma = new Proxy({} as PrismaClient, prismaProxyHandler);

export default prisma;
export { getPrismaAsync };

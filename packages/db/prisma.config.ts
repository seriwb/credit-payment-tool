import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  migrations: {
    path: path.join(__dirname, 'prisma/migrations'),
    seed: 'tsx prisma/seed.ts', // シードデータの作成
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});

import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { CARD_TYPES } from './seeds/card-types';
import { CATEGORIES } from './seeds/categories';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('Seeding database...');

  // カード種別の初期データ投入
  for (const cardType of CARD_TYPES) {
    await prisma.cardType.upsert({
      where: { code: cardType.code },
      update: {},
      create: cardType,
    });
  }
  console.log(`Created ${CARD_TYPES.length} card types`);

  // カテゴリの初期データ投入
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`Created ${CATEGORIES.length} categories`);

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import { CATEGORIES } from './seeds/categories';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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

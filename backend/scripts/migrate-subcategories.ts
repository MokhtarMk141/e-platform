import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Subcategory to Category Migration ---');

  // 1. Fetch all subcategories
  const subcategories = await prisma.subcategory.findMany({
    include: {
      products: true,
    },
  });

  console.log(`Found ${subcategories.length} subcategories to migrate.`);

  for (const sub of subcategories) {
    console.log(`Migrating: ${sub.name}...`);

    // 2. Create or find the subcategory as a Category record
    // Note: We check if it already exists to avoid unique constraint errors if name was already in Category
    let targetCategory = await prisma.category.findUnique({
      where: { name: sub.name },
    });

    if (!targetCategory) {
      targetCategory = await prisma.category.create({
        data: {
          name: sub.name,
          description: sub.description,
          parentId: sub.categoryId, // Set parent to the original Category
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        },
      });
      console.log(`  Created new Category record for ${sub.name}`);
    } else {
      // If it exists, update its parentId
      targetCategory = await prisma.category.update({
        where: { id: targetCategory.id },
        data: { parentId: sub.categoryId },
      });
      console.log(`  Updated existing Category record for ${sub.name} with parentId`);
    }

    // 3. Update all products that were linked to this subcategory
    const productUpdate = await prisma.product.updateMany({
      where: { subcategoryId: sub.id },
      data: {
        categoryId: targetCategory.id,
      },
    });

    console.log(`  Updated ${productUpdate.count} products to point to the new Category record.`);
  }

  console.log('--- Migration Finished Successfully ---');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

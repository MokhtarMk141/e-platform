const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching data from the database...');

  const categories = await prisma.category.findMany();
  const brands = await prisma.brand.findMany();
  const products = await prisma.product.findMany();
  const users = await prisma.user.findMany();
  const discounts = await prisma.discount.findMany();
  const homepageConfigs = await prisma.homepageConfig.findMany();

  console.log('Formatting data...');

  function formatData(dataArray) {
    return JSON.stringify(dataArray, null, 2).replace(/"(20\d\d-[^"]+)"/g, (match, iso) => {
      if (iso.includes('T') && iso.endsWith('Z')) {
        return `new Date('${iso}')`;
      }
      return match;
    });
  }

  const seedContent = `const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database from dumped data...\\n');

  const categories = ${formatData(categories)};
  for (const item of categories) {
    await prisma.category.upsert({ where: { id: item.id }, update: {}, create: item });
  }
  console.log(\`✅ \${categories.length} categories inserted\`);

  const brands = ${formatData(brands)};
  for (const item of brands) {
    await prisma.brand.upsert({ where: { id: item.id }, update: {}, create: item });
  }
  console.log(\`✅ \${brands.length} brands inserted\`);

  const products = ${formatData(products)};
  for (const item of products) {
    await prisma.product.upsert({ where: { id: item.id }, update: {}, create: item });
  }
  console.log(\`✅ \${products.length} products inserted\`);

  const users = ${formatData(users)};
  for (const item of users) {
    await prisma.user.upsert({ where: { email: item.email }, update: {}, create: item });
  }
  console.log(\`✅ \${users.length} users inserted\`);

  const discounts = ${formatData(discounts)};
  for (const item of discounts) {
    await prisma.discount.upsert({ where: { id: item.id }, update: {}, create: item });
  }
  console.log(\`✅ \${discounts.length} discounts inserted\`);

  const homepageConfigs = ${formatData(homepageConfigs)};
  for (const item of homepageConfigs) {
    await prisma.homepageConfig.upsert({ where: { id: item.id }, update: {}, create: item });
  }
  console.log(\`✅ \${homepageConfigs.length} homepage configs inserted\`);

  console.log('\\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  const seedPath = path.join(__dirname, 'prisma', 'seed.js');
  fs.writeFileSync(seedPath, seedContent, 'utf-8');
  console.log('✅ prisma/seed.js has been successfully overwritten with your live database datal!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

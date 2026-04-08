const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const brands = [
  { id: 'brand-intel', name: 'Intel', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg' },
  { id: 'brand-nvidia', name: 'NVIDIA', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/NVIDIA_logo_white.svg/3840px-NVIDIA_logo_white.svg.png' },
  { id: 'brand-amd', name: 'AMD', logoUrl: 'https://media.johnlewiscontent.com/i/JohnLewis/amd_brl_white?fmt=auto&$alpha$' },
  { id: 'brand-logitech', name: 'Logitech', logoUrl: 'https://companieslogo.com/img/orig/LOGI_BIG.D-3f288e21.png?t=1720244492' },
  { id: 'brand-razer', name: 'Razer', logoUrl: 'https://www.svgrepo.com/show/306644/razer.svg' },
  { id: 'brand-corsair', name: 'Corsair', logoUrl: 'https://www.pngplay.com/wp-content/uploads/13/Corsair-PNG-HD-Quality.png' },
  { id: 'brand-asus', name: 'ASUS', logoUrl: 'https://www.freepnglogos.com/uploads/logo-asus-png/asus-white-logo-png-22.png' },
  { id: 'brand-msi', name: 'MSI', logoUrl: 'https://storage-asset.msi.com/event/spb/2017/InfiniteA_H5page/images/logo.png' },
  { id: 'brand-apple', name: 'Apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 'brand-samsung', name: 'Samsung', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
  { id: 'brand-hp', name: 'HP', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg' },
  { id: 'brand-dell', name: 'Dell', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg' },
];

async function main() {
  console.log('🌱 Seeding brands...');
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { id: brand.id },
      update: brand,
      create: brand,
    });
  }
  console.log('🎉 Brand seeding complete!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

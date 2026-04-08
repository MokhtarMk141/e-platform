const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const migrations = [
  // Mice -> Accessories / Peripherals
  { name: 'Logitech G502 X', brandId: 'brand-logitech', categoryId: 'cmm1v4u9i0007pr3szojyaamk', subcategoryId: 'sub-mouse' },
  { name: 'Razer Viper Ultimate', brandId: 'brand-razer', categoryId: 'cmm1v4u9i0007pr3szojyaamk', subcategoryId: 'sub-mouse' },
  { name: 'Corsair M65 RGB Ultra', brandId: 'brand-corsair', categoryId: 'cmm1v4u9i0007pr3szojyaamk', subcategoryId: 'sub-mouse' },

  // Monitors
  { name: 'LG UltraGear 27GN950', brandId: null, categoryId: 'cmm1v4odz0006pr3svznkvkwg', subcategoryId: 'sub-gaming-monitor' },
  { name: 'Samsung Odyssey G8 OLED', brandId: 'brand-samsung', categoryId: 'cmm1v4odz0006pr3svznkvkwg', subcategoryId: 'sub-gaming-monitor' },
  { name: 'ASUS TUF Gaming VG27AQ', brandId: 'brand-asus', categoryId: 'cmm1v4odz0006pr3svznkvkwg', subcategoryId: 'sub-gaming-monitor' },

  // Motherboards (PC Components)
  { name: 'ASUS ROG Strix Z790-E', brandId: 'brand-asus', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-motherboard' },
  { name: 'MSI B650M Mortar WiFi', brandId: 'brand-msi', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-motherboard' },
  { name: 'Gigabyte X670E AORUS Master', brandId: null, categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-motherboard' },

  // Cases (PC Components)
  { name: 'Lian Li PC-O11 Dynamic', brandId: null, categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-case' },
  { name: 'NZXT H7 Flow', brandId: null, categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-case' },
  { name: 'Cooler Master NR200', brandId: null, categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-case' },

  // PSUs (PC Components)
  { name: 'Corsair RM850x', brandId: 'brand-corsair', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-psu' },
  { name: 'EVGA SuperNOVA 750 G6', brandId: null, categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-psu' },

  // CPUs
  { name: 'Intel Core Ultra 9', brandId: 'brand-intel', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-cpu' },
  { name: 'AMD Ryzen 9 9950X', brandId: 'brand-amd', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-cpu' },

  // Storage
  { name: 'Samsung 990 Pro 2TB', brandId: 'brand-samsung', categoryId: 'cmm1v4zpy0008pr3srmq3d7pa', subcategoryId: 'sub-internal-ssd' },
  { name: 'Seagate Barracuda 4TB', brandId: null, categoryId: 'cmm1v4zpy0008pr3srmq3d7pa', subcategoryId: 'sub-internal-hdd' },

  // RAM
  { name: 'Corsair Vengeance DDR5 64GB', brandId: 'brand-corsair', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-ram' },
  { name: 'Kingston Fury Beast DDR4 16GB', brandId: null, categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', subcategoryId: 'sub-ram' }
];

async function main() {
  console.log('🚀 Starting product migration...');
  
  // Also ensure the "Accessories" category (cmm1v64a4000gpr3sbhcbofiv) has some products for the Brand ShowCase
  // I will move ALL Peripherals to "Accessories" category to be sure the showcase is full.
  const accessoryCategory = 'cmm1v64a4000gpr3sbhcbofiv';

  for (const m of migrations) {
    const product = await prisma.product.findFirst({
      where: { name: m.name }
    });

    if (product) {
      // If it's an accessory (mouse, keyboard, headset), move it to "Accessories" category
      const targetCategory = (m.subcategoryId === 'sub-mouse' || m.subcategoryId === 'sub-keyboard' || m.subcategoryId === 'sub-headset') 
        ? accessoryCategory 
        : m.categoryId;

      await prisma.product.update({
        where: { id: product.id },
        data: {
          brandId: m.brandId,
          categoryId: targetCategory,
          subcategoryId: m.subcategoryId
        }
      });
      console.log(`✅ Updated: ${m.name}`);
    } else {
      console.log(`⚠️ Not found: ${m.name}`);
    }
  }

  console.log('🎉 Migration complete!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

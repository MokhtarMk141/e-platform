const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

 
  const categories = [
    { id: 'cmm1v5fd5000bpr3snungry1w', name: 'CPU Cooling', description: 'Air coolers, liquid AIOs, and case fans for optimal thermal performance.', createdAt: new Date('2026-02-25T10:00:08.969Z'), updatedAt: new Date('2026-02-25T10:00:08.969Z') },
    { id: 'cmm0mbz600002pr51w0x0voa3', name: 'GRAPHICS CARDS', description: 'High-performance GPUs for gaming, AI, and professional workloads.', createdAt: new Date('2026-02-24T13:05:31.848Z'), updatedAt: new Date('2026-02-24T13:05:31.848Z') },
    { id: 'cmlt9st2d0003qk1yrwdfgm8k', name: 'GamingLaptop', description: ' desktop computers for gaming.', createdAt: new Date('2026-02-19T09:40:18.854Z'), updatedAt: new Date('2026-02-19T09:40:18.854Z') },
    { id: 'cmm1v4zpy0008pr3srmq3d7pa', name: 'Graphics Cards', description: 'High-performance GPUs including NVIDIA RTX 5000 and AMD RX 9000 series.', createdAt: new Date('2026-02-25T09:59:48.695Z'), updatedAt: new Date('2026-02-25T09:59:48.695Z') },
    { id: 'cmm1v64a4000gpr3sbhcbofiv', name: 'Headsets', description: 'High-quality gaming and audio headsets.', createdAt: new Date('2026-02-25T10:00:41.261Z'), updatedAt: new Date('2026-02-25T10:00:41.261Z') },
    { id: 'cmm1v5upq000epr3sgq7zxxcw', name: 'Keyboards', description: 'Mechanical and membrane keyboards for gaming and productivity.', createdAt: new Date('2026-02-25T10:00:28.862Z'), updatedAt: new Date('2026-02-25T10:00:28.862Z') },
    { id: 'cmm1v4u9i0007pr3szojyaamk', name: 'Memory', description: 'High-speed DDR4 and DDR5 memory kits up to 192GB.', createdAt: new Date('2026-02-25T09:59:41.622Z'), updatedAt: new Date('2026-02-25T09:59:41.622Z') },
    { id: 'cmm1v5zrt000fpr3s955iajjj', name: 'Mice', description: 'Precision gaming and productivity mice.', createdAt: new Date('2026-02-25T10:00:35.417Z'), updatedAt: new Date('2026-02-25T10:00:35.417Z') },
    { id: 'cmm1v5py0000dpr3srct3v2ce', name: 'Monitors', description: '4K, 240Hz, and ultrawide monitors for immersive experiences.', createdAt: new Date('2026-02-25T10:00:22.681Z'), updatedAt: new Date('2026-02-25T10:00:22.681Z') },
    { id: 'cmm1v4odz0006pr3svznkvkwg', name: 'Motherboards', description: 'ATX, mATX, and Mini-ITX motherboards for various PC builds.', createdAt: new Date('2026-02-25T09:59:34.007Z'), updatedAt: new Date('2026-02-25T09:59:34.007Z') },
    { id: 'cmm1v5l0i000cpr3syvlove4t', name: 'PC Cases', description: 'Full-tower, mid-tower, and mini-tower chassis for PC builds.', createdAt: new Date('2026-02-25T10:00:16.291Z'), updatedAt: new Date('2026-02-25T10:00:16.291Z') },
    { id: 'cmm1v5alm000apr3snqnff737', name: 'Power Supplies', description: '80+ Gold, Platinum, and Titanium certified power supply units.', createdAt: new Date('2026-02-25T10:00:02.795Z'), updatedAt: new Date('2026-02-25T10:00:02.795Z') },
    { id: 'cmm1v4hlo0005pr3sgbrb98m0', name: 'Processors', description: 'Modern desktop processors including Intel Core Ultra and AMD Ryzen series.', createdAt: new Date('2026-02-25T09:59:25.212Z'), updatedAt: new Date('2026-02-25T09:59:25.212Z') },
    { id: 'cmm1v54tx0009pr3shd94o9gu', name: 'Storage', description: 'NVMe SSDs, HDDs, and SATA drives for fast and reliable storage.', createdAt: new Date('2026-02-25T09:59:55.318Z'), updatedAt: new Date('2026-02-25T09:59:55.318Z') },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({ where: { id: cat.id }, update: {}, create: cat });
  }
  console.log(`✅ ${categories.length} categories inserted`);


  const products = [
    { id: 'cmm1w9cpp002epr3s7rnrsa00', name: 'Seagate Barracuda 4TB', description: 'Reliable 4TB HDD designed for long-term storage needs.', price: 89.99, sku: 'SEA-BARRA-4TB-2026', stock: 40, imageUrl: 'https://www.sdt-eu.com/110-large_default/seagate-barracuda-35-hdd-4-tb.jpg', categoryId: 'cmm1v54tx0009pr3shd94o9gu', createdAt: new Date('2026-02-25T10:31:11.773Z'), updatedAt: new Date('2026-02-25T10:31:11.773Z') },
    { id: 'cmm1w8u9f002cpr3s4oljcvzz', name: 'Samsung 990 Pro 2TB', description: 'Top-tier NVMe SSD with exceptional read/write speeds.', price: 199.99, sku: 'SAM-990PRO-2TB-2026', stock: 30, imageUrl: 'https://static0.xdaimages.com/wordpress/wp-content/uploads/2023/08/samsung-990-pro-heatsink.png?q=50&fit=contain&w=420&dpr=1.5', categoryId: 'cmm1v54tx0009pr3shd94o9gu', createdAt: new Date('2026-02-25T10:30:47.859Z'), updatedAt: new Date('2026-02-25T10:30:47.859Z') },
    { id: 'cmm1w58oa002apr3sat58wcrr', name: 'AMD Ryzen 9 9950X', description: 'Next-gen flagship CPU with incredible multi-core performance.', price: 799.99, sku: 'AMD-R9-9950X-2026', stock: 7, imageUrl: 'https://zestrogaming.com/wp-content/uploads/2025/02/Untitled-design-4.png', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', createdAt: new Date('2026-02-25T10:27:59.915Z'), updatedAt: new Date('2026-02-25T10:27:59.915Z') },
    { id: 'cmm1w2urw0026pr3snj5p7r4w', name: 'Intel Core Ultra 9', description: 'High-end AI-accelerated CPU built for gaming and productivity.', price: 699.99, sku: 'INT-ULTRA9-2026', stock: 11, imageUrl: 'https://www.epgcomputers.com/cdn/shop/files/I9.png?v=1700617358&width=2048', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0', createdAt: new Date('2026-02-25T10:26:08.589Z'), updatedAt: new Date('2026-02-25T10:26:08.589Z') },
    { id: 'cmm1w0uts0024pr3sib90zh7e', name: 'EVGA SuperNOVA 750 G6', description: 'Compact, efficient, and fully modular 80+ Gold PSU.', price: 119.99, sku: 'EVGA-750G6-2026', stock: 25, imageUrl: 'https://images.evga.com/products/gallery/png/220-G6-0750-X1_XL_1.png', categoryId: 'cmm1v5alm000apr3snqnff737', createdAt: new Date('2026-02-25T10:24:35.344Z'), updatedAt: new Date('2026-02-25T10:24:35.344Z') },
    { id: 'cmm1vz2200022pr3srinxg6ao', name: 'Corsair RM850x', description: 'Fully modular 80+ Gold PSU with superior reliability.', price: 139.99, sku: 'COR-RM850X-2026', stock: 20, imageUrl: 'https://noveltycomputech.com/cdn/shop/files/cp-9020263-in-image-main-600x600.png?v=1728822382&width=1500', categoryId: 'cmm1v5alm000apr3snqnff737', createdAt: new Date('2026-02-25T10:23:11.400Z'), updatedAt: new Date('2026-02-25T10:23:11.400Z') },
    { id: 'cmm1vyen60020pr3s506ely3s', name: 'Cooler Master NR200', description: 'Compact Mini-ITX case offering top-tier airflow and build flexibility.', price: 89.99, sku: 'CM-NR200-2026', stock: 24, imageUrl: 'https://a.storyblok.com/f/281110/8160b09dd5/nr200p-v2-black-gallery-05.png', categoryId: 'cmm1v5l0i000cpr3syvlove4t', createdAt: new Date('2026-02-25T10:22:41.058Z'), updatedAt: new Date('2026-02-25T10:22:41.058Z') },
    { id: 'cmm1vxpgt001ypr3se9r67c93', name: 'NZXT H7 Flow', description: 'Optimized airflow mid-tower with clean minimalist design.', price: 139.99, sku: 'NZXT-H7FLOW-2026', stock: 18, imageUrl: 'https://nzxt.com/cdn/shop/files/case_h7_flow_b_hero_with-system_with-frontlight_pl_png.png?v=1747157211&width=2000', categoryId: 'cmm1v5l0i000cpr3syvlove4t', createdAt: new Date('2026-02-25T10:22:08.429Z'), updatedAt: new Date('2026-02-25T10:22:08.429Z') },
    { id: 'cmm1vx7si001wpr3s0v1xln1p', name: 'Lian Li PC-O11 Dynamic', description: 'Modern mid-tower chassis known for airflow and water-cooling potential.', price: 159.99, sku: 'LIANLI-O11D-2026', stock: 15, imageUrl: 'https://lian-li.com/wp-content/uploads/2023/09/O11D-EVO-XL-001.webp', categoryId: 'cmm1v5l0i000cpr3syvlove4t', createdAt: new Date('2026-02-25T10:21:45.522Z'), updatedAt: new Date('2026-02-25T10:21:45.522Z') },
    { id: 'cmm1vv5yi001upr3s53japeq9', name: 'Gigabyte X670E AORUS Master', description: 'High-end motherboard featuring PCIe 5.0 and DDR5 support.', price: 499.99, sku: 'GIGA-X670E-MASTER-2026', stock: 8, imageUrl: 'https://static.gigabyte.com/StaticFile/Image/Global/ecf24b0c2d333ca9393e0d80919ba61f/Product/31792', categoryId: 'cmm1v4odz0006pr3svznkvkwg', createdAt: new Date('2026-02-25T10:20:09.835Z'), updatedAt: new Date('2026-02-25T10:20:09.835Z') },
    { id: 'cmm1vuk1f001spr3sjqj05pnq', name: 'MSI B650M Mortar WiFi', description: 'Compact mATX motherboard built for Ryzen 7000 series CPUs.', price: 229.99, sku: 'MSI-B650M-MORTAR-2026', stock: 17, imageUrl: 'https://www.mansacomputers.com/cdn/shop/products/4_1896e6a8-0961-4a4c-ac22-508b47726c07_1200x.png?v=1679204623', categoryId: 'cmm1v4odz0006pr3svznkvkwg', createdAt: new Date('2026-02-25T10:19:41.427Z'), updatedAt: new Date('2026-02-25T10:19:41.427Z') },
    { id: 'cmm1vu64n001qpr3sz5ahh11y', name: 'ASUS ROG Strix Z790-E', description: 'Premium ATX motherboard designed for 14th Gen Intel performance.', price: 459.99, sku: 'ASUS-Z790E-2026', stock: 12, imageUrl: 'https://dlcdnwebimgs.asus.com/files/media/9A827026-9AD2-4CE7-9958-DB583A2DB6F8/v1/img/spec/performance.png', categoryId: 'cmm1v4odz0006pr3svznkvkwg', createdAt: new Date('2026-02-25T10:19:23.399Z'), updatedAt: new Date('2026-02-25T10:19:23.399Z') },
    { id: 'cmm1vtp9l001opr3s373xkqz6', name: 'ASUS TUF Gaming VG27AQ', description: 'Fast 165Hz QHD monitor with ELMB Sync.', price: 379.99, sku: 'ASUS-VG27AQ-2026', stock: 21, imageUrl: 'https://www.asus.com/media/global/gallery/2hntgr1bkgg8lc0t_setting_xxx_0_90_end_2000.png', categoryId: 'cmm1v5py0000dpr3srct3v2ce', createdAt: new Date('2026-02-25T10:19:01.545Z'), updatedAt: new Date('2026-02-25T10:19:01.545Z') },
    { id: 'cmm1vt4kw001mpr3s623uq236', name: 'Samsung Odyssey G8 OLED', description: 'Ultrawide OLED panel with 240Hz refresh rate for stunning visuals.', price: 1299.99, sku: 'SAM-G8OLED-2026', stock: 6, imageUrl: 'https://www.mtech.am/assets/images/8b/8b90a1_kz-ru-odyssey-oled-g8-g85sb-ls34--1-.png', categoryId: 'cmm1v5py0000dpr3srct3v2ce', createdAt: new Date('2026-02-25T10:18:34.736Z'), updatedAt: new Date('2026-02-25T10:18:34.736Z') },
    { id: 'cmm1vs93j001kpr3spd2zh164', name: 'LG UltraGear 27GN950', description: '4K 144Hz gaming monitor with Nano IPS technology.', price: 749.99, sku: 'LG-27GN950-2026', stock: 9, imageUrl: 'https://bitkart.com/cdn/shop/files/1_3537ee34-6ae1-4780-b37c-657bd67ab7bc_large.png?v=1762330014', categoryId: 'cmm1v5py0000dpr3srct3v2ce', createdAt: new Date('2026-02-25T10:17:53.936Z'), updatedAt: new Date('2026-02-25T10:17:53.936Z') },
    { id: 'cmm1vrm12001ipr3si68r1cv8', name: 'Corsair M65 RGB Ultra', description: 'Durable FPS gaming mouse with adjustable weights.', price: 99.99, sku: 'COR-M65RGBU-2026', stock: 19, imageUrl: 'https://quadrastores.com/cdn/shop/files/62e2d24be886df3c39ff54c7608890f4.png?v=1756062682&width=1445', categoryId: 'cmm1v5zrt000fpr3s955iajjj', createdAt: new Date('2026-02-25T10:17:24.039Z'), updatedAt: new Date('2026-02-25T10:17:24.039Z') },
    { id: 'cmm1vr06d001gpr3sxy4lw80h', name: 'Razer Viper Ultimate', description: 'Lightweight wireless mouse with Focus+ optical sensor.', price: 129.99, sku: 'RAZ-VIPER-U-2026', stock: 13, imageUrl: 'https://media.tatacroma.com/Croma%20Assets/Computers%20Peripherals/Computer%20Accessories%20and%20Tablets%20Accessories/Images/242033_0_lt56qb.png', categoryId: 'cmm1v5zrt000fpr3s955iajjj', createdAt: new Date('2026-02-25T10:16:55.717Z'), updatedAt: new Date('2026-02-25T10:16:55.717Z') },
    { id: 'cmm1vq5n2001epr3shwicgzou', name: 'Logitech G502 X', description: 'Ultra-precise gaming mouse with HERO sensor and customizable buttons.', price: 79.99, sku: 'LOGI-G502X-2026', stock: 22, imageUrl: 'https://resource.logitechg.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/g502x-plus/gallery/g502x-plus-gallery-2-black.png?v=1', categoryId: 'cmm1v5zrt000fpr3s955iajjj', createdAt: new Date('2026-02-25T10:16:16.142Z'), updatedAt: new Date('2026-02-25T10:16:16.142Z') },
    { id: 'cmm1vpjnl001cpr3sf3187f65', name: 'Kingston Fury Beast DDR4 16GB', description: 'Reliable DDR4 RAM offering stability and speed for gaming.', price: 59.99, sku: 'KING-FURY-16GB-2026', stock: 30, imageUrl: 'https://solidhardware.store/wp-content/uploads/2025/08/kingstonfury-beast-600x600.png', categoryId: 'cmm1v4u9i0007pr3szojyaamk', createdAt: new Date('2026-02-25T10:15:47.650Z'), updatedAt: new Date('2026-02-25T10:15:47.650Z') },
    { id: 'cmm1vox8v001apr3snkqf52yt', name: 'Corsair Vengeance DDR5 64GB', description: 'High-capacity DDR5 memory designed for multitasking and productivity.', price: 299.99, sku: 'COR-VEN-DDR5-64GB-2026', stock: 13, imageUrl: 'https://assets.corsair.com/image/upload/c_pad,q_auto,h_1024,w_1024,f_auto/products/Memory/vengeance-ddr5-blk-config/Gallery/Vengeance-DDR5-2UP-64GB-BLACK_01.webp', categoryId: 'cmm1v4u9i0007pr3szojyaamk', createdAt: new Date('2026-02-25T10:15:18.607Z'), updatedAt: new Date('2026-02-25T10:15:18.607Z') },
  ];

  for (const prod of products) {
    await prisma.product.upsert({ where: { id: prod.id }, update: {}, create: prod });
  }
  console.log(`✅ ${products.length} products inserted`);


  const adminPassword = 'Admin@2026';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      id: 'admin-user-001',
      name: 'Admin',
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created');
  console.log('   📧 Email:    admin@ecommerce.com');
  console.log('   🔑 Password: ' + adminPassword);


  const discounts = [
    {
      id: 'disc-001',
      code: 'SUMMER25',
      discount: 25,
      type: 'PERCENTAGE',
      expiryDate: new Date('2026-09-01T00:00:00.000Z'),
      status: 'ACTIVE',
      usageCount: 0,
      maxUses: 100,
      productId: null,
    },
    {
      id: 'disc-002',
      code: 'SAVE50',
      discount: 50,
      type: 'FIXED',
      expiryDate: new Date('2026-12-31T00:00:00.000Z'),
      status: 'ACTIVE',
      usageCount: 0,
      maxUses: 200,
      productId: null,
    },
    {
      id: 'disc-003',
      code: 'GPU15',
      discount: 15,
      type: 'PERCENTAGE',
      expiryDate: new Date('2026-08-15T00:00:00.000Z'),
      status: 'ACTIVE',
      usageCount: 0,
      maxUses: 50,
      productId: 'cmm1w58oa002apr3sat58wcrr', 
    },
    {
      id: 'disc-004',
      code: 'WELCOME10',
      discount: 10,
      type: 'PERCENTAGE',
      expiryDate: new Date('2026-12-31T00:00:00.000Z'),
      status: 'ACTIVE',
      usageCount: 0,
      maxUses: 500,
      productId: null,
    },
    {
      id: 'disc-005',
      code: 'FLASH100',
      discount: 100,
      type: 'FIXED',
      expiryDate: new Date('2026-06-01T00:00:00.000Z'),
      status: 'ACTIVE',
      usageCount: 0,
      maxUses: 30,
      productId: 'cmm1vt4kw001mpr3s623uq236', // Samsung Odyssey G8 OLED
    },
  ];

  for (const disc of discounts) {
    await prisma.discount.upsert({ where: { id: disc.id }, update: {}, create: disc });
  }
  console.log(`✅ ${discounts.length} discounts inserted`);

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

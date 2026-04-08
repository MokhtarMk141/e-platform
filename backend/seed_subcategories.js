const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const subcategories = [
  // Computers
  { id: 'sub-desktop-pc', name: 'Desktop PC', description: 'Standard desktop computers for home, office, and general use.', categoryId: 'cmlt9st2d0003qk1yrwdfgm8k' },
  { id: 'sub-gaming-pc', name: 'Gaming PC', description: 'Desktop computers optimized for gaming performance.', categoryId: 'cmlt9st2d0003qk1yrwdfgm8k' },
  { id: 'sub-workstation-pc', name: 'Workstation PC', description: 'High-performance computers for professional workloads.', categoryId: 'cmlt9st2d0003qk1yrwdfgm8k' },
  { id: 'sub-all-in-one-pc', name: 'All-in-One PC', description: 'Integrated desktop computers with built-in display.', categoryId: 'cmlt9st2d0003qk1yrwdfgm8k' },
  { id: 'sub-mini-pc', name: 'Mini PC', description: 'Compact desktop systems for light work and media usage.', categoryId: 'cmlt9st2d0003qk1yrwdfgm8k' },
  { id: 'sub-office-pc', name: 'Office PC', description: 'Reliable desktop systems for office productivity.', categoryId: 'cmlt9st2d0003qk1yrwdfgm8k' },
  { id: 'sub-custom-built-pc', name: 'Custom Built PC', description: 'Custom-configured desktop computers for specific needs.', categoryId: 'cmlt9st2d0003qk1yrwdfgm8k' },

  // Laptops
  { id: 'sub-gaming-laptop', name: 'Gaming Laptop', description: 'Portable computers designed for gaming.', categoryId: 'cmm0mbz600002pr51w0x0voa3' },
  { id: 'sub-business-laptop', name: 'Business Laptop', description: 'Laptops built for professional productivity and office work.', categoryId: 'cmm0mbz600002pr51w0x0voa3' },
  { id: 'sub-student-laptop', name: 'Student Laptop', description: 'Affordable and practical laptops for students.', categoryId: 'cmm0mbz600002pr51w0x0voa3' },
  { id: 'sub-ultrabook', name: 'Ultrabook', description: 'Thin and lightweight premium laptops.', categoryId: 'cmm0mbz600002pr51w0x0voa3' },
  { id: 'sub-2in1-laptop', name: '2-in-1 Laptop', description: 'Convertible laptops that can function as both laptop and tablet.', categoryId: 'cmm0mbz600002pr51w0x0voa3' },
  { id: 'sub-workstation-laptop', name: 'Workstation Laptop', description: 'Laptops for advanced professional workloads.', categoryId: 'cmm0mbz600002pr51w0x0voa3' },
  { id: 'sub-macbook', name: 'MacBook', description: 'Apple laptops for productivity and creative work.', categoryId: 'cmm0mbz600002pr51w0x0voa3' },
  { id: 'sub-chromebook', name: 'Chromebook', description: 'Lightweight laptops based on ChromeOS.', categoryId: 'cmm0mbz600002pr51w0x0voa3' },

  // PC Components
  { id: 'sub-cpu', name: 'Processors', description: 'Modern desktop processors including Intel Core Ultra and AMD Ryzen series.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-gpu', name: 'Graphics Cards', description: 'High-performance GPUs for gaming, AI, and professional workloads.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-motherboard', name: 'Motherboards', description: 'ATX, mATX, and Mini-ITX motherboards for various PC builds.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-ram', name: 'Memory', description: 'High-speed DDR4 and DDR5 memory kits.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-ssd', name: 'SSD', description: 'Solid-state drives for high-speed storage.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-hdd', name: 'HDD', description: 'Hard disk drives for large-capacity storage.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-nvme-ssd', name: 'NVMe SSD', description: 'Ultra-fast NVMe solid-state storage drives.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-psu', name: 'Power Supplies', description: '80+ certified power supply units for PC builds.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-case', name: 'PC Cases', description: 'Full-tower, mid-tower, and mini-tower computer cases.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-cpu-cooler', name: 'CPU Cooling', description: 'Air coolers and liquid cooling systems for processors.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-case-fans', name: 'Case Fans', description: 'Cooling fans for improved airflow inside computer cases.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-thermal-paste', name: 'Thermal Paste', description: 'Thermal compounds for better heat transfer between CPU and cooler.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-sound-card', name: 'Sound Card', description: 'Dedicated internal sound cards for audio enhancement.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-optical-drive', name: 'Optical Drive', description: 'DVD and Blu-ray drives for reading or writing discs.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },
  { id: 'sub-capture-card', name: 'Capture Card', description: 'Cards for video capture and streaming setups.', categoryId: 'cmm1v4hlo0005pr3sgbrb98m0' },

  // Monitors
  { id: 'sub-gaming-monitor', name: 'Gaming Monitor', description: 'High refresh-rate monitors for gaming.', categoryId: 'cmm1v4odz0006pr3svznkvkwg' },
  { id: 'sub-office-monitor', name: 'Office Monitor', description: 'Displays suited for office productivity.', categoryId: 'cmm1v4odz0006pr3svznkvkwg' },
  { id: 'sub-ultrawide-monitor', name: 'Ultrawide Monitor', description: 'Wide-format monitors for multitasking and immersion.', categoryId: 'cmm1v4odz0006pr3svznkvkwg' },
  { id: 'sub-curved-monitor', name: 'Curved Monitor', description: 'Curved displays for a more immersive viewing experience.', categoryId: 'cmm1v4odz0006pr3svznkvkwg' },
  { id: 'sub-4k-monitor', name: '4K Monitor', description: 'Ultra-high-resolution monitors for sharp visuals.', categoryId: 'cmm1v4odz0006pr3svznkvkwg' },
  { id: 'sub-portable-monitor', name: 'Portable Monitor', description: 'Lightweight external displays for mobility.', categoryId: 'cmm1v4odz0006pr3svznkvkwg' },

  // Peripherals
  { id: 'sub-keyboard', name: 'Keyboard', description: 'Mechanical and membrane keyboards for gaming and productivity.', categoryId: 'cmm1v4u9i0007pr3szojyaamk' },
  { id: 'sub-mouse', name: 'Mouse', description: 'Precision mice for gaming and office use.', categoryId: 'cmm1v4u9i0007pr3szojyaamk' },
  { id: 'sub-mouse-pad', name: 'Mouse Pad', description: 'Mouse pads for comfort, precision, and gaming.', categoryId: 'cmm1v4u9i0007pr3szojyaamk' },
  { id: 'sub-headset', name: 'Headset', description: 'Audio headsets for gaming, communication, and entertainment.', categoryId: 'cmm1v4u9i0007pr3szojyaamk' },
  { id: 'sub-microphone', name: 'Microphone', description: 'Standalone microphones for streaming, meetings, and recording.', categoryId: 'cmm1v4u9i0007pr3szojyaamk' },
  { id: 'sub-webcam', name: 'Webcam', description: 'Cameras for video calls, meetings, and streaming.', categoryId: 'cmm1v4u9i0007pr3szojyaamk' },
  { id: 'sub-speakers', name: 'Speakers', description: 'External speakers for desktop audio output.', categoryId: 'cmm1v4u9i0007pr3szojyaamk' },
  { id: 'sub-printer', name: 'Printer', description: 'Printers for home and office documents.', categoryId: 'cmm1v4u9i0007pr3szojyaamk' },
  { id: 'sub-scanner', name: 'Scanner', description: 'Devices for scanning documents and images.', categoryId: 'cmm1v4u9i0007pr3szojyaamk' },
  { id: 'sub-controller', name: 'Controller', description: 'Game controllers for PC gaming.', categoryId: 'cmm1v4u9i0007pr3szojyaamk' },
  { id: 'sub-drawing-tablet', name: 'Drawing Tablet', description: 'Graphic tablets for digital design and illustration.', categoryId: 'cmm1v4u9i0007pr3szojyaamk' },

  // Storage Devices
  { id: 'sub-internal-hdd', name: 'Internal HDD', description: 'Internal hard drives for desktop and laptop storage.', categoryId: 'cmm1v4zpy0008pr3srmq3d7pa' },
  { id: 'sub-internal-ssd', name: 'Internal SSD', description: 'Internal solid-state drives for fast storage.', categoryId: 'cmm1v4zpy0008pr3srmq3d7pa' },
  { id: 'sub-external-hdd', name: 'External HDD', description: 'Portable external hard drives for backup and transfer.', categoryId: 'cmm1v4zpy0008pr3srmq3d7pa' },
  { id: 'sub-external-ssd', name: 'External SSD', description: 'Portable solid-state drives with high transfer speeds.', categoryId: 'cmm1v4zpy0008pr3srmq3d7pa' },
  { id: 'sub-usb-flash-drive', name: 'USB Flash Drive', description: 'Portable USB drives for file transfer and backup.', categoryId: 'cmm1v4zpy0008pr3srmq3d7pa' },
  { id: 'sub-memory-card', name: 'Memory Card', description: 'Storage cards such as SD and microSD.', categoryId: 'cmm1v4zpy0008pr3srmq3d7pa' },
  { id: 'sub-nas-storage', name: 'NAS Storage', description: 'Network-attached storage devices for centralized data storage.', categoryId: 'cmm1v4zpy0008pr3srmq3d7pa' },

  // Networking
  { id: 'sub-router', name: 'Router', description: 'Routers for wired and wireless internet connectivity.', categoryId: 'cmm1v54tx0009pr3shd94o9gu' },
  { id: 'sub-modem', name: 'Modem', description: 'Modems for internet access through service providers.', categoryId: 'cmm1v54tx0009pr3shd94o9gu' },
  { id: 'sub-wifi-adapter', name: 'Wi-Fi Adapter', description: 'USB and PCIe adapters for wireless connectivity.', categoryId: 'cmm1v54tx0009pr3shd94o9gu' },
  { id: 'sub-network-card', name: 'Network Card', description: 'PCIe network interface cards for wired or wireless networking.', categoryId: 'cmm1v54tx0009pr3shd94o9gu' },
  { id: 'sub-switch', name: 'Switch', description: 'Network switches for connecting multiple devices.', categoryId: 'cmm1v54tx0009pr3shd94o9gu' },
  { id: 'sub-range-extender', name: 'Range Extender', description: 'Devices to extend Wi-Fi coverage.', categoryId: 'cmm1v54tx0009pr3shd94o9gu' },
  { id: 'sub-access-point', name: 'Access Point', description: 'Wireless access points for network expansion.', categoryId: 'cmm1v54tx0009pr3shd94o9gu' },
  { id: 'sub-ethernet-cable-network', name: 'Ethernet Cable', description: 'Cables for wired network connections.', categoryId: 'cmm1v54tx0009pr3shd94o9gu' },

  // Laptop Accessories
  { id: 'sub-laptop-bag', name: 'Laptop Bag', description: 'Protective bags and sleeves for carrying laptops.', categoryId: 'cmm1v5alm000apr3snqnff737' },
  { id: 'sub-laptop-stand', name: 'Laptop Stand', description: 'Stands for ergonomic laptop usage.', categoryId: 'cmm1v5alm000apr3snqnff737' },
  { id: 'sub-docking-station', name: 'Docking Station', description: 'Hubs and docking stations for laptop connectivity.', categoryId: 'cmm1v5alm000apr3snqnff737' },
  { id: 'sub-laptop-charger', name: 'Laptop Charger', description: 'Replacement and original chargers for laptops.', categoryId: 'cmm1v5alm000apr3snqnff737' },
  { id: 'sub-cooling-pad', name: 'Cooling Pad', description: 'Cooling pads to reduce laptop heat.', categoryId: 'cmm1v5alm000apr3snqnff737' },
  { id: 'sub-screen-protector', name: 'Screen Protector', description: 'Protective films for laptop displays.', categoryId: 'cmm1v5alm000apr3snqnff737' },
  { id: 'sub-keyboard-cover', name: 'Keyboard Cover', description: 'Covers for laptop keyboards.', categoryId: 'cmm1v5alm000apr3snqnff737' },
  { id: 'sub-laptop-battery', name: 'Battery', description: 'Replacement batteries for laptops.', categoryId: 'cmm1v5alm000apr3snqnff737' },

  // Cables and Adapters
  { id: 'sub-hdmi-cable', name: 'HDMI Cable', description: 'HDMI cables for video and audio output.', categoryId: 'cmm1v5fd5000bpr3snungry1w' },
  { id: 'sub-displayport-cable', name: 'DisplayPort Cable', description: 'DisplayPort cables for monitors and graphics cards.', categoryId: 'cmm1v5fd5000bpr3snungry1w' },
  { id: 'sub-vga-cable', name: 'VGA Cable', description: 'VGA cables for legacy video connections.', categoryId: 'cmm1v5fd5000bpr3snungry1w' },
  { id: 'sub-dvi-cable', name: 'DVI Cable', description: 'DVI cables for digital video connections.', categoryId: 'cmm1v5fd5000bpr3snungry1w' },
  { id: 'sub-usb-cable', name: 'USB Cable', description: 'USB cables for power and data transfer.', categoryId: 'cmm1v5fd5000bpr3snungry1w' },
  { id: 'sub-usbc-cable', name: 'USB-C Cable', description: 'USB-C cables for modern devices.', categoryId: 'cmm1v5fd5000bpr3snungry1w' },
  { id: 'sub-sata-cable', name: 'SATA Cable', description: 'SATA cables for internal storage devices.', categoryId: 'cmm1v5fd5000bpr3snungry1w' },
  { id: 'sub-audio-cable', name: 'Audio Cable', description: 'Audio cables for speakers, headphones, and microphones.', categoryId: 'cmm1v5fd5000bpr3snungry1w' },
  { id: 'sub-power-cable', name: 'Power Cable', description: 'Power cables for desktops, monitors, and accessories.', categoryId: 'cmm1v5fd5000bpr3snungry1w' },
  { id: 'sub-adapter', name: 'Adapter', description: 'Adapters for connectivity between different ports and standards.', categoryId: 'cmm1v5fd5000bpr3snungry1w' },
  { id: 'sub-converter', name: 'Converter', description: 'Converters for signal or port type changes.', categoryId: 'cmm1v5fd5000bpr3snungry1w' },

  // Gaming Accessories
  { id: 'sub-gaming-keyboard', name: 'Gaming Keyboard', description: 'Gaming keyboards with advanced features and lighting.', categoryId: 'cmm1v5l0i000cpr3syvlove4t' },
  { id: 'sub-gaming-mouse', name: 'Gaming Mouse', description: 'High-precision gaming mice.', categoryId: 'cmm1v5l0i000cpr3syvlove4t' },
  { id: 'sub-gaming-headset', name: 'Gaming Headset', description: 'Gaming-focused headsets with immersive sound.', categoryId: 'cmm1v5l0i000cpr3syvlove4t' },
  { id: 'sub-gaming-chair', name: 'Gaming Chair', description: 'Ergonomic chairs designed for gaming setups.', categoryId: 'cmm1v5l0i000cpr3syvlove4t' },
  { id: 'sub-rgb-lights', name: 'RGB Lights', description: 'Decorative RGB lighting for gaming setups.', categoryId: 'cmm1v5l0i000cpr3syvlove4t' },
  { id: 'sub-streaming-accessories', name: 'Streaming Accessories', description: 'Accessories for streaming and content creation.', categoryId: 'cmm1v5l0i000cpr3syvlove4t' },

  // Office Accessories
  { id: 'sub-office-keyboard', name: 'Office Keyboard', description: 'Keyboards designed for office productivity.', categoryId: 'cmm1v5py0000dpr3srct3v2ce' },
  { id: 'sub-office-mouse', name: 'Office Mouse', description: 'Mice optimized for comfort and office work.', categoryId: 'cmm1v5py0000dpr3srct3v2ce' },
  { id: 'sub-desk-lamp', name: 'Desk Lamp', description: 'Lamps for desk illumination and productivity.', categoryId: 'cmm1v5py0000dpr3srct3v2ce' },
  { id: 'sub-ergonomic-accessories', name: 'Ergonomic Accessories', description: 'Accessories that improve comfort and ergonomics at work.', categoryId: 'cmm1v5py0000dpr3srct3v2ce' },
  { id: 'sub-surge-protector-office', name: 'Surge Protector', description: 'Protection devices against electrical surges.', categoryId: 'cmm1v5py0000dpr3srct3v2ce' },

  // Power Solutions
  { id: 'sub-ups', name: 'UPS', description: 'Uninterruptible power supply systems for backup power.', categoryId: 'cmm1v5upq000epr3sgq7zxxcw' },
  { id: 'sub-power-strip', name: 'Power Strip', description: 'Multi-outlet power strips for multiple devices.', categoryId: 'cmm1v5upq000epr3sgq7zxxcw' },
  { id: 'sub-universal-adapter', name: 'Universal Adapter', description: 'Adapters for power compatibility across devices and regions.', categoryId: 'cmm1v5upq000epr3sgq7zxxcw' },
  { id: 'sub-desktop-power-cable', name: 'Desktop Power Cable', description: 'Power cables for desktop computers and monitors.', categoryId: 'cmm1v5upq000epr3sgq7zxxcw' },
  { id: 'sub-laptop-charger-power', name: 'Laptop Charger', description: 'Chargers for laptops and mobile workstations.', categoryId: 'cmm1v5upq000epr3sgq7zxxcw' },

  // Software
  { id: 'sub-operating-system', name: 'Operating System', description: 'Operating systems such as Windows and Linux distributions.', categoryId: 'cmm1v5zrt000fpr3s955iajjj' },
  { id: 'sub-office-software', name: 'Office Software', description: 'Software for documents, spreadsheets, and presentations.', categoryId: 'cmm1v5zrt000fpr3s955iajjj' },
  { id: 'sub-antivirus', name: 'Antivirus', description: 'Security software for malware and virus protection.', categoryId: 'cmm1v5zrt000fpr3s955iajjj' },
  { id: 'sub-design-software', name: 'Design Software', description: 'Software for graphic design, editing, and creative work.', categoryId: 'cmm1v5zrt000fpr3s955iajjj' },
  { id: 'sub-utility-software', name: 'Utility Software', description: 'Maintenance, recovery, and optimization software.', categoryId: 'cmm1v5zrt000fpr3s955iajjj' },

  // Accessories
  { id: 'sub-mouse-pad-general', name: 'Mouse Pad', description: 'General-purpose mouse pads.', categoryId: 'cmm1v64a4000gpr3sbhcbofiv' },
  { id: 'sub-usb-hub', name: 'USB Hub', description: 'USB hubs for expanding connectivity.', categoryId: 'cmm1v64a4000gpr3sbhcbofiv' },
  { id: 'sub-cleaning-kit', name: 'Cleaning Kit', description: 'Cleaning tools for computers and accessories.', categoryId: 'cmm1v64a4000gpr3sbhcbofiv' },
  { id: 'sub-riser-cable', name: 'Riser Cable', description: 'PCIe riser cables for custom PC builds.', categoryId: 'cmm1v64a4000gpr3sbhcbofiv' },
  { id: 'sub-device-stand', name: 'Device Stand', description: 'Stands for accessories and devices.', categoryId: 'cmm1v64a4000gpr3sbhcbofiv' }
];

async function main() {
  console.log('🌱 Seeding subcategories...');
  
  const categoryNames = {
    'cmlt9st2d0003qk1yrwdfgm8k': 'Computers',
    'cmm0mbz600002pr51w0x0voa3': 'Laptops',
    'cmm1v4hlo0005pr3sgbrb98m0': 'PC Components',
    'cmm1v4odz0006pr3svznkvkwg': 'Monitors',
    'cmm1v4u9i0007pr3szojyaamk': 'Peripherals',
    'cmm1v4zpy0008pr3srmq3d7pa': 'Storage Devices',
    'cmm1v54tx0009pr3shd94o9gu': 'Networking',
    'cmm1v5alm000apr3snqnff737': 'Laptop Accessories',
    'cmm1v5fd5000bpr3snungry1w': 'Cables and Adapters',
    'cmm1v5l0i000cpr3syvlove4t': 'Gaming Accessories',
    'cmm1v5py0000dpr3srct3v2ce': 'Office Accessories',
    'cmm1v5upq000epr3sgq7zxxcw': 'Power Solutions',
    'cmm1v5zrt000fpr3s955iajjj': 'Software',
    'cmm1v64a4000gpr3sbhcbofiv': 'Accessories'
  };

  const nameCounts = {};
  subcategories.forEach(s => { nameCounts[s.name] = (nameCounts[s.name] || 0) + 1; });

  for (const sub of subcategories) {
    let finalName = sub.name;
    if (nameCounts[sub.name] > 1) {
      finalName = `${sub.name} (${categoryNames[sub.categoryId]})`;
    }

    await prisma.subcategory.upsert({
      where: { id: sub.id },
      update: { ...sub, name: finalName },
      create: { ...sub, name: finalName },
    });
  }

  console.log('🎉 Subcategory seeding complete!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

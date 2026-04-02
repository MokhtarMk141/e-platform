import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎟️ Seeding a test coupon: WELCOME10");

  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1); // Valid for 1 year

  const coupon = await prisma.discount.upsert({
    where: { code: "WELCOME10" },
    update: {
      discount: 10,
      type: "PERCENTAGE",
      expiryDate: expiry,
      status: "ACTIVE",
      maxUses: 100,
    },
    create: {
      code: "WELCOME10",
      discount: 10,
      type: "PERCENTAGE",
      expiryDate: expiry,
      status: "ACTIVE",
      maxUses: 100,
    },
  });

  console.log("✅ Coupon seeded successfully:", coupon);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

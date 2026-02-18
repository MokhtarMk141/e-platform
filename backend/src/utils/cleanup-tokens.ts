import { prisma } from "../config/database";

/**
 * Deletes all refresh tokens that are expired or revoked.
 * Run manually: npx ts-node src/utils/cleanup-tokens.ts
 * Or schedule via cron in production.
 */
async function cleanupTokens() {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { revoked: true },
        { expiresAt: { lt: new Date() } },
      ],
    },
  });

  console.log(`🗑️  Cleaned up ${result.count} expired/revoked refresh tokens.`);
}

// Run directly if called as a script
cleanupTokens()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

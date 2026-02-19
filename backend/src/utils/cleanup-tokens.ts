import { prisma } from "../config/database";

/**
 * Deletes all refresh tokens and password reset tokens that are expired or revoked.
 * Run manually: npx ts-node src/utils/cleanup-tokens.ts
 * Or schedule via cron in production.
 */
async function cleanupTokens() {
  // 1. Refresh Tokens
  const refreshResult = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { revoked: true },
        { expiresAt: { lt: new Date() } },
      ],
    },
  });

  // 2. Password Reset Tokens
  const resetResult = await prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  console.log(`🗑️  Cleanup Complete:`);
  console.log(`   - ${refreshResult.count} expired/revoked refresh tokens deleted.`);
  console.log(`   - ${resetResult.count} expired password reset tokens deleted.`);
}

// Run directly if called as a script
cleanupTokens()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

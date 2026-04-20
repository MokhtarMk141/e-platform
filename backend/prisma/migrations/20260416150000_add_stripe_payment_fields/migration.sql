ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PAID';

ALTER TABLE "Order"
ADD COLUMN "stripeSessionId" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");

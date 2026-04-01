ALTER TABLE "Order"
ADD COLUMN "customerName" TEXT,
ADD COLUMN "customerEmail" TEXT,
ADD COLUMN "customerPhone" TEXT,
ADD COLUMN "shippingAddressLine1" TEXT,
ADD COLUMN "shippingAddressLine2" TEXT,
ADD COLUMN "shippingCity" TEXT,
ADD COLUMN "shippingState" TEXT,
ADD COLUMN "shippingPostalCode" TEXT,
ADD COLUMN "shippingCountry" TEXT,
ADD COLUMN "deliveryMode" TEXT NOT NULL DEFAULT 'STANDARD',
ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'CASH_ON_DELIVERY',
ADD COLUMN "orderNotes" TEXT;

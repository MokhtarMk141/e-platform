-- CreateEnum
CREATE TYPE "PromotionDiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateTable
CREATE TABLE "ProductDiscount" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "discountType" "PromotionDiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryDiscount" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "discountType" "PromotionDiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashSale" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discountType" "PromotionDiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashSaleProduct" (
    "id" TEXT NOT NULL,
    "flashSaleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "FlashSaleProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "PromotionDiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- Migrate existing product-level discounts from Product.discountPercentage
INSERT INTO "ProductDiscount" (
    "id",
    "productId",
    "discountType",
    "discountValue",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    CONCAT('legacy_product_', "id"),
    "id",
    'PERCENTAGE'::"PromotionDiscountType",
    "discountPercentage",
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Product"
WHERE "discountPercentage" > 0;

-- Migrate existing Discount rows into ProductDiscount/Coupon
INSERT INTO "ProductDiscount" (
    "id",
    "productId",
    "discountType",
    "discountValue",
    "endDate",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "productId",
    CASE WHEN "type" = 'PERCENTAGE' THEN 'PERCENTAGE'::"PromotionDiscountType" ELSE 'FIXED'::"PromotionDiscountType" END,
    "discount",
    "expiryDate",
    CASE WHEN "status" = 'ACTIVE' THEN true ELSE false END,
    "createdAt",
    "updatedAt"
FROM "Discount"
WHERE "code" IS NULL AND "productId" IS NOT NULL;

INSERT INTO "Coupon" (
    "id",
    "code",
    "discountType",
    "discountValue",
    "endDate",
    "usageLimit",
    "usageCount",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "code",
    CASE WHEN "type" = 'PERCENTAGE' THEN 'PERCENTAGE'::"PromotionDiscountType" ELSE 'FIXED'::"PromotionDiscountType" END,
    "discount",
    "expiryDate",
    "maxUses",
    "usageCount",
    CASE WHEN "status" = 'ACTIVE' THEN true ELSE false END,
    "createdAt",
    "updatedAt"
FROM "Discount"
WHERE "code" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FlashSaleProduct_flashSaleId_productId_key" ON "FlashSaleProduct"("flashSaleId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- AddForeignKey
ALTER TABLE "ProductDiscount" ADD CONSTRAINT "ProductDiscount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryDiscount" ADD CONSTRAINT "CategoryDiscount_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashSaleProduct" ADD CONSTRAINT "FlashSaleProduct_flashSaleId_fkey" FOREIGN KEY ("flashSaleId") REFERENCES "FlashSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashSaleProduct" ADD CONSTRAINT "FlashSaleProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Discount" DROP CONSTRAINT IF EXISTS "Discount_productId_fkey";

-- DropTable
DROP TABLE "Discount";

-- DropColumn
ALTER TABLE "Product" DROP COLUMN "discountPercentage";

-- DropEnum
DROP TYPE "DiscountStatus";

-- DropEnum
DROP TYPE "DiscountType";

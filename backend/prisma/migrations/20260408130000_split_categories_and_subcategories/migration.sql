CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subcategory_name_key" ON "Subcategory"("name");
CREATE INDEX "Subcategory_categoryId_idx" ON "Subcategory"("categoryId");

ALTER TABLE "Product" ADD COLUMN "subcategoryId" TEXT;
CREATE INDEX "Product_subcategoryId_idx" ON "Product"("subcategoryId");

ALTER TABLE "Subcategory"
ADD CONSTRAINT "Subcategory_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "Product"
ADD CONSTRAINT "Product_subcategoryId_fkey"
FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_parentId_fkey";
DROP INDEX IF EXISTS "Category_parentId_idx";
ALTER TABLE "Category" DROP COLUMN IF EXISTS "parentId";

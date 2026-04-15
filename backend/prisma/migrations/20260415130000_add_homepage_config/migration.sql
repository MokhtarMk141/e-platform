-- CreateTable
CREATE TABLE "HomepageConfig" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "heroSlides" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomepageConfig_slug_key" ON "HomepageConfig"("slug");

import { Brand } from "@prisma/client";

export class BrandResponseDto {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;

  constructor(brand: Brand & { _count?: { products: number } }) {
    this.id = brand.id;
    this.name = brand.name;
    this.description = brand.description;
    this.logoUrl = brand.logoUrl;
    this.createdAt = brand.createdAt;
    this.updatedAt = brand.updatedAt;
    this.productCount = brand._count?.products || 0;
  }
}

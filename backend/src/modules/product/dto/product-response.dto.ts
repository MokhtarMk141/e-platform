import { ProductWithCategory } from "../product.repository";

export class ProductResponseDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sku: string;
  stock: number;
  imageUrl: string | null;
  categoryId: string | null;
  brandId: string | null;
  category: { id: string; name: string; description: string | null } | null;
  brand: { id: string; name: string; logoUrl: string | null; description: string | null } | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(product: ProductWithCategory) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.sku = product.sku;
    this.stock = product.stock;
    this.imageUrl = product.imageUrl;
    this.categoryId = product.categoryId;
    this.brandId = product.brandId;
    this.category = product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description,
        }
      : null;
    this.brand = product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          logoUrl: product.brand.logoUrl,
          description: product.brand.description,
        }
      : null;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}

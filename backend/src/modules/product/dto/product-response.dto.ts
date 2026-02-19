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
  category: { id: string; name: string; description: string | null } | null;
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
    this.category = product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description,
        }
      : null;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}

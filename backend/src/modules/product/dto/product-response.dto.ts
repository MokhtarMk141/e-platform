import { Product } from "@prisma/client";

export class ProductResponseDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sku: string;
  stock: number;
  imageUrl: string | null;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(product: Product) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.sku = product.sku;
    this.stock = product.stock;
    this.imageUrl = product.imageUrl;
    this.categoryId = product.categoryId;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}
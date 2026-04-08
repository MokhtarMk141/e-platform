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
  subcategoryId: string | null;
  brandId: string | null;
  category: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  subcategory: {
    id: string;
    name: string;
    description: string | null;
    categoryId: string;
    category: { id: string; name: string } | null;
  } | null;
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
    this.subcategoryId = product.subcategoryId;
    this.brandId = product.brandId;
    this.category = product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description,
        }
      : null;
    this.subcategory = product.subcategory
      ? {
          id: product.subcategory.id,
          name: product.subcategory.name,
          description: product.subcategory.description,
          categoryId: product.subcategory.categoryId,
          category: product.subcategory.category
            ? { id: product.subcategory.category.id, name: product.subcategory.category.name }
            : null,
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

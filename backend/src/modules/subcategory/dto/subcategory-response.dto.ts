type SubcategoryShape = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
  category?: { id: string; name: string } | null;
};

export class SubcategoryResponseDto {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string } | null;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;

  constructor(subcategory: SubcategoryShape) {
    this.id = subcategory.id;
    this.name = subcategory.name;
    this.description = subcategory.description;
    this.categoryId = subcategory.categoryId;
    this.category = subcategory.category
      ? { id: subcategory.category.id, name: subcategory.category.name }
      : null;
    this.createdAt = subcategory.createdAt;
    this.updatedAt = subcategory.updatedAt;
    this.productCount = subcategory._count?.products || 0;
  }
}

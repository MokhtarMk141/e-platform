type CategoryShape = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
};

export class CategoryResponseDto {
  id: string;
  name: string;
  description: string | null;
  directProductCount: number;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;

  constructor(category: CategoryShape) {
    this.id = category.id;
    this.name = category.name;
    this.description = category.description;
    this.directProductCount = category._count?.products || 0;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
    this.productCount = this.directProductCount;
  }
}

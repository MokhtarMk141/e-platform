type CategoryShape = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
  parent?: CategoryShape | null;
  children?: CategoryShape[];
};

export class CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  directProductCount: number;
  createdAt: Date;
  updatedAt: Date;
  parent: CategoryResponseDto | null;
  productCount: number;
  children: CategoryResponseDto[];

  constructor(category: CategoryShape) {
    this.id = category.id;
    this.name = category.name;
    this.slug = category.slug;
    this.description = category.description;
    this.parentId = category.parentId;
    this.directProductCount = category._count?.products || 0;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
    this.parent = category.parent ? new CategoryResponseDto(category.parent) : null;
    this.productCount = this.directProductCount;
    this.children = category.children 
      ? category.children.map(child => new CategoryResponseDto(child))
      : [];
  }
}

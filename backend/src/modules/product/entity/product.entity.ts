export class ProductEntity {
  id!: string;
  name!: string;
  description!: string | null;
  price!: number;
  sku!: string;
  stock!: number;
  imageUrl!: string | null;
  categoryId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }
}

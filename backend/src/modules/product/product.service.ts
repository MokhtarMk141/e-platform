import { ProductRepository } from "./product.repository";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductResponseDto } from "./dto/product-response.dto";
import { AppError } from "../../exceptions/app-error";

export class ProductService {
  constructor(private productRepository: ProductRepository = new ProductRepository()) {}

  async getAllProducts(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
  }): Promise<{ data: ProductResponseDto[]; total: number; page: number; limit: number }> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productRepository.findAll({ skip, take: limit, categoryId: params?.categoryId }),
      this.productRepository.count(params?.categoryId),
    ]);

    return {
      data: products.map((p) => new ProductResponseDto(p)),
      total,
      page,
      limit,
    };
  }

  async getProductById(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return new ProductResponseDto(product);
  }

  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    const existing = await this.productRepository.findBySku(dto.sku);
    if (existing) {
      throw new AppError(`SKU '${dto.sku}' is already in use`, 409);
    }

    const product = await this.productRepository.create(dto);
    return new ProductResponseDto(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (dto.sku && dto.sku !== product.sku) {
      const skuTaken = await this.productRepository.findBySku(dto.sku);
      if (skuTaken) {
        throw new AppError(`SKU '${dto.sku}' is already in use`, 409);
      }
    }

    const updated = await this.productRepository.update(id, dto);
    return new ProductResponseDto(updated);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    await this.productRepository.delete(id);
  }
}

import { AppError } from "../../exceptions/app-error";
import { BrandRepository } from "./brand.repository";
import { BrandResponseDto } from "./dto/brand-response.dto";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";

export class BrandService {
  constructor(private brandRepository: BrandRepository = new BrandRepository()) {}

  async getAllBrands(): Promise<BrandResponseDto[]> {
    const brands = await this.brandRepository.findAll();
    return brands.map((brand) => new BrandResponseDto(brand));
  }

  async getBrandById(id: string): Promise<BrandResponseDto> {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new AppError("Brand not found", 404);
    }

    return new BrandResponseDto(brand);
  }

  async createBrand(dto: CreateBrandDto): Promise<BrandResponseDto> {
    const existing = await this.brandRepository.findByName(dto.name);
    if (existing) {
      throw new AppError(`Brand '${dto.name}' already exists`, 409);
    }

    const brand = await this.brandRepository.create(dto);
    return new BrandResponseDto(brand);
  }

  async updateBrand(id: string, dto: UpdateBrandDto): Promise<BrandResponseDto> {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new AppError("Brand not found", 404);
    }

    if (dto.name && dto.name !== brand.name) {
      const nameTaken = await this.brandRepository.findByName(dto.name);
      if (nameTaken) {
        throw new AppError(`Brand '${dto.name}' already exists`, 409);
      }
    }

    const updated = await this.brandRepository.update(id, dto);
    return new BrandResponseDto(updated);
  }

  async deleteBrand(id: string): Promise<void> {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new AppError("Brand not found", 404);
    }

    await this.brandRepository.delete(id);
  }
}

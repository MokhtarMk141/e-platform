import { ApiClient } from '@/lib/api-client';

export interface HomepageHeroSlide {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
}

export type HeroSlide = HomepageHeroSlide;

export interface HomepageConfig {
  id: string;
  slug: string;
  heroSlides: HomepageHeroSlide[];
  createdAt: string;
  updatedAt: string;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export class HomepageConfigService {
  static async get(): Promise<HomepageConfig> {
    const response = await ApiClient.get<{ data: HomepageConfig }>('/homepage-config');
    return response.data;
  }

  static async update(data: { heroSlides: HomepageHeroSlide[] }): Promise<HomepageConfig> {
    const response = await ApiClient.put<{ data: HomepageConfig }>('/homepage-config', data);
    return response.data;
  }

  static async uploadHeroImage(file: File): Promise<string>;
  static async uploadHeroImage(fileName: string, fileData: string): Promise<string>;
  static async uploadHeroImage(fileOrName: File | string, fileData?: string): Promise<string> {
    const fileName = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
    const payload =
      typeof fileOrName === 'string'
        ? fileData
        : await fileToDataUrl(fileOrName);

    if (!payload) {
      throw new Error('Hero image payload is required.');
    }

    const response = await ApiClient.post<{ data: { heroImageUrl: string } }>(
      '/homepage-config/upload-hero-image',
      { fileName, fileData: payload }
    );
    return response.data.heroImageUrl;
  }
}

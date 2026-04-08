import { ApiClient } from '@/lib/api-client';

export interface HeroSlide {
  badge: string;
  title: string;
  sub: string;
  cta: string;
  link: string;
  img: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

export interface SectionConfig {
  flash: { title: string };
  newest: { badge: string; title: string };
  popular: { badge: string; title: string };
  categories: { badge: string; title: string };
}

export interface AiCtaConfig {
  badge: string;
  title: string;
  sub: string;
  cta: string;
}

export interface HomepageConfig {
  id: string;
  heroSlides: HeroSlide[];
  features: FeatureItem[];
  flashTitle: string;
  sections: SectionConfig;
  aiCta: AiCtaConfig;
  updatedAt: string;
}

export class HomepageConfigService {
  static async get(): Promise<HomepageConfig> {
    const response = await ApiClient.get<{ data: HomepageConfig }>('/homepage-config');
    return response.data;
  }

  static async update(data: Partial<Omit<HomepageConfig, 'id' | 'updatedAt'>>): Promise<HomepageConfig> {
    const response = await ApiClient.put<{ data: HomepageConfig }>('/homepage-config', data);
    return response.data;
  }
}

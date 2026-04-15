import { ApiClient } from '@/lib/api-client';

interface ChatbotModel {
  name: string;
}

interface ChatbotModelsResponse {
  success: boolean;
  message: string;
  data: {
    models: ChatbotModel[];
    defaultModel: string | null;
  };
}

interface ChatbotMessageResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
    model: string;
    sessionId: string;
    products: Array<{
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
      stock: number;
      url: string;
      brand: string | null;
      category: string | null;
      description: string | null;
      score: number;
      matchReasons: string[];
      usageTags: string[];
      performanceTier: 'entry' | 'mid' | 'high';
      formFactor: 'laptop' | 'desktop' | 'component' | 'accessory' | 'monitor' | null;
      popularity: number;
    }>;
    appliedFilters: {
      maxPrice: number | null;
      minPrice: number | null;
      category: string | null;
      brandKeywords: string[];
      usageTags: string[];
      attributeFilters: {
        ram: string | null;
        storage: string | null;
        gpu: string | null;
        cpuBrand: string | null;
      };
      sortPreference: 'price_asc' | 'price_desc' | 'value' | 'popular' | 'relevance' | null;
      performanceTier: 'entry' | 'mid' | 'high' | null;
      formFactor: 'laptop' | 'desktop' | 'component' | 'accessory' | 'monitor' | null;
    };
    appliedFilterSummary: string[];
    matchType: 'exact' | 'alternative' | 'none';
    usedFallback: boolean;
    usedSessionMemory: boolean;
    usedAiIntent: boolean;
  };
}

export interface ChatbotProductCard {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  url: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  score: number;
  matchReasons: string[];
  usageTags: string[];
  performanceTier: 'entry' | 'mid' | 'high';
  formFactor: 'laptop' | 'desktop' | 'component' | 'accessory' | 'monitor' | null;
  popularity: number;
}

export interface ChatbotReply {
  response: string;
  model: string;
  sessionId: string;
  products: ChatbotProductCard[];
  appliedFilters: ChatbotMessageResponse['data']['appliedFilters'];
  appliedFilterSummary: string[];
  matchType: 'exact' | 'alternative' | 'none';
  usedFallback: boolean;
  usedSessionMemory: boolean;
  usedAiIntent: boolean;
}

export class ChatbotService {
  static async getModels(): Promise<{
    models: string[];
    defaultModel: string;
  }> {
    const response = await ApiClient.get<ChatbotModelsResponse>('/chatbot/models');
    const models = response.data.models
      .map((model) => model.name.trim())
      .filter(Boolean);

    return {
      models,
      defaultModel: response.data.defaultModel ?? models[0] ?? '',
    };
  }

  static async sendMessage(payload: {
    prompt: string;
    model?: string;
    sessionId?: string;
  }): Promise<ChatbotReply> {
    const response = await ApiClient.post<ChatbotMessageResponse>(
      '/chatbot/chat',
      payload
    );

    return response.data;
  }
}

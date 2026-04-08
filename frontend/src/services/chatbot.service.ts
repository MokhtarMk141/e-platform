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
  };
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
  }): Promise<{ response: string; model: string }> {
    const response = await ApiClient.post<ChatbotMessageResponse>(
      '/chatbot/chat',
      payload
    );

    return response.data;
  }
}

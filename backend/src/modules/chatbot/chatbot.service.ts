import { AppError } from "../../exceptions/app-error";
import { ProductContextService } from "./product-context.service";

const OLLAMA_URL = process.env.OLLAMA_URL || "https://ai.dev2.sofflex.com";
const SOFFLEX_API_KEY =
  process.env.SOFFLEX_API_KEY ||
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const BASE_SYSTEM_PROMPT = `You are Oggy, the Sofflex AI Assistant for our e-commerce PC and tech store.

RULES:
- When product data is provided below, ONLY recommend products from the "Available Products" list.
- Never invent product names, prices, or specifications.
- Always mention the price in DT (Tunisian Dinar).
- If no products match the user's request, say so clearly and suggest adjusting their criteria.
- For general questions (greetings, tech advice, etc.) without product data, answer normally.
- Keep responses concise, friendly, and helpful.
- Use emojis occasionally to be more engaging. 🎮`;
const REQUEST_TIMEOUT_MS = 20_000;
const FALLBACK_MODEL = "oggy-local-assistant";

interface ProviderModel {
  name?: string;
  model?: string;
}

interface TagsResponse {
  models?: ProviderModel[];
  error?: string;
}

interface GenerateResponse {
  response?: string;
  message?: {
    content?: string;
  };
  error?: string;
}

export class ChatbotService {
  private productContextService = new ProductContextService();

  private async buildFallbackResponse(prompt: string): Promise<string> {
    const normalizedPrompt = prompt.trim().toLowerCase();

    if (
      normalizedPrompt.includes("order") ||
      normalizedPrompt.includes("track") ||
      normalizedPrompt.includes("shipping")
    ) {
      return "I can help with order tracking. Please share your order number or the email used at checkout, and I can guide you on the next step while the live AI service is unavailable.";
    }

    try {
      const { products } = await this.productContextService.searchProducts(prompt);

      if (products.length > 0) {
        const productList = this.productContextService.formatProductContext(products);
        return `The live AI is currently unavailable, but I found these products from our store that might match your request:\n\n${productList}\n\nFor more details, browse our store or try again later when the AI is back online! 😊`;
      }
    } catch {
    }

    if (
      normalizedPrompt.includes("build") ||
      normalizedPrompt.includes("pc") ||
      normalizedPrompt.includes("gaming")
    ) {
      return "For a balanced PC build, start with your main goal, target resolution, and budget. A strong baseline is a modern 6-8 core CPU, 16-32GB RAM, an SSD, and a GPU matched to your gaming or creative workload.";
    }

    if (
      normalizedPrompt.includes("gpu") ||
      normalizedPrompt.includes("graphics") ||
      normalizedPrompt.includes("fps")
    ) {
      return "For GPU advice, match the card to your target resolution first: 1080p can use a mid-range GPU, 1440p usually needs upper mid-range, and 4K benefits from a high-end card. If you want, tell me your budget and I will narrow it down.";
    }

    if (
      normalizedPrompt.includes("cpu") ||
      normalizedPrompt.includes("processor") ||
      normalizedPrompt.includes("intel") ||
      normalizedPrompt.includes("amd")
    ) {
      return "CPU choice depends on whether you prioritize gaming, streaming, or productivity. Gaming builds usually benefit from strong per-core performance, while editing and multitasking benefit from more cores.";
    }

    return "The live AI service is temporarily unavailable, but I can still help. Tell me your budget, what you want to do with the PC, and any brand preferences, and I will guide you with a practical recommendation.";
  }

  private buildEnrichedSystemPrompt(productContext: string): string {
    return `${BASE_SYSTEM_PROMPT}\n\nAvailable Products from our store:\n${productContext}\n\nIf no products are listed above, inform the user that you could not find matching products and suggest they browse the store directly or adjust their criteria.`;
  }

  private getFallbackModels(): {
    models: Array<{ name: string }>;
    defaultModel: string;
  } {
    return {
      models: [{ name: FALLBACK_MODEL }],
      defaultModel: FALLBACK_MODEL,
    };
  }

  private buildHeaders(contentType?: string): Record<string, string> {
    const headers: Record<string, string> = {};

    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    if (SOFFLEX_API_KEY) {
      headers["sofflex-api-key"] = SOFFLEX_API_KEY;
    }

    return headers;
  }

  private async requestJson<T>(
    url: string,
    init: RequestInit,
    serviceName: string
  ): Promise<{ response: Response; data: T | null }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      let data: T | null = null;

      try {
        data = (await response.json()) as T;
      } catch {
        data = null;
      }

      return { response, data };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError(`${serviceName} timed out. Please try again.`, 504);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private getProviderError(
    data: { error?: string } | null,
    fallbackMessage: string
  ): string {
    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error.trim();
    }

    return fallbackMessage;
  }

  private extractModelNames(data: TagsResponse | null): string[] {
    return (data?.models ?? [])
      .map((model) => {
        if (typeof model.name === "string" && model.name.trim()) {
          return model.name.trim();
        }

        if (typeof model.model === "string" && model.model.trim()) {
          return model.model.trim();
        }

        return null;
      })
      .filter((name): name is string => Boolean(name));
  }

  private async resolveModel(requestedModel?: string): Promise<string> {
    if (requestedModel?.trim()) {
      return requestedModel.trim();
    }

    const { defaultModel } = await this.getModels();

    if (!defaultModel) {
      throw new AppError("No AI models are currently available.", 503);
    }

    return defaultModel;
  }

  async getModels(): Promise<{
    models: Array<{ name: string }>;
    defaultModel: string | null;
  }> {
    try {
      const { response, data } = await this.requestJson<TagsResponse>(
        `${OLLAMA_URL}/api/tags`,
        {
          headers: this.buildHeaders(),
        },
        "AI service"
      );

      if (!response.ok) {
        throw new AppError(
          this.getProviderError(
            data,
            `AI service returned status ${response.status}`
          ),
          502
        );
      }

      const modelNames = this.extractModelNames(data);

      if (modelNames.length === 0) {
        return this.getFallbackModels();
      }

      return {
        models: modelNames.map((name) => ({ name })),
        defaultModel: modelNames[0] ?? null,
      };
    } catch (error) {
      return this.getFallbackModels();
    }
  }

  async sendMessage(params: {
    model?: string;
    prompt: string;
    system?: string;
  }): Promise<{ response: string; model: string }> {
    if (!params.prompt || !params.prompt.trim()) {
      throw new AppError("Prompt is required", 400);
    }

    let productContext = "";
    try {
      const { products } = await this.productContextService.searchProducts(
        params.prompt
      );
      productContext = this.productContextService.formatProductContext(products);
    } catch {
      productContext = "";
    }

    if (params.model?.trim() === FALLBACK_MODEL) {
      return {
        response: await this.buildFallbackResponse(params.prompt),
        model: FALLBACK_MODEL,
      };
    }

    try {
      const model = await this.resolveModel(params.model);

      if (model === FALLBACK_MODEL) {
        return {
          response: await this.buildFallbackResponse(params.prompt),
          model,
        };
      }

      const systemPrompt = params.system?.trim()
        ? params.system.trim()
        : productContext
          ? this.buildEnrichedSystemPrompt(productContext)
          : BASE_SYSTEM_PROMPT;

      const { response, data } = await this.requestJson<GenerateResponse>(
        `${OLLAMA_URL}/api/generate`,
        {
          method: "POST",
          headers: this.buildHeaders("application/json"),
          body: JSON.stringify({
            model,
            system: systemPrompt,
            prompt: params.prompt.trim(),
            stream: false,
          }),
        },
        "AI service"
      );

      if (!response.ok) {
        throw new AppError(
          this.getProviderError(
            data,
            `AI service returned status ${response.status}`
          ),
          502
        );
      }

      const reply =
        data?.response ||
        data?.message?.content ||
        "Sorry, I couldn't generate a response.";

      return {
        response: reply,
        model,
      };
    } catch (error) {
      if (error instanceof AppError) {
        return {
          response: await this.buildFallbackResponse(params.prompt),
          model: FALLBACK_MODEL,
        };
      }

      return {
        response: await this.buildFallbackResponse(params.prompt),
        model: FALLBACK_MODEL,
      };
    }
  }
}

import { AppError } from "../../exceptions/app-error";
import { ChatbotRetrievalService } from "./chatbot-retrieval.service";
import { ChatbotSessionService } from "./chatbot-session.service";
import {
  ChatIntentExtraction,
  ChatIntentFilters,
  ChatSessionTurn,
  ChatbotReply,
  ProductRetrievalResult,
  createEmptyIntentFilters,
} from "./chatbot.types";

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
const GENERAL_SYSTEM_PROMPT = `You are Oggy, the Sofflex AI Assistant for our e-commerce PC and tech store.

Rules:
- Be concise, friendly, and commercially helpful.
- Use plain text only. Do not use markdown, asterisks, or markdown links.
- If product data is provided elsewhere by the backend, never invent new products.
- Mention prices in DT only when they are explicitly provided.
- If you do not know something, say so clearly.
- Avoid overpromising on stock, delivery, or compatibility.`;

const PRODUCT_SYSTEM_PROMPT = `You are Oggy, the Sofflex AI Assistant for our e-commerce PC and tech store.

The backend already handled retrieval, filtering, ranking, and business logic.
Your job is only to explain the shortlist in natural language.

Rules:
- Use only the product data provided by the backend.
- Use plain text only. Do not use markdown, bold markers, code formatting, or markdown links.
- Do not output product URLs or "view product" links because the frontend already renders clickable product cards.
- Do not invent product names, prices, stock, URLs, brands, or specs.
- If the backend says the results are alternatives instead of exact matches, say that clearly.
- If there are no matching products, say that clearly and suggest broadening the criteria.
- Keep the response concise and focused on helping the customer choose.`;

const INTENT_EXTRACTION_SYSTEM_PROMPT = `You extract shopping intent for an ecommerce backend.
Return JSON only. No prose, no markdown.

Schema:
{
  "isProductQuery": boolean,
  "resetContext": boolean,
  "category": string | null,
  "maxPrice": number | null,
  "minPrice": number | null,
  "brandKeywords": string[],
  "usageTags": string[],
  "searchTerms": string[],
  "sortPreference": "price_asc" | "price_desc" | "value" | "popular" | "relevance" | null,
  "performanceTier": "entry" | "mid" | "high" | null,
  "formFactor": "laptop" | "desktop" | "component" | "accessory" | "monitor" | null,
  "attributeFilters": {
    "ram": string | null,
    "storage": string | null,
    "gpu": string | null,
    "cpuBrand": string | null
  }
}

Use lowercase strings. Unknown values must be null or [].
Do not invent products.`;
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
  private retrievalService = new ChatbotRetrievalService();
  private sessionService = new ChatbotSessionService();
  private productContextService = {
    searchProducts: async (prompt: string) => {
      const result = await this.retrievalService.searchProducts({ prompt });
      return { products: result.products };
    },
    formatProductContext: (products: ProductRetrievalResult["products"]) =>
      this.retrievalService.formatProductContext(products),
  };

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

  private buildSystemPrompt(basePrompt: string, customPrompt?: string): string {
    const trimmedCustomPrompt = customPrompt?.trim();
    return trimmedCustomPrompt
      ? `${basePrompt}\n\nAdditional instruction:\n${trimmedCustomPrompt}`
      : basePrompt;
  }

  private buildHistoryContext(history: ChatSessionTurn[]): string {
    if (history.length === 0) {
      return "No prior session history.";
    }

    return history
      .slice(-4)
      .map((entry) => `${entry.role === "user" ? "User" : "Assistant"}: ${entry.content}`)
      .join("\n");
  }

  private buildProductExplanationPrompt(params: {
    prompt: string;
    retrieval: ProductRetrievalResult;
    history: ChatSessionTurn[];
  }): string {
    const filterSummary = this.retrievalService.buildFilterSummary(
      params.retrieval.intent
    );
    const productContext = this.retrievalService.formatProductContext(
      params.retrieval.products
    );

    return [
      `User request: ${params.prompt.trim()}`,
      `Match type: ${params.retrieval.matchType}`,
      `Applied filters: ${
        filterSummary.length > 0 ? filterSummary.join(", ") : "none"
      }`,
      `Recent session history:\n${this.buildHistoryContext(params.history)}`,
      `Ranked catalog products:\n${productContext}`,
      "Instructions:",
      "- Start by saying whether these are exact matches, close alternatives, or no matches.",
      "- Mention at most 3 products unless the user explicitly asked for more.",
      "- Use plain text only and keep the formatting simple.",
      "- Do not include markdown, bold markers, or inline links.",
      "- Use only the provided catalog data.",
    ].join("\n\n");
  }

  private buildGeneralPrompt(prompt: string, history: ChatSessionTurn[]): string {
    return [
      `User request: ${prompt.trim()}`,
      `Recent session history:\n${this.buildHistoryContext(history)}`,
    ].join("\n\n");
  }

  private buildProductFallbackResponse(
    retrieval: ProductRetrievalResult
  ): string {
    const summary = this.retrievalService.buildFilterSummary(retrieval.intent);
    const summaryText =
      summary.length > 0 ? ` for ${summary.join(", ")}` : "";

    if (retrieval.matchType === "exact" && retrieval.products.length > 0) {
      return `I found ${retrieval.products.length} matching products${summaryText}. You can review the ranked options below.`;
    }

    if (retrieval.matchType === "alternative" && retrieval.products.length > 0) {
      return `I could not find an exact match${summaryText}, but I found ${retrieval.products.length} close alternatives from our live catalog.`;
    }

    return `I could not find a matching product${summaryText}. Try widening the budget, changing the brand, or removing one filter.`;
  }

  private buildGeneralFallbackResponse(prompt: string): string {
    const normalizedPrompt = prompt.trim().toLowerCase();

    if (
      normalizedPrompt.includes("order") ||
      normalizedPrompt.includes("track") ||
      normalizedPrompt.includes("shipping")
    ) {
      return "I can help with order tracking. Please share your order number or the email used at checkout, and I can guide you on the next step.";
    }

    if (
      normalizedPrompt.includes("build") ||
      normalizedPrompt.includes("pc") ||
      normalizedPrompt.includes("gaming")
    ) {
      return "For a balanced PC build, start with your main goal, target resolution, and budget. A strong baseline is a modern 6-8 core CPU, 16-32GB RAM, an SSD, and a GPU matched to your workload.";
    }

    if (
      normalizedPrompt.includes("gpu") ||
      normalizedPrompt.includes("graphics") ||
      normalizedPrompt.includes("fps")
    ) {
      return "For GPU advice, match the card to your target resolution first: 1080p can use a mid-range GPU, 1440p usually needs upper mid-range, and 4K benefits from a high-end card.";
    }

    return "The live AI service is temporarily unavailable, but I can still help. Tell me your budget, what you want to do with the PC, and any brand preferences, and I will guide you with a practical recommendation.";
  }

  private buildFallbackReply(
    prompt: string,
    retrieval: ProductRetrievalResult
  ): string {
    return retrieval.intent.isProductQuery
      ? this.buildProductFallbackResponse(retrieval)
      : this.buildGeneralFallbackResponse(prompt);
  }

  private async generateText(params: {
    model: string;
    prompt: string;
    system: string;
  }): Promise<string> {
    const { response, data } = await this.requestJson<GenerateResponse>(
      `${OLLAMA_URL}/api/generate`,
      {
        method: "POST",
        headers: this.buildHeaders("application/json"),
        body: JSON.stringify({
          model: params.model,
          system: params.system,
          prompt: params.prompt,
          stream: false,
        }),
      },
      "AI service"
    );

    if (!response.ok) {
      throw new AppError(
        this.getProviderError(data, `AI service returned status ${response.status}`),
        502
      );
    }

    return (
      data?.response ||
      data?.message?.content ||
      "Sorry, I couldn't generate a response."
    );
  }

  private sanitizeAssistantText(text: string): string {
    return text
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  private parseIntentExtraction(
    rawResponse: string
  ): ChatIntentExtraction | null {
    const start = rawResponse.indexOf("{");
    const end = rawResponse.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(rawResponse.slice(start, end + 1)) as ChatIntentExtraction;
    } catch {
      return null;
    }
  }

  private hasSessionFilters(filters: ChatIntentFilters): boolean {
    return filters.maxPrice !== null ||
      filters.minPrice !== null ||
      Boolean(filters.category) ||
      filters.categoryKeywords.length > 0 ||
      filters.brandKeywords.length > 0 ||
      filters.usageTags.length > 0 ||
      filters.searchTerms.length > 0 ||
      Boolean(filters.sortPreference) ||
      Boolean(filters.performanceTier) ||
      Boolean(filters.formFactor) ||
      Boolean(
        filters.attributeFilters.ram ||
          filters.attributeFilters.storage ||
          filters.attributeFilters.gpu ||
          filters.attributeFilters.cpuBrand
      );
  }

  private async extractIntentWithAI(params: {
    prompt: string;
    model: string;
    sessionFilters: ChatIntentFilters;
  }): Promise<ChatIntentExtraction | null> {
    const filterSummary = this.retrievalService.buildFilterSummary(
      params.sessionFilters
    );
    const extractionPrompt = [
      `Current session filters: ${
        filterSummary.length > 0 ? filterSummary.join(", ") : "none"
      }`,
      `User message: ${params.prompt.trim()}`,
    ].join("\n\n");

    try {
      const rawResponse = await this.generateText({
        model: params.model,
        system: INTENT_EXTRACTION_SYSTEM_PROMPT,
        prompt: extractionPrompt,
      });

      return this.parseIntentExtraction(rawResponse);
    } catch {
      return null;
    }
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
    sessionId?: string;
  }): Promise<ChatbotReply> {
    if (!params.prompt || !params.prompt.trim()) {
      throw new AppError("Prompt is required", 400);
    }

    const session = this.sessionService.getOrCreateSession(params.sessionId);
    const ruleIntent = this.retrievalService.parseRuleBasedIntent(params.prompt);

    let resolvedModel = FALLBACK_MODEL;
    if (params.model?.trim() !== FALLBACK_MODEL) {
      try {
        resolvedModel = await this.resolveModel(params.model);
      } catch {
        resolvedModel = FALLBACK_MODEL;
      }
    }

    let aiIntent: ChatIntentExtraction | null = null;
    if (
      resolvedModel !== FALLBACK_MODEL &&
      (ruleIntent.isProductQuery || this.hasSessionFilters(session.filters))
    ) {
      aiIntent = await this.extractIntentWithAI({
        prompt: params.prompt,
        model: resolvedModel,
        sessionFilters: session.filters,
      });
    }

    const retrieval = await this.retrievalService.searchProducts({
      prompt: params.prompt,
      sessionFilters: session.filters,
      aiIntent,
    });

    const activeFilters = retrieval.intent.isProductQuery
      ? retrieval.intent
      : session.filters ?? createEmptyIntentFilters();

    let reply = "";
    let usedFallback = resolvedModel === FALLBACK_MODEL;

    if (resolvedModel === FALLBACK_MODEL) {
      reply = this.buildFallbackReply(params.prompt, retrieval);
    } else {
      try {
        const systemPrompt = retrieval.intent.isProductQuery
          ? this.buildSystemPrompt(PRODUCT_SYSTEM_PROMPT, params.system)
          : this.buildSystemPrompt(GENERAL_SYSTEM_PROMPT, params.system);
        const promptBody = retrieval.intent.isProductQuery
          ? this.buildProductExplanationPrompt({
              prompt: params.prompt,
              retrieval,
              history: session.history,
            })
          : this.buildGeneralPrompt(params.prompt, session.history);

        reply = await this.generateText({
          model: resolvedModel,
          system: systemPrompt,
          prompt: promptBody,
        });
      } catch {
        usedFallback = true;
        resolvedModel = FALLBACK_MODEL;
        reply = this.buildFallbackReply(params.prompt, retrieval);
      }
    }

    reply = this.sanitizeAssistantText(reply);

    const nextHistory: ChatSessionTurn[] = [
      ...session.history,
      { role: "user" as const, content: params.prompt.trim() },
      { role: "assistant" as const, content: reply },
    ].slice(-8);

    this.sessionService.saveSession(session.sessionId, activeFilters, nextHistory);

    return {
      response: reply,
      model: resolvedModel,
      sessionId: session.sessionId,
      products: retrieval.products,
      appliedFilters: activeFilters,
      appliedFilterSummary: this.retrievalService.buildFilterSummary(activeFilters),
      matchType: retrieval.matchType,
      usedFallback,
      usedSessionMemory: retrieval.usedSessionMemory,
      usedAiIntent: retrieval.usedAiIntent,
    };
  }
}

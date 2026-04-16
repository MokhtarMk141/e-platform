import { AppError } from "../../exceptions/app-error";
import { ChatbotRetrievalService } from "./chatbot-retrieval.service";
import { ChatbotSessionService } from "./chatbot-session.service";
import { ChatbotReply, createEmptyIntentFilters } from "./chatbot.types";

const OLLAMA_URL = process.env.OLLAMA_URL || "https://ai.dev2.sofflex.com";
const SOFFLEX_API_KEY =
  process.env.SOFFLEX_API_KEY ||
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

const TARGET_MODEL = "deepseek-v3.1:671b-cloud";

const SYSTEM_PROMPT = `You are Oggy, the Sofflex AI Assistant for our e-commerce PC and tech store.
Rules:
- Be concise, friendly, and commercially helpful.
- Mention prices in DT (Tunisian Dinar).
- CRITICAL: NEVER invent, guess, or hallucinate product names, brands, prices, or specs.
- If a user asks for a product, category (like monitors, laptops), or recommendation, YOU MUST use the 'search_products' tool to search the database first.
- ONLY recommend products explicitly provided by the 'search_products' tool result block.
- If the 'search_products' tool returns an empty list, you MUST tell the user we don't have those items in stock. DO NOT suggest external products.
- Do not output product URLs or markdown links because the frontend handles clickable product cards.
- Keep responses concise. Use emojis occasionally to be more engaging. 🎮`;

const SEARCH_TOOL = {
  type: "function",
  function: {
    name: "search_products",
    description: "Search for store products based on user query, category or price.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query or keyword" },
        category: { type: "string", description: "Product category (e.g., 'gpu', 'laptop', 'desktop', 'monitor')" },
        minPrice: { type: "number", description: "Minimum price in DT" },
        maxPrice: { type: "number", description: "Maximum price in DT" },
        sortPreference: { type: "string", enum: ["price_asc", "price_desc", "relevance"], description: "Sort preference" }
      }
    }
  }
};

export class ChatbotService {
  private retrievalService = new ChatbotRetrievalService();
  private sessionService = new ChatbotSessionService();

  private buildHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "sofflex-api-key": SOFFLEX_API_KEY,
    };
  }

  async getModels() {
    return {
      models: [{ name: TARGET_MODEL }],
      defaultModel: TARGET_MODEL,
    };
  }

  async sendMessage(params: {
    prompt: string;
    model?: string;
    system?: string;
    sessionId?: string;
  }): Promise<ChatbotReply> {
    if (!params.prompt || !params.prompt.trim()) {
      throw new AppError("Prompt is required", 400);
    }

    const session = this.sessionService.getOrCreateSession(params.sessionId);
    
    const finalSystemPrompt = params.system 
      ? `${SYSTEM_PROMPT}\n\nAdditional Instruction:\n${params.system.trim()}`
      : SYSTEM_PROMPT;

    const messages: any[] = [
      { role: "system", content: finalSystemPrompt },
      ...session.history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: params.prompt.trim() }
    ];

    let foundProducts: any[] = [];
    let matchType: "none" | "exact" | "alternative" = "none";
    let finalResponseText = "";

    try {
      let isDone = false;
      let iterations = 0;
      const MAX_ITERATIONS = 3;

      while (!isDone && iterations < MAX_ITERATIONS) {
        iterations++;

        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
          method: "POST",
          headers: this.buildHeaders(),
          body: JSON.stringify({
            model: TARGET_MODEL,
            messages,
            tools: [SEARCH_TOOL],
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new AppError(`AI service returned status ${response.status}`, 502);
        }

        const data = (await response.json()) as any;
        let aiMessage = data?.message;
        
        if (aiMessage?.content) {
          finalResponseText = aiMessage.content;
        }

        // If the LLM wants to search the database
        if (aiMessage?.tool_calls && aiMessage.tool_calls.length > 0) {
          messages.push(aiMessage);
          
          for (const toolCall of aiMessage.tool_calls) {
            if (toolCall.function.name === "search_products") {
              const argsString = toolCall.function.arguments;
              let args = {};
              try {
                args = typeof argsString === "string" ? JSON.parse(argsString) : argsString;
              } catch (e) {
                console.error("Failed to parse tool arguments:", e);
              }
              
              const searchResult = await this.retrievalService.searchProducts(args);
              if (searchResult.products.length > 0) {
                  foundProducts = searchResult.products;
                  matchType = "exact";
              }

              const minimalProductsForLLM = searchResult.products.map(p => ({
                name: p.name,
                price: p.price,
                category: p.category,
                brand: p.brand
              }));

              messages.push({
                role: "tool",
                content: JSON.stringify(minimalProductsForLLM),
              });
            }
          }
        } else {
          // No more tool calls, we are finished!
          isDone = true;
        }
      }

      const emptyFilters = createEmptyIntentFilters();

      const nextHistory = [
        ...session.history,
        { role: "user" as const, content: params.prompt.trim() },
        { role: "assistant" as const, content: finalResponseText },
      ].slice(-8);

      this.sessionService.saveSession(session.sessionId, emptyFilters, nextHistory);

      return {
        response: finalResponseText.trim(),
        model: TARGET_MODEL,
        sessionId: session.sessionId,
        products: foundProducts,
        appliedFilters: emptyFilters,
        appliedFilterSummary: [],
        matchType,
        usedFallback: false,
        usedSessionMemory: true,
        usedAiIntent: true,
      };
    } catch (e: any) {
      console.error(e);
      throw new AppError("Failed to communicate with AI service", 500);
    }
  }
}

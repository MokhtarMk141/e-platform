export type ChatSortPreference =
  | "price_asc"
  | "price_desc"
  | "value"
  | "popular"
  | "relevance";

export type ChatPerformanceTier = "entry" | "mid" | "high";
export type ChatFormFactor =
  | "laptop"
  | "desktop"
  | "component"
  | "accessory"
  | "monitor";

export type ChatMatchType = "exact" | "alternative" | "none";

export interface ChatAttributeFilters {
  ram: string | null;
  storage: string | null;
  gpu: string | null;
  cpuBrand: string | null;
}

export interface ChatIntentFilters {
  isProductQuery: boolean;
  resetContext: boolean;
  maxPrice: number | null;
  minPrice: number | null;
  category: string | null;
  categoryKeywords: string[];
  brandKeywords: string[];
  usageTags: string[];
  searchTerms: string[];
  attributeFilters: ChatAttributeFilters;
  sortPreference: ChatSortPreference | null;
  performanceTier: ChatPerformanceTier | null;
  formFactor: ChatFormFactor | null;
}

export interface ChatIntentExtraction
  extends Partial<
    Omit<ChatIntentFilters, "attributeFilters" | "categoryKeywords">
  > {
  attributeFilters?: Partial<ChatAttributeFilters>;
}

export interface RankedChatProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  url: string;
  brand: string | null;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  score: number;
  matchReasons: string[];
  usageTags: string[];
  performanceTier: ChatPerformanceTier;
  formFactor: ChatFormFactor | null;
  popularity: number;
}

export interface ProductRetrievalResult {
  intent: ChatIntentFilters;
  products: RankedChatProduct[];
  matchType: ChatMatchType;
  totalCandidates: number;
  usedSessionMemory: boolean;
  usedAiIntent: boolean;
}

export interface ChatSessionTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSessionState {
  sessionId: string;
  filters: ChatIntentFilters;
  updatedAt: number;
  history: ChatSessionTurn[];
}

export interface ChatbotReply {
  response: string;
  model: string;
  sessionId: string;
  products: RankedChatProduct[];
  appliedFilters: ChatIntentFilters;
  appliedFilterSummary: string[];
  matchType: ChatMatchType;
  usedFallback: boolean;
  usedSessionMemory: boolean;
  usedAiIntent: boolean;
}

export function createEmptyIntentFilters(): ChatIntentFilters {
  return {
    isProductQuery: false,
    resetContext: false,
    maxPrice: null,
    minPrice: null,
    category: null,
    categoryKeywords: [],
    brandKeywords: [],
    usageTags: [],
    searchTerms: [],
    attributeFilters: {
      ram: null,
      storage: null,
      gpu: null,
      cpuBrand: null,
    },
    sortPreference: null,
    performanceTier: null,
    formFactor: null,
  };
}

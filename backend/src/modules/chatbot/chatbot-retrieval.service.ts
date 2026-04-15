import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import {
  ChatAttributeFilters,
  ChatFormFactor,
  ChatIntentExtraction,
  ChatIntentFilters,
  ChatMatchType,
  ChatPerformanceTier,
  ChatSortPreference,
  ProductRetrievalResult,
  RankedChatProduct,
  createEmptyIntentFilters,
} from "./chatbot.types";

const MAX_PRIMARY_PRODUCTS = 6;
const MAX_STRICT_CANDIDATES = 40;
const MAX_RELAXED_CANDIDATES = 50;

const PRODUCT_TRIGGER_KEYWORDS = [
  "pc",
  "computer",
  "laptop",
  "desktop",
  "gaming",
  "office",
  "student",
  "programming",
  "workstation",
  "gpu",
  "graphics",
  "cpu",
  "processor",
  "ram",
  "memory",
  "ssd",
  "hdd",
  "storage",
  "keyboard",
  "mouse",
  "monitor",
  "screen",
  "headset",
  "speaker",
  "case",
  "tower",
  "motherboard",
  "power supply",
  "psu",
  "cooler",
  "fan",
  "accessory",
  "webcam",
  "microphone",
  "product",
  "products",
  "buy",
  "recommend",
  "suggest",
  "price",
  "cheap",
  "budget",
  "affordable",
  "premium",
  "best",
  "available",
  "stock",
  "build",
];

const KNOWN_BRANDS = [
  "msi",
  "asus",
  "acer",
  "dell",
  "hp",
  "lenovo",
  "gigabyte",
  "corsair",
  "logitech",
  "razer",
  "steelseries",
  "hyperx",
  "intel",
  "amd",
  "nvidia",
  "geforce",
  "radeon",
  "samsung",
  "western digital",
  "wd",
  "seagate",
  "kingston",
  "crucial",
  "nzxt",
  "cooler master",
  "thermaltake",
  "be quiet",
  "evga",
  "zotac",
  "sapphire",
  "asrock",
  "biostar",
  "tp-link",
  "tplink",
  "d-link",
  "dlink",
  "benq",
  "lg",
  "viewsonic",
  "aoc",
  "apple",
  "microsoft",
];

const BUDGET_PATTERNS = [
  /(?:under|less than|below|max|maximum|up to|within|around|about|budget)\s*(\d[\d\s.,]*)\s*(?:dt|tnd|dinar)?/gi,
  /(\d[\d\s.,]*)\s*(?:dt|tnd|dinar)\s*(?:or less|max|maximum|budget)?/gi,
  /(?:budget|prix|price)\s*(?:is|of|:)?\s*(\d[\d\s.,]*)/gi,
];

const MIN_PRICE_PATTERNS = [
  /(?:more than|above|over|at least|minimum|from)\s*(\d[\d\s.,]*)\s*(?:dt|tnd|dinar)?/gi,
];

const CHEAP_KEYWORDS = [
  "cheap",
  "budget",
  "affordable",
  "low price",
  "lowest",
  "less expensive",
  "economical",
  "not too expensive",
];

const PREMIUM_KEYWORDS = [
  "best",
  "top",
  "premium",
  "expensive",
  "high end",
  "high-end",
  "flagship",
  "pro",
];

const POPULAR_KEYWORDS = ["popular", "trending", "bestseller", "best seller"];
const RESET_KEYWORDS = ["start over", "new search", "forget previous", "different", "instead", "change to"];
const FOLLOW_UP_KEYWORDS = ["only", "just", "and", "with", "plus", "same", "those", "them", "cheaper", "more powerful"];

const COMPONENT_KEYWORDS = [
  "graphics card",
  "gpu",
  "processor",
  "cpu",
  "ram",
  "memory",
  "ssd",
  "hdd",
  "storage",
  "keyboard",
  "mouse",
  "monitor",
  "screen",
  "headset",
  "speaker",
  "case",
  "tower",
  "motherboard",
  "power supply",
  "psu",
  "cooler",
  "fan",
  "webcam",
  "microphone",
  "cable",
  "laptop",
  "desktop",
  "gaming pc",
  "gaming laptop",
  "office pc",
  "workstation",
];

const CATEGORY_DEFINITIONS: Array<{
  category: string;
  formFactor: ChatFormFactor | null;
  keywords: string[];
  queryTerms: string[];
}> = [
  {
    category: "laptop",
    formFactor: "laptop",
    keywords: ["laptop", "notebook", "ultrabook"],
    queryTerms: ["laptop", "notebook"],
  },
  {
    category: "desktop",
    formFactor: "desktop",
    keywords: ["desktop", "gaming pc", "office pc", "pc", "computer", "tower", "build"],
    queryTerms: ["desktop", "pc", "tower"],
  },
  {
    category: "monitor",
    formFactor: "monitor",
    keywords: ["monitor", "screen", "display"],
    queryTerms: ["monitor", "screen", "display"],
  },
  {
    category: "gpu",
    formFactor: "component",
    keywords: ["gpu", "graphics card", "rtx", "gtx", "radeon", "geforce"],
    queryTerms: ["gpu", "graphics card", "rtx", "radeon", "geforce"],
  },
  {
    category: "cpu",
    formFactor: "component",
    keywords: ["cpu", "processor", "intel", "ryzen"],
    queryTerms: ["cpu", "processor", "intel", "amd", "ryzen"],
  },
  {
    category: "ram",
    formFactor: "component",
    keywords: ["ram", "memory", "ddr4", "ddr5"],
    queryTerms: ["ram", "memory", "ddr4", "ddr5"],
  },
  {
    category: "storage",
    formFactor: "component",
    keywords: ["ssd", "hdd", "storage", "nvme"],
    queryTerms: ["ssd", "hdd", "storage", "nvme"],
  },
  {
    category: "keyboard",
    formFactor: "accessory",
    keywords: ["keyboard"],
    queryTerms: ["keyboard"],
  },
  {
    category: "mouse",
    formFactor: "accessory",
    keywords: ["mouse"],
    queryTerms: ["mouse"],
  },
  {
    category: "headset",
    formFactor: "accessory",
    keywords: ["headset", "headphones"],
    queryTerms: ["headset", "headphones"],
  },
  {
    category: "webcam",
    formFactor: "accessory",
    keywords: ["webcam", "camera"],
    queryTerms: ["webcam", "camera"],
  },
];

const USAGE_DEFINITIONS: Array<{
  tag: string;
  keywords: string[];
  queryTerms: string[];
}> = [
  {
    tag: "gaming",
    keywords: ["gaming", "valorant", "gta", "fortnite", "warzone", "fps", "esports", "aaa"],
    queryTerms: ["gaming", "rtx", "geforce", "radeon"],
  },
  {
    tag: "office",
    keywords: ["office", "business", "excel", "word", "browsing"],
    queryTerms: ["office", "business"],
  },
  {
    tag: "programming",
    keywords: ["programming", "coding", "developer", "software"],
    queryTerms: ["workstation", "laptop", "desktop"],
  },
  {
    tag: "design",
    keywords: ["design", "photoshop", "premiere", "render", "rendering", "blender", "autocad", "editing", "3d"],
    queryTerms: ["creator", "studio", "workstation"],
  },
  {
    tag: "student",
    keywords: ["student", "school", "study", "university"],
    queryTerms: ["student", "portable", "laptop"],
  },
  {
    tag: "streaming",
    keywords: ["stream", "streaming", "obs", "broadcast"],
    queryTerms: ["stream", "microphone", "webcam"],
  },
];

const SPECIFIC_CATALOG_CATEGORIES = new Set([
  "cpu",
  "gpu",
  "ram",
  "storage",
  "keyboard",
  "mouse",
  "headset",
  "webcam",
]);

const CATEGORY_MATCH_TERMS: Record<string, string[]> = {
  cpu: ["processor", "processors"],
  gpu: ["graphics", "graphics card", "gpu"],
  ram: ["memory", "ram"],
  storage: ["storage", "ssd", "hdd", "nvme"],
  laptop: ["laptop", "notebook"],
  desktop: ["desktop", "desktops", "gaming pc"],
  monitor: ["monitor", "display", "screen"],
  keyboard: ["keyboard"],
  mouse: ["mouse"],
  headset: ["headset", "headphone"],
  webcam: ["webcam", "camera"],
};

type CatalogProduct = Prisma.ProductGetPayload<{
  include: {
    category: true;
    brand: true;
  };
}>;

type RetrievalMode = "strict" | "relaxed";

interface PriceBenchmarks {
  min: number;
  median: number;
  high: number;
  max: number;
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(
      values
        .map((value) => value?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value))
    ),
  ];
}

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function humanizeLabel(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function hasAttributeFilters(filters: ChatAttributeFilters): boolean {
  return Boolean(
    filters.ram || filters.storage || filters.gpu || filters.cpuBrand
  );
}

export class ChatbotRetrievalService {
  parseRuleBasedIntent(prompt: string): ChatIntentFilters {
    const normalized = normalizeText(prompt);
    const categorySignals = this.extractCategorySignals(normalized);

    const intent: ChatIntentFilters = {
      ...createEmptyIntentFilters(),
      maxPrice: this.extractMaxPrice(normalized),
      minPrice: this.extractMinPrice(normalized),
      category: categorySignals.category,
      categoryKeywords: categorySignals.categoryKeywords,
      brandKeywords: this.extractBrands(normalized),
      usageTags: this.extractUsageTags(normalized),
      searchTerms: this.extractSearchTerms(normalized),
      attributeFilters: this.extractAttributeFilters(normalized),
      sortPreference: this.extractSortPreference(normalized),
      performanceTier: this.extractPerformanceTier(normalized),
      formFactor: categorySignals.formFactor,
      resetContext: RESET_KEYWORDS.some((keyword) => normalized.includes(keyword)),
      isProductQuery: false,
    };

    intent.isProductQuery =
      PRODUCT_TRIGGER_KEYWORDS.some((keyword) => normalized.includes(keyword)) ||
      intent.maxPrice !== null ||
      intent.minPrice !== null ||
      intent.brandKeywords.length > 0 ||
      intent.categoryKeywords.length > 0 ||
      intent.usageTags.length > 0 ||
      intent.searchTerms.length > 0 ||
      hasAttributeFilters(intent.attributeFilters);

    return intent;
  }

  mergeIntent(params: {
    prompt: string;
    sessionFilters?: ChatIntentFilters;
    ruleIntent: ChatIntentFilters;
    aiIntent?: ChatIntentExtraction | null;
  }): {
    intent: ChatIntentFilters;
    usedSessionMemory: boolean;
    usedAiIntent: boolean;
  } {
    const sessionFilters = params.sessionFilters ?? createEmptyIntentFilters();
    const aiIntent = this.normalizeAiIntent(params.aiIntent);
    const promptIntent = this.combinePromptSignals(params.ruleIntent, aiIntent);
    const promptText = normalizeText(params.prompt);
    const hasSessionContext = this.hasActiveFilters(sessionFilters);
    const shouldReset =
      promptIntent.resetContext || this.shouldResetContext(promptText, promptIntent);
    const shouldCarrySession =
      !shouldReset &&
      hasSessionContext &&
      (promptIntent.isProductQuery || this.isRefinementPrompt(promptText));

    const base = shouldCarrySession ? sessionFilters : createEmptyIntentFilters();
    const categoryChanged =
      Boolean(promptIntent.category) &&
      promptIntent.category !== base.category;

    const intent: ChatIntentFilters = {
      ...createEmptyIntentFilters(),
      ...base,
      isProductQuery:
        promptIntent.isProductQuery ||
        shouldCarrySession ||
        this.hasActiveFilters(promptIntent),
      resetContext: shouldReset,
      maxPrice: promptIntent.maxPrice ?? base.maxPrice,
      minPrice: promptIntent.minPrice ?? base.minPrice,
      category: promptIntent.category ?? base.category,
      categoryKeywords: uniqueStrings(
        categoryChanged || !shouldCarrySession
          ? [...promptIntent.categoryKeywords, promptIntent.category]
          : [...base.categoryKeywords, ...promptIntent.categoryKeywords, promptIntent.category]
      ),
      brandKeywords:
        promptIntent.brandKeywords.length > 0
          ? promptIntent.brandKeywords
          : base.brandKeywords,
      usageTags: uniqueStrings(
        promptIntent.usageTags.length > 0
          ? categoryChanged || !shouldCarrySession
            ? promptIntent.usageTags
            : [...base.usageTags, ...promptIntent.usageTags]
          : base.usageTags
      ),
      searchTerms: uniqueStrings(
        categoryChanged || !shouldCarrySession
          ? [...promptIntent.searchTerms]
          : [...base.searchTerms, ...promptIntent.searchTerms]
      ),
      attributeFilters: {
        ...base.attributeFilters,
        ...promptIntent.attributeFilters,
      },
      sortPreference: promptIntent.sortPreference ?? base.sortPreference,
      performanceTier: promptIntent.performanceTier ?? base.performanceTier,
      formFactor:
        promptIntent.formFactor ??
        this.deriveFormFactor(promptIntent.category) ??
        base.formFactor,
    };

    intent.categoryKeywords = uniqueStrings([
      ...intent.categoryKeywords,
      ...this.deriveCategoryKeywords(intent.category),
    ]);
    intent.searchTerms = uniqueStrings([
      ...intent.searchTerms,
      ...this.queryTermsForUsageTags(intent.usageTags),
    ]);

    if (
      intent.maxPrice !== null &&
      intent.minPrice !== null &&
      intent.minPrice > intent.maxPrice
    ) {
      const nextMaxPrice = intent.minPrice;
      intent.minPrice = intent.maxPrice;
      intent.maxPrice = nextMaxPrice;
    }

    return {
      intent,
      usedSessionMemory: shouldCarrySession,
      usedAiIntent: this.hasExtraction(aiIntent),
    };
  }

  async searchProducts(params: {
    prompt: string;
    sessionFilters?: ChatIntentFilters;
    aiIntent?: ChatIntentExtraction | null;
  }): Promise<ProductRetrievalResult> {
    const ruleIntent = this.parseRuleBasedIntent(params.prompt);
    const { intent, usedSessionMemory, usedAiIntent } = this.mergeIntent({
      prompt: params.prompt,
      sessionFilters: params.sessionFilters,
      ruleIntent,
      aiIntent: params.aiIntent,
    });

    if (!intent.isProductQuery) {
      return {
        intent,
        products: [],
        matchType: "none",
        totalCandidates: 0,
        usedSessionMemory,
        usedAiIntent,
      };
    }

    const strictCandidates = await this.fetchCandidates(intent, "strict");
    const strictRanked = await this.rankProducts(strictCandidates, intent);
    const exactProducts = this.selectProducts(strictRanked, intent, "exact");

    if (exactProducts.length > 0) {
      return {
        intent,
        products: exactProducts,
        matchType: "exact",
        totalCandidates: strictCandidates.length,
        usedSessionMemory,
        usedAiIntent,
      };
    }

    const relaxedCandidates = await this.fetchCandidates(intent, "relaxed");
    const relaxedRanked = await this.rankProducts(relaxedCandidates, intent);
    const alternativeProducts = this.selectProducts(
      relaxedRanked,
      intent,
      "alternative"
    );

    return {
      intent,
      products: alternativeProducts,
      matchType: alternativeProducts.length > 0 ? "alternative" : "none",
      totalCandidates: relaxedCandidates.length,
      usedSessionMemory,
      usedAiIntent,
    };
  }

  buildFilterSummary(filters: ChatIntentFilters): string[] {
    const labels: string[] = [];

    if (filters.category) {
      labels.push(humanizeLabel(filters.category));
    } else if (filters.formFactor) {
      labels.push(humanizeLabel(filters.formFactor));
    }

    if (filters.maxPrice !== null) {
      labels.push(`Under ${Math.round(filters.maxPrice)} DT`);
    }

    if (filters.minPrice !== null) {
      labels.push(`From ${Math.round(filters.minPrice)} DT`);
    }

    for (const brand of filters.brandKeywords) {
      labels.push(humanizeLabel(brand));
    }

    for (const usageTag of filters.usageTags) {
      labels.push(humanizeLabel(usageTag));
    }

    if (filters.attributeFilters.ram) {
      labels.push(filters.attributeFilters.ram.toUpperCase());
    }

    if (filters.attributeFilters.storage) {
      labels.push(filters.attributeFilters.storage.toUpperCase());
    }

    if (filters.attributeFilters.gpu) {
      labels.push(humanizeLabel(filters.attributeFilters.gpu));
    }

    if (filters.attributeFilters.cpuBrand) {
      labels.push(`${humanizeLabel(filters.attributeFilters.cpuBrand)} CPU`);
    }

    if (filters.sortPreference === "value") {
      labels.push("Best value");
    }

    if (filters.sortPreference === "popular") {
      labels.push("Popular");
    }

    if (filters.performanceTier) {
      labels.push(`${humanizeLabel(filters.performanceTier)} performance`);
    }

    const seen = new Set<string>();
    return labels.filter((label) => {
      const normalized = label.trim().toLowerCase();
      if (!normalized || seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
  }

  formatProductContext(products: RankedChatProduct[]): string {
    if (products.length === 0) {
      return "No matching products were found in our store inventory.";
    }

    return products
      .map((product, index) => {
        const parts = [
          `${index + 1}. ${product.name}`,
          `${product.price} DT`,
          product.brand ? `Brand: ${product.brand}` : null,
          product.category ? `Category: ${product.category}` : null,
          `Stock: ${product.stock}`,
          `URL: ${product.url}`,
          product.matchReasons.length > 0
            ? `Why it matched: ${product.matchReasons.join(", ")}`
            : null,
        ].filter((part): part is string => Boolean(part));

        return parts.join(" | ");
      })
      .join("\n");
  }

  private normalizeAiIntent(
    aiIntent?: ChatIntentExtraction | null
  ): ChatIntentExtraction {
    if (!aiIntent) {
      return {};
    }

    const allowedSortPreferences: ChatSortPreference[] = [
      "price_asc",
      "price_desc",
      "value",
      "popular",
      "relevance",
    ];
    const allowedPerformanceTiers: ChatPerformanceTier[] = [
      "entry",
      "mid",
      "high",
    ];
    const allowedFormFactors: ChatFormFactor[] = [
      "laptop",
      "desktop",
      "component",
      "accessory",
      "monitor",
    ];

    return {
      isProductQuery:
        typeof aiIntent.isProductQuery === "boolean"
          ? aiIntent.isProductQuery
          : undefined,
      resetContext:
        typeof aiIntent.resetContext === "boolean"
          ? aiIntent.resetContext
          : undefined,
      maxPrice:
        typeof aiIntent.maxPrice === "number" && aiIntent.maxPrice > 0
          ? aiIntent.maxPrice
          : undefined,
      minPrice:
        typeof aiIntent.minPrice === "number" && aiIntent.minPrice > 0
          ? aiIntent.minPrice
          : undefined,
      category:
        typeof aiIntent.category === "string" && aiIntent.category.trim()
          ? aiIntent.category.trim().toLowerCase()
          : undefined,
      brandKeywords: uniqueStrings(aiIntent.brandKeywords ?? []),
      usageTags: uniqueStrings(aiIntent.usageTags ?? []),
      searchTerms: uniqueStrings(aiIntent.searchTerms ?? []),
      sortPreference:
        aiIntent.sortPreference &&
        allowedSortPreferences.includes(aiIntent.sortPreference)
          ? aiIntent.sortPreference
          : undefined,
      performanceTier:
        aiIntent.performanceTier &&
        allowedPerformanceTiers.includes(aiIntent.performanceTier)
          ? aiIntent.performanceTier
          : undefined,
      formFactor:
        aiIntent.formFactor && allowedFormFactors.includes(aiIntent.formFactor)
          ? aiIntent.formFactor
          : undefined,
      attributeFilters: {
        ram:
          typeof aiIntent.attributeFilters?.ram === "string" &&
          aiIntent.attributeFilters.ram.trim()
            ? aiIntent.attributeFilters.ram.trim().toLowerCase()
            : undefined,
        storage:
          typeof aiIntent.attributeFilters?.storage === "string" &&
          aiIntent.attributeFilters.storage.trim()
            ? aiIntent.attributeFilters.storage.trim().toLowerCase()
            : undefined,
        gpu:
          typeof aiIntent.attributeFilters?.gpu === "string" &&
          aiIntent.attributeFilters.gpu.trim()
            ? aiIntent.attributeFilters.gpu.trim().toLowerCase()
            : undefined,
        cpuBrand:
          typeof aiIntent.attributeFilters?.cpuBrand === "string" &&
          aiIntent.attributeFilters.cpuBrand.trim()
            ? aiIntent.attributeFilters.cpuBrand.trim().toLowerCase()
            : undefined,
      },
    };
  }

  private combinePromptSignals(
    ruleIntent: ChatIntentFilters,
    aiIntent: ChatIntentExtraction
  ): ChatIntentFilters {
    const category = aiIntent.category ?? ruleIntent.category;
    const formFactor =
      aiIntent.formFactor ??
      this.deriveFormFactor(category) ??
      ruleIntent.formFactor;

    return {
      ...createEmptyIntentFilters(),
      isProductQuery: aiIntent.isProductQuery ?? ruleIntent.isProductQuery,
      resetContext: aiIntent.resetContext ?? ruleIntent.resetContext,
      maxPrice: aiIntent.maxPrice ?? ruleIntent.maxPrice,
      minPrice: aiIntent.minPrice ?? ruleIntent.minPrice,
      category,
      categoryKeywords: uniqueStrings([
        ...ruleIntent.categoryKeywords,
        ...this.deriveCategoryKeywords(category),
      ]),
      brandKeywords: uniqueStrings([
        ...ruleIntent.brandKeywords,
        ...(aiIntent.brandKeywords ?? []),
      ]),
      usageTags: uniqueStrings([
        ...ruleIntent.usageTags,
        ...(aiIntent.usageTags ?? []),
      ]),
      searchTerms: uniqueStrings([
        ...ruleIntent.searchTerms,
        ...(aiIntent.searchTerms ?? []),
      ]),
      attributeFilters: {
        ...ruleIntent.attributeFilters,
        ...aiIntent.attributeFilters,
      },
      sortPreference: aiIntent.sortPreference ?? ruleIntent.sortPreference,
      performanceTier: aiIntent.performanceTier ?? ruleIntent.performanceTier,
      formFactor,
    };
  }

  private extractMaxPrice(text: string): number | null {
    for (const pattern of BUDGET_PATTERNS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match?.[1]) {
        const value = this.parseNumericValue(match[1]);
        if (value !== null) {
          return value;
        }
      }
    }

    return null;
  }

  private extractMinPrice(text: string): number | null {
    for (const pattern of MIN_PRICE_PATTERNS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match?.[1]) {
        const value = this.parseNumericValue(match[1]);
        if (value !== null) {
          return value;
        }
      }
    }

    return null;
  }

  private parseNumericValue(rawValue: string): number | null {
    const normalized = rawValue.replace(/\s/g, "").replace(/,/g, ".");
    const value = parseFloat(normalized);

    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    return value;
  }

  private extractBrands(text: string): string[] {
    return KNOWN_BRANDS.filter((brand) => {
      const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?:^|\\s|,)${escapedBrand}(?:$|\\s|,|\\.)`, "i");
      return regex.test(text);
    });
  }

  private extractCategorySignals(text: string): {
    category: string | null;
    categoryKeywords: string[];
    formFactor: ChatFormFactor | null;
  } {
    const matches = CATEGORY_DEFINITIONS.filter((definition) =>
      definition.keywords.some((keyword) => text.includes(keyword))
    );

    if (matches.length === 0) {
      return { category: null, categoryKeywords: [], formFactor: null };
    }

    return {
      category: matches[0]?.category ?? null,
      categoryKeywords: uniqueStrings(
        matches.flatMap((definition) => definition.queryTerms)
      ),
      formFactor: matches[0]?.formFactor ?? null,
    };
  }

  private deriveCategoryKeywords(category: string | null): string[] {
    if (!category) {
      return [];
    }

    const definition = CATEGORY_DEFINITIONS.find(
      (candidate) => candidate.category === category
    );

    return definition
      ? uniqueStrings([definition.category, ...definition.queryTerms])
      : [category];
  }

  private deriveFormFactor(category: string | null): ChatFormFactor | null {
    return (
      CATEGORY_DEFINITIONS.find((definition) => definition.category === category)
        ?.formFactor ?? null
    );
  }

  private isSpecificCatalogCategory(category: string | null): boolean {
    return Boolean(category && SPECIFIC_CATALOG_CATEGORIES.has(category));
  }

  private getCategoryMatchTerms(category: string | null): string[] {
    if (!category) {
      return [];
    }

    return CATEGORY_MATCH_TERMS[category] ?? [category];
  }

  private extractUsageTags(text: string): string[] {
    return USAGE_DEFINITIONS.filter((definition) =>
      definition.keywords.some((keyword) => text.includes(keyword))
    ).map((definition) => definition.tag);
  }

  private queryTermsForUsageTags(usageTags: string[]): string[] {
    return uniqueStrings(
      usageTags.flatMap((usageTag) => {
        const definition = USAGE_DEFINITIONS.find(
          (candidate) => candidate.tag === usageTag
        );
        return definition?.queryTerms ?? [];
      })
    );
  }

  private extractSearchTerms(text: string): string[] {
    return COMPONENT_KEYWORDS.filter((keyword) => text.includes(keyword));
  }

  private extractAttributeFilters(text: string): ChatAttributeFilters {
    const ramMatch =
      text.match(/(?:ram|memory)\s*(?:of\s*)?(\d{1,3}\s?gb)/i) ??
      text.match(/(\d{1,3}\s?gb)\s*(?:ram|memory)/i);
    const storageMatch =
      text.match(/((?:128|256|512|1024|2048)\s?gb|\d\s?tb)\s*(?:ssd|hdd|storage|nvme)/i) ??
      (text.includes("storage")
        ? text.match(/((?:128|256|512|1024|2048)\s?gb|\d\s?tb)/i)
        : null);
    const gpuMatch = text.match(
      /(rtx\s?\d{3,4}|gtx\s?\d{3,4}|rx\s?\d{3,4}|radeon|geforce|nvidia)/i
    );
    const cpuBrandMatch = text.match(/\b(intel|amd|apple)\b/i);

    return {
      ram: ramMatch?.[1]?.replace(/\s+/g, "").toLowerCase() ?? null,
      storage: storageMatch?.[1]?.replace(/\s+/g, "").toLowerCase() ?? null,
      gpu: gpuMatch?.[1]?.replace(/\s+/g, " ").toLowerCase() ?? null,
      cpuBrand: cpuBrandMatch?.[1]?.toLowerCase() ?? null,
    };
  }

  private extractSortPreference(text: string): ChatSortPreference | null {
    if (POPULAR_KEYWORDS.some((keyword) => text.includes(keyword))) {
      return "popular";
    }

    if (
      text.includes("best value") ||
      text.includes("value for money") ||
      text.includes("worth it")
    ) {
      return "value";
    }

    if (CHEAP_KEYWORDS.some((keyword) => text.includes(keyword))) {
      return "price_asc";
    }

    if (PREMIUM_KEYWORDS.some((keyword) => text.includes(keyword))) {
      return "price_desc";
    }

    return null;
  }

  private extractPerformanceTier(text: string): ChatPerformanceTier | null {
    if (
      text.includes("4k") ||
      text.includes("high end") ||
      text.includes("high-end") ||
      text.includes("flagship") ||
      text.includes("aaa") ||
      text.includes("render")
    ) {
      return "high";
    }

    if (
      text.includes("entry") ||
      text.includes("basic") ||
      text.includes("light") ||
      text.includes("cheap")
    ) {
      return "entry";
    }

    if (
      text.includes("mid") ||
      text.includes("midrange") ||
      text.includes("mid-range") ||
      text.includes("1080p") ||
      text.includes("programming") ||
      text.includes("gaming")
    ) {
      return "mid";
    }

    return null;
  }

  private shouldResetContext(
    prompt: string,
    promptIntent: ChatIntentFilters
  ): boolean {
    return (
      promptIntent.resetContext ||
      (promptIntent.category !== null &&
        RESET_KEYWORDS.some((keyword) => prompt.includes(keyword)))
    );
  }

  private isRefinementPrompt(prompt: string): boolean {
    const words = prompt.split(/\s+/).filter(Boolean);

    return (
      FOLLOW_UP_KEYWORDS.some((keyword) => prompt.includes(keyword)) ||
      words.length <= 6
    );
  }

  private hasActiveFilters(filters: ChatIntentFilters): boolean {
    return Boolean(
      filters.maxPrice !== null ||
        filters.minPrice !== null ||
        filters.category ||
        filters.categoryKeywords.length > 0 ||
        filters.brandKeywords.length > 0 ||
        filters.usageTags.length > 0 ||
        filters.searchTerms.length > 0 ||
        filters.sortPreference ||
        filters.performanceTier ||
        filters.formFactor ||
        hasAttributeFilters(filters.attributeFilters)
    );
  }

  private hasExtraction(extraction: ChatIntentExtraction): boolean {
    return Boolean(
      extraction.isProductQuery !== undefined ||
        extraction.resetContext !== undefined ||
        extraction.maxPrice !== undefined ||
        extraction.minPrice !== undefined ||
        extraction.category ||
        (extraction.brandKeywords?.length ?? 0) > 0 ||
        (extraction.usageTags?.length ?? 0) > 0 ||
        (extraction.searchTerms?.length ?? 0) > 0 ||
        extraction.sortPreference ||
        extraction.performanceTier ||
        extraction.formFactor ||
        extraction.attributeFilters?.ram ||
        extraction.attributeFilters?.storage ||
        extraction.attributeFilters?.gpu ||
        extraction.attributeFilters?.cpuBrand
    );
  }

  private async fetchCandidates(
    intent: ChatIntentFilters,
    mode: RetrievalMode
  ): Promise<CatalogProduct[]> {
    try {
      return await prisma.product.findMany({
        where: this.buildWhere(intent, mode),
        include: {
          category: true,
          brand: true,
        },
        orderBy: this.buildOrderBy(intent),
        take:
          mode === "strict" ? MAX_STRICT_CANDIDATES : MAX_RELAXED_CANDIDATES,
      });
    } catch {
      return [];
    }
  }

  private buildWhere(
    intent: ChatIntentFilters,
    mode: RetrievalMode
  ): Prisma.ProductWhereInput {
    const conditions: Prisma.ProductWhereInput[] = [{ stock: { gt: 0 } }];
    const priceFilter: Prisma.FloatFilter = {};

    if (intent.minPrice !== null) {
      priceFilter.gte =
        mode === "relaxed" ? Math.max(0, intent.minPrice * 0.85) : intent.minPrice;
    }

    if (intent.maxPrice !== null) {
      priceFilter.lte =
        mode === "relaxed" ? intent.maxPrice * 1.15 : intent.maxPrice;
    }

    if (priceFilter.gte !== undefined || priceFilter.lte !== undefined) {
      conditions.push({ price: priceFilter });
    }

    if (intent.brandKeywords.length > 0 && mode === "strict") {
      conditions.push({
        OR: intent.brandKeywords.map((brand) => ({
          brand: {
            name: {
              contains: brand,
              mode: "insensitive",
            },
          },
        })),
      });
    }

    const categoryClauses = this.buildCategoryClauses(intent);
    if (categoryClauses.length > 0) {
      conditions.push({ OR: categoryClauses });
    }

    const queryTerms = this.buildQueryTerms(intent).slice(
      0,
      mode === "strict" ? 12 : 8
    );

    if (queryTerms.length > 0) {
      conditions.push({
        OR: queryTerms.flatMap((term) => [
          { name: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { brand: { name: { contains: term, mode: "insensitive" } } },
          { category: { name: { contains: term, mode: "insensitive" } } },
        ]),
      });
    }

    return { AND: conditions };
  }

  private buildCategoryClauses(
    intent: ChatIntentFilters
  ): Prisma.ProductWhereInput[] {
    const categoryTerms = this.getCategoryMatchTerms(intent.category);

    if (categoryTerms.length === 0) {
      return [];
    }

    return categoryTerms.flatMap((term) => [
      { name: { contains: term, mode: "insensitive" } },
      { category: { name: { contains: term, mode: "insensitive" } } },
    ]);
  }

  private buildOrderBy(
    intent: ChatIntentFilters
  ): Prisma.ProductOrderByWithRelationInput[] {
    if (intent.sortPreference === "price_asc") {
      return [{ price: "asc" }, { stock: "desc" }];
    }

    if (intent.sortPreference === "price_desc") {
      return [{ price: "desc" }, { stock: "desc" }];
    }

    return [{ stock: "desc" }, { updatedAt: "desc" }];
  }

  private buildQueryTerms(intent: ChatIntentFilters): string[] {
    const performanceTerms =
      intent.performanceTier === "high"
        ? ["high end", "gaming", "pro"]
        : intent.performanceTier === "mid"
          ? ["gaming", "creator", "mid"]
          : intent.performanceTier === "entry"
            ? ["budget", "office", "entry"]
            : [];

    return uniqueStrings([
      intent.category,
      this.isSpecificCatalogCategory(intent.category) ? null : intent.formFactor,
      ...intent.categoryKeywords,
      ...intent.searchTerms,
      ...this.queryTermsForUsageTags(intent.usageTags),
      intent.attributeFilters.ram,
      intent.attributeFilters.storage,
      intent.attributeFilters.gpu,
      intent.attributeFilters.cpuBrand,
      ...performanceTerms,
    ]);
  }

  private async rankProducts(
    products: CatalogProduct[],
    intent: ChatIntentFilters
  ): Promise<RankedChatProduct[]> {
    if (products.length === 0) {
      return [];
    }

    const popularityMap = await this.fetchPopularityMap(
      products.map((product) => product.id)
    );
    const maxPopularity = Math.max(...popularityMap.values(), 0);
    const priceBenchmarks = this.buildPriceBenchmarks(products);
    const queryTerms = this.buildQueryTerms(intent);

    return products
      .map((product) =>
        this.buildRankedProduct({
          product,
          intent,
          popularity: popularityMap.get(product.id) ?? 0,
          maxPopularity,
          priceBenchmarks,
          queryTerms,
        })
      )
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (intent.sortPreference === "price_asc") {
          return left.price - right.price;
        }

        if (intent.sortPreference === "price_desc") {
          return right.price - left.price;
        }

        return right.stock - left.stock;
      });
  }

  private async fetchPopularityMap(
    productIds: string[]
  ): Promise<Map<string, number>> {
    if (productIds.length === 0) {
      return new Map();
    }

    try {
      const orderItems = await prisma.orderItem.findMany({
        where: {
          productId: { in: productIds },
          order: {
            status: {
              in: ["PROCESSING", "SHIPPED", "DELIVERED"],
            },
          },
        },
        select: {
          productId: true,
          quantity: true,
        },
      });

      const popularityMap = new Map<string, number>();

      for (const item of orderItems) {
        popularityMap.set(
          item.productId,
          (popularityMap.get(item.productId) ?? 0) + item.quantity
        );
      }

      return popularityMap;
    } catch {
      return new Map();
    }
  }

  private buildPriceBenchmarks(products: CatalogProduct[]): PriceBenchmarks {
    const prices = products
      .map((product) => product.price)
      .sort((left, right) => left - right);
    const lastIndex = prices.length - 1;
    const medianIndex = Math.floor(lastIndex / 2);
    const highIndex = Math.floor(lastIndex * 0.75);

    return {
      min: prices[0] ?? 0,
      median: prices[medianIndex] ?? prices[0] ?? 0,
      high: prices[highIndex] ?? prices[medianIndex] ?? prices[0] ?? 0,
      max: prices[lastIndex] ?? 0,
    };
  }

  private buildRankedProduct(params: {
    product: CatalogProduct;
    intent: ChatIntentFilters;
    popularity: number;
    maxPopularity: number;
    priceBenchmarks: PriceBenchmarks;
    queryTerms: string[];
  }): RankedChatProduct {
    const { product, intent, popularity, maxPopularity, priceBenchmarks, queryTerms } =
      params;
    const categoryText = normalizeText(
      (product.category as any)?.name
    );
    const searchableText = normalizeText(
      [
        product.name,
        product.description,
        (product.brand as any)?.name,
        (product.category as any)?.name,
      ].join(" ")
    );
    const usageTags = this.inferUsageTags(searchableText);
    const formFactor = this.inferFormFactor(searchableText, product);
    const performanceTier = this.inferProductPerformanceTier(
      searchableText,
      product.price,
      priceBenchmarks
    );

    const reasons: string[] = [];
    let score = 0;

    const budgetScore = this.scoreBudget(intent, product.price);
    score += budgetScore;
    if (budgetScore >= 18) {
      reasons.push("within your budget");
    }

    const categoryScore = this.scoreCategory(
      intent,
      categoryText,
      searchableText,
      formFactor
    );
    score += categoryScore;
    if (categoryScore >= 12) {
      reasons.push("matches your category");
    }

    const usageScore = this.scoreUsage(intent, usageTags);
    score += usageScore;
    if (usageScore >= 8) {
      reasons.push("fits your use case");
    }

    const brandScore = this.scoreBrand(intent, product.brand?.name ?? null);
    score += brandScore;
    if (brandScore >= 12) {
      reasons.push("brand match");
    }

    const attributeScore = this.scoreAttributes(intent, searchableText);
    score += attributeScore;
    if (attributeScore >= 4) {
      reasons.push("matches your requested specs");
    }

    const relevanceScore = this.scoreQueryRelevance(queryTerms, searchableText);
    score += relevanceScore;
    if (relevanceScore >= 7) {
      reasons.push("strong keyword match");
    }

    const stockScore = (Math.min(product.stock, 20) / 20) * 10;
    score += stockScore;
    if (stockScore >= 6) {
      reasons.push("good stock availability");
    }

    const popularityScore =
      maxPopularity > 0 ? (popularity / maxPopularity) * 10 : 0;
    score += popularityScore;
    if (popularityScore >= 6) {
      reasons.push("popular with buyers");
    }

    const performanceScore = this.scorePerformance(intent, performanceTier);
    score += performanceScore;
    if (performanceScore >= 6) {
      reasons.push("matches the performance target");
    }

    score += this.scoreSortBias(
      intent,
      product.price,
      popularity,
      priceBenchmarks,
      maxPopularity
    );

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      url: `/product-page/${product.id}`,
      brand: product.brand?.name ?? null,
      category: (product.category as any)?.name ?? null,
      description: product.description,
      score: Math.round(score * 10) / 10,
      matchReasons: reasons.slice(0, 4),
      usageTags,
      performanceTier,
      formFactor,
      popularity,
    };
  }

  private inferUsageTags(searchableText: string): string[] {
    return USAGE_DEFINITIONS.filter((definition) =>
      definition.queryTerms.some((term) => searchableText.includes(term))
    ).map((definition) => definition.tag);
  }

  private inferFormFactor(
    searchableText: string,
    product: CatalogProduct
  ): ChatFormFactor | null {
    if (
      searchableText.includes("laptop") ||
      searchableText.includes("notebook")
    ) {
      return "laptop";
    }

    if (
      searchableText.includes("desktop") ||
      searchableText.includes("tower") ||
      normalizeText((product.category as any)?.name).includes("desktop")
    ) {
      return "desktop";
    }

    if (
      searchableText.includes("monitor") ||
      searchableText.includes("display")
    ) {
      return "monitor";
    }

    if (
      searchableText.includes("keyboard") ||
      searchableText.includes("mouse") ||
      searchableText.includes("headset") ||
      searchableText.includes("webcam")
    ) {
      return "accessory";
    }

    return "component";
  }

  private inferProductPerformanceTier(
    searchableText: string,
    price: number,
    priceBenchmarks: PriceBenchmarks
  ): ChatPerformanceTier {
    if (
      searchableText.includes("flagship") ||
      searchableText.includes("rtx 4090") ||
      searchableText.includes("ryzen 9") ||
      searchableText.includes("i9")
    ) {
      return "high";
    }

    if (
      searchableText.includes("gaming") ||
      searchableText.includes("rtx 4060") ||
      searchableText.includes("rtx 4070") ||
      searchableText.includes("ryzen 7") ||
      searchableText.includes("i7")
    ) {
      return "mid";
    }

    if (price >= priceBenchmarks.high) {
      return "high";
    }

    if (price >= priceBenchmarks.median) {
      return "mid";
    }

    return "entry";
  }

  private scoreBudget(intent: ChatIntentFilters, price: number): number {
    if (intent.maxPrice === null && intent.minPrice === null) {
      return 0;
    }

    let score = 0;

    if (intent.maxPrice !== null) {
      if (price <= intent.maxPrice) {
        const closeness = intent.maxPrice === 0 ? 1 : price / intent.maxPrice;
        score += 18 + Math.max(0, Math.min(1, closeness)) * 12;
      } else {
        const overRatio = (price - intent.maxPrice) / intent.maxPrice;
        if (overRatio <= 0.08) {
          score += 8;
        } else if (overRatio <= 0.15) {
          score += 3;
        }
      }
    }

    if (intent.minPrice !== null && price >= intent.minPrice) {
      score = Math.max(score, 12);
    }

    return score;
  }

  private scoreCategory(
    intent: ChatIntentFilters,
    categoryText: string,
    searchableText: string,
    formFactor: ChatFormFactor | null
  ): number {
    if (
      !intent.category &&
      !intent.formFactor &&
      intent.categoryKeywords.length === 0
    ) {
      return 0;
    }

    const categoryTerms = this.getCategoryMatchTerms(intent.category);
    const exactCategoryMatch = categoryTerms.some(
      (term) =>
        categoryText.includes(term) ||
        (!this.isSpecificCatalogCategory(intent.category) &&
          searchableText.includes(term))
    );

    if (exactCategoryMatch) {
      return 25;
    }

    if (
      intent.formFactor &&
      formFactor === intent.formFactor &&
      !this.isSpecificCatalogCategory(intent.category)
    ) {
      return 16;
    }

    const partialMatches = intent.categoryKeywords.filter((keyword) =>
      searchableText.includes(keyword)
    ).length;

    return this.isSpecificCatalogCategory(intent.category)
      ? Math.min(10, partialMatches * 3)
      : Math.min(20, partialMatches * 6);
  }

  private scoreUsage(
    intent: ChatIntentFilters,
    productUsageTags: string[]
  ): number {
    if (intent.usageTags.length === 0) {
      return 0;
    }

    const overlaps = intent.usageTags.filter((tag) =>
      productUsageTags.includes(tag)
    ).length;

    return Math.min(15, overlaps * 7.5);
  }

  private scoreBrand(
    intent: ChatIntentFilters,
    productBrand: string | null
  ): number {
    if (!productBrand || intent.brandKeywords.length === 0) {
      return 0;
    }

    const normalizedBrand = productBrand.toLowerCase();
    return intent.brandKeywords.some((brand) => normalizedBrand.includes(brand))
      ? 15
      : 0;
  }

  private scoreAttributes(
    intent: ChatIntentFilters,
    searchableText: string
  ): number {
    if (!hasAttributeFilters(intent.attributeFilters)) {
      return 0;
    }

    let score = 0;

    if (
      intent.attributeFilters.ram &&
      searchableText.includes(intent.attributeFilters.ram)
    ) {
      score += 4;
    }

    if (
      intent.attributeFilters.storage &&
      searchableText.includes(intent.attributeFilters.storage)
    ) {
      score += 4;
    }

    if (
      intent.attributeFilters.gpu &&
      searchableText.includes(intent.attributeFilters.gpu)
    ) {
      score += 4;
    }

    if (
      intent.attributeFilters.cpuBrand &&
      searchableText.includes(intent.attributeFilters.cpuBrand)
    ) {
      score += 4;
    }

    return score;
  }

  private scoreQueryRelevance(
    queryTerms: string[],
    searchableText: string
  ): number {
    if (queryTerms.length === 0) {
      return 0;
    }

    const matches = queryTerms.filter((term) => searchableText.includes(term))
      .length;

    return (matches / queryTerms.length) * 12;
  }

  private scorePerformance(
    intent: ChatIntentFilters,
    productPerformanceTier: ChatPerformanceTier
  ): number {
    if (!intent.performanceTier) {
      return 0;
    }

    if (intent.performanceTier === productPerformanceTier) {
      return 8;
    }

    if (
      (intent.performanceTier === "high" && productPerformanceTier === "mid") ||
      (intent.performanceTier === "mid" && productPerformanceTier === "high")
    ) {
      return 4;
    }

    return 0;
  }

  private scoreSortBias(
    intent: ChatIntentFilters,
    price: number,
    popularity: number,
    priceBenchmarks: PriceBenchmarks,
    maxPopularity: number
  ): number {
    if (intent.sortPreference === "price_asc") {
      const range = Math.max(priceBenchmarks.max - priceBenchmarks.min, 1);
      return ((priceBenchmarks.max - price) / range) * 6;
    }

    if (intent.sortPreference === "price_desc") {
      const range = Math.max(priceBenchmarks.max - priceBenchmarks.min, 1);
      return ((price - priceBenchmarks.min) / range) * 6;
    }

    if (intent.sortPreference === "popular") {
      return maxPopularity > 0 ? (popularity / maxPopularity) * 6 : 0;
    }

    if (intent.sortPreference === "value") {
      const priceRange = Math.max(priceBenchmarks.max - priceBenchmarks.min, 1);
      const affordability = (priceBenchmarks.max - price) / priceRange;
      const popularityBoost = maxPopularity > 0 ? popularity / maxPopularity : 0;
      return (affordability * 0.6 + popularityBoost * 0.4) * 6;
    }

    return 0;
  }

  private selectProducts(
    rankedProducts: RankedChatProduct[],
    intent: ChatIntentFilters,
    matchType: ChatMatchType
  ): RankedChatProduct[] {
    if (rankedProducts.length === 0) {
      return [];
    }

    if (matchType === "alternative") {
      return rankedProducts.slice(0, MAX_PRIMARY_PRODUCTS);
    }

    const activeConstraints = this.countActiveConstraints(intent);
    const threshold =
      activeConstraints >= 4
        ? 34
        : activeConstraints >= 2
          ? 28
          : activeConstraints >= 1
            ? 22
            : 0;

    const exactProducts = rankedProducts
      .filter(
        (product) =>
          product.score >= threshold &&
          this.isExactCategoryProductMatch(product, intent)
      )
      .slice(0, MAX_PRIMARY_PRODUCTS);

    if (exactProducts.length > 0) {
      return exactProducts;
    }

    return activeConstraints === 0
      ? rankedProducts.slice(0, MAX_PRIMARY_PRODUCTS)
      : [];
  }

  private countActiveConstraints(intent: ChatIntentFilters): number {
    return [
      intent.maxPrice !== null || intent.minPrice !== null,
      Boolean(intent.category || intent.formFactor),
      intent.brandKeywords.length > 0,
      intent.usageTags.length > 0,
      intent.searchTerms.length > 0,
      hasAttributeFilters(intent.attributeFilters),
      Boolean(intent.performanceTier),
    ].filter(Boolean).length;
  }

  private isExactCategoryProductMatch(
    product: RankedChatProduct,
    intent: ChatIntentFilters
  ): boolean {
    if (!this.isSpecificCatalogCategory(intent.category)) {
      return true;
    }

    const categoryText = normalizeText(
      [product.category].filter(Boolean).join(" ")
    );
    const matchTerms = this.getCategoryMatchTerms(intent.category);

    return matchTerms.some((term) => categoryText.includes(term));
  }
}

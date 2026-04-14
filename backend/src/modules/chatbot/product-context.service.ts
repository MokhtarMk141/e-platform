import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";

const MAX_PRODUCTS_IN_CONTEXT = 10;

interface ParsedIntent {
  maxPrice: number | null;
  minPrice: number | null;
  brandKeywords: string[];
  searchTerms: string[];
  sortDirection: "asc" | "desc" | null;
  isProductQuery: boolean;
}

interface ProductContextItem {
  name: string;
  price: number;
  brand: string | null;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  stock: number;
  imageUrl: string | null;
}

const PRODUCT_TRIGGER_KEYWORDS = [
  "pc",
  "computer",
  "laptop",
  "desktop",
  "gaming",
  "office",
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
  "accessories",
  "cable",
  "webcam",
  "microphone",
  "product",
  "products",
  "buy",
  "recommend",
  "suggestion",
  "suggest",
  "price",
  "cheap",
  "budget",
  "expensive",
  "premium",
  "best",
  "top",
  "affordable",
  "available",
  "stock",
  "brand",
  "show me",
  "what do you have",
  "what you have",
  "build",
];

const BUDGET_PATTERNS = [
  /(?:under|less than|below|max|maximum|up to|within|around|about|budget)\s*(\d[\d\s.,]*)\s*(?:dt|tnd|dinar)?/gi,
  /(\d[\d\s.,]*)\s*(?:dt|tnd|dinar)\s*(?:or less|max|maximum|budget)?/gi,
  /(?:budget|prix|price)\s*(?:is|of|:)?\s*(\d[\d\s.,]*)/gi,
];

const CHEAP_KEYWORDS = ["cheap", "budget", "affordable", "low price", "lowest", "less expensive", "economical"];
const PREMIUM_KEYWORDS = ["best", "top", "premium", "expensive", "high end", "high-end", "flagship", "pro"];

export class ProductContextService {
  parseIntent(prompt: string): ParsedIntent {
    const normalized = prompt.toLowerCase().trim();

    const isProductQuery = PRODUCT_TRIGGER_KEYWORDS.some((keyword) =>
      normalized.includes(keyword)
    );

    const maxPrice = this.extractMaxPrice(normalized);
    const minPrice = this.extractMinPrice(normalized);
    const brandKeywords = this.extractBrands(normalized);
    const searchTerms = this.extractSearchTerms(normalized);
    const sortDirection = this.extractSortDirection(normalized);

    return {
      maxPrice,
      minPrice,
      brandKeywords,
      searchTerms,
      sortDirection,
      isProductQuery:
        isProductQuery ||
        maxPrice !== null ||
        brandKeywords.length > 0 ||
        searchTerms.length > 0,
    };
  }

  private extractMaxPrice(text: string): number | null {
    for (const pattern of BUDGET_PATTERNS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match?.[1]) {
        const raw = match[1].replace(/[\s,]/g, "").replace(",", ".");
        const value = parseFloat(raw);
        if (!isNaN(value) && value > 0) {
          return value;
        }
      }
    }
    return null;
  }

  private extractMinPrice(text: string): number | null {
    const patterns = [
      /(?:more than|above|over|at least|minimum|from)\s*(\d[\d\s.,]*)\s*(?:dt|tnd|dinar)?/gi,
    ];

    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match?.[1]) {
        const raw = match[1].replace(/[\s,]/g, "").replace(",", ".");
        const value = parseFloat(raw);
        if (!isNaN(value) && value > 0) {
          return value;
        }
      }
    }
    return null;
  }

  private extractBrands(text: string): string[] {
    const knownBrands = [
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
      "tplink",
      "tp-link",
      "dlink",
      "d-link",
      "benq",
      "lg",
      "viewsonic",
      "aoc",
      "apple",
      "microsoft",
    ];

    return knownBrands.filter((brand) => {
      const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?:^|\\s|,)${escapedBrand}(?:$|\\s|,|\\.)`, "i");
      return regex.test(text);
    });
  }

  private extractSearchTerms(text: string): string[] {
    const componentKeywords = [
      "gpu",
      "graphics card",
      "cpu",
      "processor",
      "ram",
      "memory",
      "ssd",
      "hdd",
      "hard drive",
      "keyboard",
      "mouse",
      "monitor",
      "screen",
      "headset",
      "speaker",
      "speakers",
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
      "gaming pc",
      "gaming laptop",
      "desktop",
      "laptop",
      "office pc",
      "workstation",
    ];

    return componentKeywords.filter((keyword) => text.includes(keyword));
  }

  private extractSortDirection(text: string): "asc" | "desc" | null {
    if (CHEAP_KEYWORDS.some((kw) => text.includes(kw))) {
      return "asc";
    }
    if (PREMIUM_KEYWORDS.some((kw) => text.includes(kw))) {
      return "desc";
    }
    return null;
  }

  async searchProducts(prompt: string): Promise<{
    products: ProductContextItem[];
    intent: ParsedIntent;
  }> {
    const intent = this.parseIntent(prompt);

    if (!intent.isProductQuery) {
      return { products: [], intent };
    }

    const whereConditions: Prisma.ProductWhereInput[] = [];

    whereConditions.push({ stock: { gt: 0 } });

    if (intent.maxPrice !== null || intent.minPrice !== null) {
      const priceFilter: Prisma.FloatFilter = {};
      if (intent.maxPrice !== null) priceFilter.lte = intent.maxPrice;
      if (intent.minPrice !== null) priceFilter.gte = intent.minPrice;
      whereConditions.push({ price: priceFilter });
    }

    if (intent.brandKeywords.length > 0) {
      whereConditions.push({
        brand: {
          name: {
            in: intent.brandKeywords,
            mode: "insensitive",
          },
        },
      });
    }

    if (intent.searchTerms.length > 0) {
      const searchOr: Prisma.ProductWhereInput[] = intent.searchTerms.flatMap(
        (term) => [
          { name: { contains: term, mode: "insensitive" as const } },
          { description: { contains: term, mode: "insensitive" as const } },
          {
            category: {
              name: { contains: term, mode: "insensitive" as const },
            },
          },
          {
            subcategory: {
              name: { contains: term, mode: "insensitive" as const },
            },
          },
        ]
      );

      whereConditions.push({ OR: searchOr });
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      intent.sortDirection
        ? { price: intent.sortDirection }
        : { createdAt: "desc" };

    try {
      const products = await prisma.product.findMany({
        where:
          whereConditions.length > 0 ? { AND: whereConditions } : undefined,
        include: {
          category: true,
          subcategory: true,
          brand: true,
        },
        orderBy,
        take: MAX_PRODUCTS_IN_CONTEXT,
      });

      const contextItems: ProductContextItem[] = products.map((product) => ({
        name: product.name,
        price: product.price,
        brand: product.brand?.name ?? null,
        category: product.category?.name ?? null,
        subcategory: product.subcategory?.name ?? null,
        description: product.description,
        stock: product.stock,
        imageUrl: product.imageUrl,
      }));

      return { products: contextItems, intent };
    } catch {
      return { products: [], intent };
    }
  }

  formatProductContext(products: ProductContextItem[]): string {
    if (products.length === 0) {
      return "No matching products were found in our store inventory.";
    }

    const lines = products.map((product, index) => {
      const parts: string[] = [
        `${index + 1}. ${product.name}`,
        `${product.price} DT`,
      ];

      if (product.brand) {
        parts.push(`Brand: ${product.brand}`);
      }

      if (product.category) {
        parts.push(`Category: ${product.category}`);
      }

      if (product.subcategory) {
        parts.push(`Subcategory: ${product.subcategory}`);
      }

      if (product.description) {
        const shortDesc =
          product.description.length > 120
            ? product.description.slice(0, 120) + "..."
            : product.description;
        parts.push(shortDesc);
      }

      parts.push(
        product.stock > 0
          ? `In stock (${product.stock} units)`
          : "Out of stock"
      );

      return parts.join(" — ");
    });

    return lines.join("\n");
  }
}

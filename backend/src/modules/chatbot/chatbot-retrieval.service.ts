import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

export class ChatbotRetrievalService {
  async searchProducts(args: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortPreference?: "price_asc" | "price_desc" | "relevance";
  }) {
    const where: Prisma.ProductWhereInput = {};

    if (args.query) {
      where.OR = [
        { name: { contains: args.query, mode: "insensitive" } },
        { description: { contains: args.query, mode: "insensitive" } },
      ];
    }
    
    if (args.category) {
      const catStr = args.category.toLowerCase();
      const keywords = [catStr];
      if (catStr.includes("cpu") || catStr.includes("processor")) keywords.push("processor", "cpu", "intel", "ryzen", "amd");
      if (catStr.includes("gpu") || catStr.includes("graphic")) keywords.push("graphic", "gpu", "rtx", "rx", "nvidia", "radeon");
      if (catStr.includes("board")) keywords.push("motherboard", "carte mere", "carte mère");
      if (catStr.includes("case") || catStr.includes("tower")) keywords.push("case", "boitier", "chassis", "tower");
      if (catStr.includes("ram") || catStr.includes("memory")) keywords.push("ram", "memory", "memoire");

      const orBlocks = keywords.flatMap(k => [
        { category: { name: { contains: k, mode: "insensitive" as const } } },
        { name: { contains: k, mode: "insensitive" as const } }
      ]);

      where.AND = [
        ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
        { OR: orBlocks }
      ];
    }
    
    if (args.minPrice !== undefined || args.maxPrice !== undefined) {
      where.price = {};
      if (args.minPrice !== undefined) where.price.gte = args.minPrice;
      if (args.maxPrice !== undefined) where.price.lte = args.maxPrice;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput | undefined;
    if (args.sortPreference === "price_asc") {
      orderBy = { price: "asc" };
    } else if (args.sortPreference === "price_desc") {
      orderBy = { price: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: 5,
      include: {
        category: true,
        brand: true,
      },
    });

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        url: `/product-page/${p.id}`,
        imageUrl: p.imageUrl || null,
        category: p.category?.name || null,
        brand: p.brand?.name || null,
        description: p.description,
        score: 1,
        matchReasons: [],
        usageTags: [],
        performanceTier: "mid",
        formFactor: null,
        popularity: 0,
      })),
      usedAiIntent: true,
    };
  }

  formatProductContext(products: any[]): string {
    if (!products || products.length === 0) {
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
          `URL: ${product.url}`
        ].filter(Boolean);

        return parts.join(" | ");
      })
      .join("\n");
  }
}

import { GenerateProductContentDto } from "./dto/generate-product-content.dto";

export class ProductContentService {
  generateDescription(input: GenerateProductContentDto): { description: string } {
    const titleParts = [input.brandName, input.name].filter(Boolean);
    const title = titleParts.length > 0 ? titleParts.join(" ") : input.name;

    const categoryLine = [input.categoryName]
      .filter(Boolean)
      .join(" > ");

    const useCase = this.getUseCase(input);
    const availability =
      input.stock == null
        ? "Availability can be updated by the store admin."
        : input.stock > 0
        ? `Currently available with ${input.stock} unit${input.stock === 1 ? "" : "s"} in stock.`
        : "Currently marked as out of stock.";

    const lines = [
      `${title} is a ${this.getProductTypeLabel(input)} built for customers who want ${useCase}.`,
      categoryLine
        ? `It belongs to the ${categoryLine} segment${input.brandName ? ` and is offered by ${input.brandName}.` : "."}`
        : input.brandName
        ? `It is offered by ${input.brandName} and fits well into a modern PC setup.`
        : "It fits well into a modern PC setup.",
      "",
      "Store information:",
      `- Product name: ${input.name}`,
      ...(input.brandName ? [`- Brand: ${input.brandName}`] : []),
      ...(input.categoryName ? [`- Category: ${input.categoryName}`] : []),
      ...(input.sku ? [`- SKU: ${input.sku}`] : []),
      ...(input.price != null ? [`- Price: ${this.formatPrice(input.price)}`] : []),
      `- Stock status: ${availability}`,
      "",
      "Recommended for:",
      `- ${this.getAudienceLabel(input)}`,
      `- ${this.getValueLabel(input)}`,
      `- ${this.getCatalogLabel(input)}`,
    ];

    return {
      description: lines.join("\n"),
    };
  }

  private getProductTypeLabel(input: GenerateProductContentDto): string {
    return (
      input.categoryName?.toLowerCase() ||
      "product"
    );
  }

  private getUseCase(input: GenerateProductContentDto): string {
    const haystack = [
      input.name,
      input.categoryName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (haystack.includes("gaming")) {
      return "smooth gaming performance and a setup-focused experience";
    }
    if (haystack.includes("monitor")) {
      return "clear visuals and comfortable everyday use";
    }
    if (haystack.includes("keyboard")) {
      return "responsive input and dependable daily use";
    }
    if (haystack.includes("mouse")) {
      return "accurate control and comfortable long sessions";
    }
    if (haystack.includes("headset")) {
      return "clear audio and comfortable extended wear";
    }
    if (haystack.includes("ssd") || haystack.includes("storage")) {
      return "fast access to files, games, and applications";
    }
    if (haystack.includes("cpu") || haystack.includes("processor")) {
      return "stable performance for gaming, work, and multitasking";
    }
    if (haystack.includes("gpu") || haystack.includes("graphics")) {
      return "strong visual performance for games and creative workloads";
    }

    return "reliable performance and good day-to-day value";
  }

  private getAudienceLabel(input: GenerateProductContentDto): string {
    const haystack = [
      input.name,
      input.categoryName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (haystack.includes("gaming")) {
      return "Gamers building or upgrading a 1080p or 1440p setup";
    }
    if (haystack.includes("office")) {
      return "Office and productivity users looking for dependable hardware";
    }
    if (haystack.includes("design") || haystack.includes("editing")) {
      return "Creative users who need dependable performance in daily workflows";
    }

    return "Customers looking for a balanced addition to their PC setup";
  }

  private getValueLabel(input: GenerateProductContentDto): string {
    if (input.price == null) {
      return "Shoppers comparing quality, compatibility, and brand preference";
    }

    if (input.price < 200) {
      return "Budget-conscious buyers who want practical value";
    }

    if (input.price < 800) {
      return "Mid-range buyers who want a strong balance between price and performance";
    }

    return "Enthusiasts looking for a more premium setup option";
  }

  private getCatalogLabel(input: GenerateProductContentDto): string {
    return `Customers browsing the catalog`;
  }

  private formatPrice(price: number): string {
    return `${price.toFixed(2)} TND`;
  }
}

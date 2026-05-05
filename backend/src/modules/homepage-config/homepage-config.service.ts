import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import {
  HomepageHeroSlideDto,
  UpdateHomepageConfigDto,
} from "./dto/update-homepage-config.dto";

const HOMEPAGE_CONFIG_SLUG = "main";

export interface HomepageHeroSlide {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
}

export const DEFAULT_HERO_SLIDES: HomepageHeroSlide[] = [
  {
    title: "Upgrade Your\nGaming Setup",
    subtitle:
      "Discover the latest GPUs, processors, and accessories at unbeatable prices.",
    buttonText: "Shop Now",
    buttonLink: "/product-page",
    imageUrl:
      "https://dlcdnwebimgs.asus.com/gain/9AC8BE01-2A3C-4E58-93E3-FD06B6B51FDF/w717/h525/q87/fwebp",
  },
  {
    title: "Next-Gen\nComponents",
    subtitle:
      "Be the first to get the latest CPUs, SSDs, and DDR5 memory kits.",
    buttonText: "Explore",
    buttonLink: "/product-page",
    imageUrl:
      "https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2505603-ryzen-9-702702-702703.jpg",
  },
];

function cloneDefaultHeroSlides(): HomepageHeroSlide[] {
  return DEFAULT_HERO_SLIDES.map((slide) => ({ ...slide }));
}

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isBuilderRelatedSlide(slide: HomepageHeroSlideDto): boolean {
  const title = toTrimmedString(slide.title).toLowerCase();
  const subtitle = toTrimmedString(slide.subtitle).toLowerCase();
  const buttonText = toTrimmedString(slide.buttonText).toLowerCase();
  const buttonLink = toTrimmedString(slide.buttonLink).toLowerCase();
  const combinedText = `${title} ${subtitle} ${buttonText}`;

  return (
    buttonLink.includes("/build-with-ai") ||
    combinedText.includes("build with ai") ||
    combinedText.includes("build it yourself") ||
    combinedText.includes("build it youself") ||
    combinedText.includes("create your own pc") ||
    combinedText.includes("dream pc")
  );
}

function isHomepageHeroSlide(value: unknown): value is HomepageHeroSlideDto {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const slide = value as Record<string, unknown>;

  return (
    toTrimmedString(slide.title).length > 0 &&
    toTrimmedString(slide.subtitle).length > 0 &&
    toTrimmedString(slide.buttonText).length > 0 &&
    toTrimmedString(slide.buttonLink).length > 0 &&
    toTrimmedString(slide.imageUrl).length > 0
  );
}

function normalizeHeroSlides(
  value: Prisma.JsonValue | HomepageHeroSlideDto[] | undefined
): HomepageHeroSlide[] {
  if (!Array.isArray(value)) {
    return cloneDefaultHeroSlides();
  }

  const slides: HomepageHeroSlide[] = [];

  for (const candidate of value as unknown[]) {
    if (!isHomepageHeroSlide(candidate)) {
      continue;
    }

    if (isBuilderRelatedSlide(candidate)) {
      continue;
    }

    slides.push({
      title: toTrimmedString(candidate.title),
      subtitle: toTrimmedString(candidate.subtitle),
      buttonText: toTrimmedString(candidate.buttonText),
      buttonLink: toTrimmedString(candidate.buttonLink),
      imageUrl: toTrimmedString(candidate.imageUrl),
    });
  }

  return slides.length > 0 ? slides : cloneDefaultHeroSlides();
}

type HomepageConfigRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.homepageConfig.findUnique>>
>;

function toStoredHeroSlides(slides: HomepageHeroSlide[]): Prisma.InputJsonValue {
  return slides as unknown as Prisma.InputJsonValue;
}

export class HomepageConfigService {
  private buildCreateData(overrides?: UpdateHomepageConfigDto) {
    return {
      slug: HOMEPAGE_CONFIG_SLUG,
      heroSlides: toStoredHeroSlides(normalizeHeroSlides(overrides?.heroSlides)),
    };
  }

  private serializeConfig(config: HomepageConfigRecord) {
    return {
      ...config,
      heroSlides: normalizeHeroSlides(config.heroSlides),
    };
  }

  async getConfig() {
    const existing = await prisma.homepageConfig.findUnique({
      where: { slug: HOMEPAGE_CONFIG_SLUG },
    });

    if (existing) {
      return this.serializeConfig(existing);
    }

    const created = await prisma.homepageConfig.create({
      data: this.buildCreateData(),
    });

    return this.serializeConfig(created);
  }

  async updateConfig(data: UpdateHomepageConfigDto) {
    const existing = await this.getConfig();
    const updated = await prisma.homepageConfig.update({
      where: { id: existing.id },
      data: {
        heroSlides: toStoredHeroSlides(normalizeHeroSlides(data.heroSlides)),
      },
    });

    return this.serializeConfig(updated);
  }
}

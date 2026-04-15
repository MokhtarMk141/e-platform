import { z } from "zod";

const optionalTrimmedString = (
  minLength: number,
  maxLength: number,
  fieldName: string
) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }, z.string().min(minLength, `${fieldName} is required`).max(maxLength).optional());

const homepageLinkSchema = optionalTrimmedString(1, 500, "Hero button link").refine(
  (value) =>
    value === undefined ||
    value.startsWith("/") ||
    /^https?:\/\//i.test(value),
  "Hero button link must be a relative path or an absolute http(s) URL"
);

const homepageImageSchema = optionalTrimmedString(1, 2000, "Hero image URL").refine(
  (value) =>
    value === undefined ||
    value.startsWith("/") ||
    /^https?:\/\//i.test(value),
  "Hero image URL must be a relative path or an absolute http(s) URL"
);

export const homepageHeroSlideSchema = z
  .object({
    title: optionalTrimmedString(1, 160, "Hero title"),
    subtitle: optionalTrimmedString(1, 500, "Hero subtitle"),
    buttonText: optionalTrimmedString(1, 60, "Hero button text"),
    buttonLink: homepageLinkSchema,
    imageUrl: homepageImageSchema,
  })
  .strict()
  .transform((slide) => ({
    title: slide.title ?? "",
    subtitle: slide.subtitle ?? "",
    buttonText: slide.buttonText ?? "",
    buttonLink: slide.buttonLink ?? "",
    imageUrl: slide.imageUrl ?? "",
  }))
  .refine(
    (slide) =>
      slide.title.length > 0 &&
      slide.subtitle.length > 0 &&
      slide.buttonText.length > 0 &&
      slide.buttonLink.length > 0 &&
      slide.imageUrl.length > 0,
    "Each hero slide must include a title, subtitle, button text, button link, and image"
  );

export const updateHomepageConfigSchema = z
  .object({
    heroSlides: z
      .array(homepageHeroSlideSchema)
      .min(1, "At least one hero slide is required")
      .max(6, "You can add up to 6 hero slides"),
  })
  .strict();

export type UpdateHomepageConfigDto = z.infer<typeof updateHomepageConfigSchema>;
export type HomepageHeroSlideDto = z.infer<typeof homepageHeroSlideSchema>;

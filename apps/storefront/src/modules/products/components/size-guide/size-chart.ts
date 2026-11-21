/**
 * The shop's size charts, kept in one place so they are easy to change.
 *
 * IMPORTANT: these are STANDARD body measurements for general clothing
 * sizes, not measurements taken from the shop's own garments. If Cody
 * measures the real pieces one day, replace the numbers below with the
 * measured ones — nothing else in the code needs to change.
 *
 * Sizes match the sizes the shop's products come in: S, M, L, XL.
 * Each value is a body-measurement range, e.g. a size M chest fits a
 * chest measuring 38–40 inches (97–102 cm) around the widest part.
 */

import { HttpTypes } from "@medusajs/types"

export type SizeChartColumn = {
  key: string
  label: string
}

export type SizeChartCell = {
  inches: string
  cm: string
}

export type SizeChartRow = {
  size: string
  cells: Record<string, SizeChartCell>
}

export type SizeChart = {
  columns: SizeChartColumn[]
  rows: SizeChartRow[]
}

const cell = (inches: string, cm: string): SizeChartCell => ({ inches, cm })

/** Tops (shirts, sweatshirts): chest, waist and length. */
export const TOPS_CHART: SizeChart = {
  columns: [
    { key: "chest", label: "Chest" },
    { key: "waist", label: "Waist" },
    { key: "length", label: "Length" },
  ],
  rows: [
    {
      size: "S",
      cells: {
        chest: cell("34–36", "86–91"),
        waist: cell("28–30", "71–76"),
        length: cell("27", "69"),
      },
    },
    {
      size: "M",
      cells: {
        chest: cell("38–40", "97–102"),
        waist: cell("32–34", "81–86"),
        length: cell("28", "71"),
      },
    },
    {
      size: "L",
      cells: {
        chest: cell("42–44", "107–112"),
        waist: cell("36–38", "91–97"),
        length: cell("29", "74"),
      },
    },
    {
      size: "XL",
      cells: {
        chest: cell("46–48", "117–122"),
        waist: cell("40–42", "102–107"),
        length: cell("30", "76"),
      },
    },
  ],
}

/**
 * Bottoms (pants, shorts): waist, hip and inseam. The hip values are
 * distinct from the chest values — hips are wider than chests at every
 * size, so a shared column would be wrong.
 */
export const BOTTOMS_CHART: SizeChart = {
  columns: [
    { key: "waist", label: "Waist" },
    { key: "hip", label: "Hip" },
    { key: "inseam", label: "Inseam" },
  ],
  rows: [
    {
      size: "S",
      cells: {
        waist: cell("28–30", "71–76"),
        hip: cell("35–37", "89–94"),
        inseam: cell("30", "76"),
      },
    },
    {
      size: "M",
      cells: {
        waist: cell("32–34", "81–86"),
        hip: cell("39–41", "99–104"),
        inseam: cell("31", "79"),
      },
    },
    {
      size: "L",
      cells: {
        waist: cell("36–38", "91–97"),
        hip: cell("43–45", "109–114"),
        inseam: cell("32", "81"),
      },
    },
    {
      size: "XL",
      cells: {
        waist: cell("40–42", "102–107"),
        hip: cell("47–49", "119–124"),
        inseam: cell("33", "84"),
      },
    },
  ],
}

export type SizeChartKind = "tops" | "bottoms"

/**
 * Which chart a product gets, from its title and handle first (e.g.
 * Medusa Shorts sits in the "Merch" category but is still a bottom),
 * then its category. Defaults to tops.
 */
export const getSizeChartKind = (
  product: HttpTypes.StoreProduct
): SizeChartKind => {
  const text = [product.title ?? "", product.handle ?? ""]
    .join(" ")
    .toLowerCase()

  if (
    text.includes("pant") ||
    text.includes("short") ||
    text.includes("skirt") ||
    text.includes("trouser") ||
    text.includes("jean")
  ) {
    return "bottoms"
  }

  if (
    text.includes("shirt") ||
    text.includes("tee") ||
    text.includes("sweatshirt") ||
    text.includes("hoodie") ||
    text.includes("jacket") ||
    text.includes("knit") ||
    text.includes("sweater")
  ) {
    return "tops"
  }

  const category = (product.categories ?? [])[0]?.name?.toLowerCase() ?? ""

  return category.includes("pant") ? "bottoms" : "tops"
}

export const getSizeChart = (product: HttpTypes.StoreProduct): SizeChart =>
  getSizeChartKind(product) === "bottoms" ? BOTTOMS_CHART : TOPS_CHART

export type MeasureStep = {
  label: string
  text: string
}

/** How to measure at home with a tape, in plain words, keyed by column. */
export const MEASURE_STEPS: Record<string, MeasureStep> = {
  chest: {
    label: "Chest",
    text: "Wrap the tape around the widest part of your chest, under your arms, keeping it level. Stand relaxed and do not pull the tape tight.",
  },
  waist: {
    label: "Waist",
    text: "Measure around your natural waist, just above your hip bones, where your body bends when you lean to the side. Keep the tape snug but not tight.",
  },
  hip: {
    label: "Hip",
    text: "Stand with your feet together and wrap the tape around the widest part of your hips and bottom.",
  },
  length: {
    label: "Length",
    text: "Measure from the highest point of your shoulder, where it meets your neck, straight down to the hem.",
  },
  inseam: {
    label: "Inseam",
    text: "Measure from the inside of your leg at the crotch straight down to your ankle — or measure a pair of trousers you like, from the crotch seam to the hem.",
  },
}

/**
 * Fit notes per product category. The shop keeps no fit data of its own,
 * so these are sensible generic notes for each type of piece — edit the
 * words here if a piece ever fits differently.
 */
export const FIT_NOTES: Record<string, string> = {
  Shirts:
    "Our shirts are cut true to size with a clean, straight fit — not slim, not boxy. If you like a looser feel, go one size up.",
  Sweatshirts:
    "Our sweatshirts have a relaxed fit with room through the body and sleeves. They are made to feel comfortable, not tight. If you are between sizes, the smaller size will still feel relaxed.",
  Pants:
    "Our pants are cut true to size with a straight leg. The waist is the best guide — if you are between sizes, size up for comfort.",
  Merch:
    "Our merch pieces have a relaxed, everyday fit. If you are between sizes, size down for a neater fit, or stay true to size for a relaxed look.",
}

export const DEFAULT_FIT_NOTE =
  "This piece is cut true to size. If you are between sizes, size up for a looser fit, or size down for a closer fit."

/** The fit note for a category name, falling back to the generic note. */
export const getFitNote = (categoryName?: string | null): string => {
  if (!categoryName) {
    return DEFAULT_FIT_NOTE
  }

  return FIT_NOTES[categoryName] ?? DEFAULT_FIT_NOTE
}

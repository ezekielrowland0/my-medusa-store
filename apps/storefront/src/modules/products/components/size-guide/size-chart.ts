/**
 * The shop's size chart, kept in one place so it is easy to change.
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

export type SizeRow = {
  size: string
  chestIn: string
  waistIn: string
  hipIn: string
  heightIn: string
  chestCm: string
  waistCm: string
  hipCm: string
  heightCm: string
}

export const SIZE_CHART: SizeRow[] = [
  {
    size: "S",
    chestIn: "34–36",
    waistIn: "28–30",
    hipIn: "34–36",
    heightIn: "66–69",
    chestCm: "86–91",
    waistCm: "71–76",
    hipCm: "86–91",
    heightCm: "168–175",
  },
  {
    size: "M",
    chestIn: "38–40",
    waistIn: "32–34",
    hipIn: "38–40",
    heightIn: "69–72",
    chestCm: "97–102",
    waistCm: "81–86",
    hipCm: "97–102",
    heightCm: "175–183",
  },
  {
    size: "L",
    chestIn: "42–44",
    waistIn: "36–38",
    hipIn: "42–44",
    heightIn: "71–74",
    chestCm: "107–112",
    waistCm: "91–97",
    hipCm: "107–112",
    heightCm: "180–188",
  },
  {
    size: "XL",
    chestIn: "46–48",
    waistIn: "40–42",
    hipIn: "46–48",
    heightIn: "72–75",
    chestCm: "117–122",
    waistCm: "102–107",
    hipCm: "117–122",
    heightCm: "183–191",
  },
]

export type MeasureStep = {
  label: string
  text: string
}

/** How to measure at home with a tape, in plain words. */
export const HOW_TO_MEASURE: MeasureStep[] = [
  {
    label: "Chest",
    text: "Wrap the tape around the widest part of your chest, under your arms, keeping it level. Stand relaxed and do not pull the tape tight.",
  },
  {
    label: "Waist",
    text: "Measure around your natural waist, just above your hip bones, where your body bends when you lean to the side. Keep the tape snug but not tight.",
  },
  {
    label: "Hip",
    text: "Stand with your feet together and wrap the tape around the widest part of your hips and bottom.",
  },
  {
    label: "Height",
    text: "Stand barefoot with your back flat against a wall, have someone mark the top of your head, then measure from the floor to the mark.",
  },
]

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

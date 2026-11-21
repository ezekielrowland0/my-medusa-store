import { HttpTypes } from "@medusajs/types"

export type SlotKind = "top" | "bottom" | "shoes" | "accessory"

export const SLOT_ORDER: SlotKind[] = ["top", "bottom", "shoes", "accessory"]

export const SLOT_LABELS: Record<SlotKind, string> = {
  top: "Top",
  bottom: "Bottom",
  shoes: "Shoes",
  accessory: "Accessory",
}

export const SLOT_PLURALS: Record<SlotKind, string> = {
  top: "tops",
  bottom: "bottoms",
  shoes: "shoes",
  accessory: "accessories",
}

export const SLOT_PICKER_COPY: Record<SlotKind, string> = {
  top: "Choose a top for your look",
  bottom: "Choose a bottom for your look",
  shoes: "Choose shoes for your look",
  accessory: "Choose an accessory for your look",
}

export const SLOT_EMPTY_COPY: Record<SlotKind, string> = {
  top: "No tops in the shop yet",
  bottom: "No bottoms in the shop yet",
  shoes: "No shoes in the shop yet",
  accessory: "No accessories in the shop yet",
}

const TOP_KEYWORDS = [
  "shirt",
  "sweatshirt",
  "top",
  "hoodie",
  "jacket",
  "knit",
  "blouse",
  "tee",
  "sweater",
  "cardigan",
]

const BOTTOM_KEYWORDS = [
  "pant",
  "short",
  "skirt",
  "trouser",
  "jean",
  "bottom",
  "legging",
]

const SHOES_KEYWORDS = [
  "shoe",
  "sneaker",
  "boot",
  "footwear",
  "sandal",
  "trainer",
  "heel",
]

const ACCESSORY_KEYWORDS = [
  "accessor",
  "bag",
  "hat",
  "cap",
  "belt",
  "scarf",
  "jewel",
  "sunglass",
  "watch",
  "sock",
]

const SLOT_KEYWORDS: { kind: SlotKind; keywords: string[] }[] = [
  { kind: "top", keywords: TOP_KEYWORDS },
  { kind: "bottom", keywords: BOTTOM_KEYWORDS },
  { kind: "shoes", keywords: SHOES_KEYWORDS },
  { kind: "accessory", keywords: ACCESSORY_KEYWORDS },
]

const matches = (text: string, keywords: string[]) => {
  const lower = text.toLowerCase()
  return keywords.some((keyword) => lower.includes(keyword))
}

/**
 * Sorts a product into one of the four outfit slots. Category names win;
 * the product title is the fallback (e.g. "Medusa Shorts" sits in the
 * "Merch" category but is still a bottom). Returns null when a product
 * fits no slot — it is simply not offered in the builder.
 */
export const classifyProduct = (
  product: HttpTypes.StoreProduct
): SlotKind | null => {
  const categoryText = (product.categories ?? [])
    .map((c) => `${c.name ?? ""} ${c.handle ?? ""}`)
    .join(" ")
  const titleText = `${product.title ?? ""} ${product.handle ?? ""}`

  for (const { kind, keywords } of SLOT_KEYWORDS) {
    if (matches(categoryText, keywords) || matches(titleText, keywords)) {
      return kind
    }
  }

  return null
}

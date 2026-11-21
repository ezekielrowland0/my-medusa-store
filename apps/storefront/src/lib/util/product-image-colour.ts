/**
 * The shop's product image filenames encode colour (tee-black-front.png,
 * tee-white-front.png, sweatshirt-vintage-front.png, sweatpants-gray-front.png,
 * shorts-vintage-front.png). No variant has images linked in the seed data
 * and only the T-Shirt has a Colour option, so the filename is the only
 * place a colour can be read for the other pieces. Nothing here is guessed
 * from outside the shop: every word below appears in the shop's own image
 * filenames.
 */

type ImageLike = {
  url?: string | null
}

/** Colour words found in the shop's image filenames, with their hex. */
const FILENAME_COLOURS: { name: string; hex: string }[] = [
  { name: "black", hex: "#1C1A17" },
  { name: "white", hex: "#FAF7F2" },
  // "gray" and "grey" are the same mid grey.
  { name: "gray", hex: "#8A8580" },
  { name: "grey", hex: "#8A8580" },
  // "vintage" is the washed dark grey of the sweatshirt and shorts photos.
  { name: "vintage", hex: "#4A4440" },
]

/**
 * Every image whose filename contains the given colour word (a
 * case-insensitive substring, e.g. White -> "white"). Empty when nothing
 * matches, so callers fall back to all images.
 */
export const imagesForColour = (
  images: ImageLike[] | null | undefined,
  colour: string
): { url?: string | null }[] => {
  const needle = colour.trim().toLowerCase()

  if (!needle) {
    return []
  }

  return (images ?? []).filter((image) =>
    (image.url ?? "").toLowerCase().includes(needle)
  )
}

/**
 * The first image whose filename contains the given colour word, or
 * undefined when no image matches.
 */
export const imageUrlForColour = (
  images: ImageLike[] | null | undefined,
  colour: string
): string | undefined =>
  imagesForColour(images, colour)[0]?.url ?? undefined

/**
 * The colour a product's photos suggest, as a hex, for pieces with no
 * Colour option. Falls back to ink when no filename carries a colour word.
 */
export const colourHexFromImageFilenames = (
  images: ImageLike[] | null | undefined
): string => {
  const haystack = (images ?? [])
    .map((image) => image.url ?? "")
    .join(" ")
    .toLowerCase()

  for (const { name, hex } of FILENAME_COLOURS) {
    if (haystack.includes(name)) {
      return hex
    }
  }

  return "#1C1A17"
}

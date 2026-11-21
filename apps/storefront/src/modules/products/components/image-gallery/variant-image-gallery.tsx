"use client"

import { HttpTypes } from "@medusajs/types"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import ImageGallery from "."
import { imagesForColour } from "@lib/util/product-image-colour"

const getImagesForVariant = (
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string,
) => {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant) {
    return product.images
  }

  if (variant.images?.length) {
    const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
    return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
  }

  // No images are linked to any variant in the seed data, so the variant's
  // own images can never match. Fall back to the colour in the image
  // filenames: the variant's Colour value (e.g. White) against the file
  // names (e.g. tee-white-front.png). When nothing matches, show all
  // images as before.
  const colourOption = product.options?.find(
    (option) => option.title?.toLowerCase() === "color"
  )
  const colourValue = variant.options?.find(
    (option) => option.option_id === colourOption?.id
  )?.value
  if (colourValue) {
    const matched = imagesForColour(product.images, colourValue)
    if (matched.length) {
      return matched as HttpTypes.StoreProductImage[]
    }
  }

  return product.images
}

/**
 * Shows the images of the variant selected with `?v_id=`. Product pages are
 * statically rendered, so the filter is only applied after hydration.
 */
const VariantImageGallery = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  const variantId = isMounted ? searchParams.get("v_id") ?? undefined : undefined
  const images = useMemo(
    () => getImagesForVariant(product, variantId) ?? [],
    [product, variantId]
  )

  // A product clip, when the merchant adds one as `video_url` in the
  // product metadata in the admin, appears as the last gallery position.
  // No video is shown when no clip exists.
  const videoUrl =
    typeof product.metadata?.video_url === "string"
      ? product.metadata.video_url
      : null

  // Reset the gallery (active image, zoom) when the variant changes, so
  // the first photo of the new colour is shown, not a leftover position.
  return (
    <ImageGallery
      key={variantId ?? "all"}
      images={images}
      videoUrl={videoUrl}
    />
  )
}

export default VariantImageGallery

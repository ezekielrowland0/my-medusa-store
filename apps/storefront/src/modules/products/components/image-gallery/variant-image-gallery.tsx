"use client"

import { HttpTypes } from "@medusajs/types"
import { displayImageUrl } from "@lib/util/product-image-colour"
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
    const selected = product.images?.filter((i) => imageIdsMap.has(i.id)) ?? []
    // The seed links every image to every variant, so a variant's own
    // images are usually the whole set and carry no colour information.
    // Only trust them when they actually narrow the set down; otherwise
    // fall through to the colour-in-filename match below.
    if (
      selected.length > 0 &&
      selected.length < (product.images?.length ?? 0)
    ) {
      return selected
    }
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

  // Preload every photo of this product — both colours — as soon as the
  // page loads, so picking another colour never leaves a blank box
  // while its photos download for the first time.
  useEffect(() => {
    ;(product.images ?? []).forEach((image) => {
      const url = displayImageUrl(image.url)
      if (url) {
        const img = new Image()
        img.src = url
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

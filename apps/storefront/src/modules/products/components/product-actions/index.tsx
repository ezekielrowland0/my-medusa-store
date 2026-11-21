"use client"

import { addToCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { useIntersection } from "@lib/hooks/use-in-view"
import { notifyCartUpdated } from "@lib/util/cart-events"
import { colourHexFromImageFilenames } from "@lib/util/product-image-colour"
import { isVariantInStock } from "@lib/util/inventory"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import ItemEmblem from "@modules/common/components/item-emblem"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Mannequin, {
  garmentKindFor,
  type WornGarment,
} from "@modules/products/components/mannequin"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import SizeGuide from "@modules/products/components/size-guide"
import { isEqual } from "lodash"
import { useParams, usePathname } from "next/navigation"
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

/**
 * The variant shown when a visitor lands on the product: size M when the
 * product comes in M (so every product starts on the same size), otherwise
 * the first in-stock variant.
 */
const getDefaultVariant = (product: HttpTypes.StoreProduct) => {
  const variants = product.variants ?? []
  const sizeOption = product.options?.find(
    (option) => option.title?.toLowerCase() === "size"
  )
  const medium =
    sizeOption &&
    variants.find(
      (variant) =>
        isVariantInStock(variant) &&
        variant.options?.some(
          (variantOption) =>
            variantOption.option_id === sizeOption.id &&
            variantOption.value === "M"
        )
    )

  return medium ?? variants.find(isVariantInStock) ?? variants[0]
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  // Preselected on the server so the form posts a valid variant without JavaScript.
  // The page is statically rendered, so `?v_id=` is applied after hydration.
  const [options, setOptions] = useState<Record<string, string | undefined>>(
    () => optionsAsKeymap(getDefaultVariant(product)?.options ?? null) ?? {}
  )
  const [isUrlVariantApplied, setIsUrlVariantApplied] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  // Brief success state + toast after an item lands in the bag.
  const [justAdded, setJustAdded] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const addedTimer = useRef<number | undefined>(undefined)
  const toastTimer = useRef<number | undefined>(undefined)

  // Clear the success timers if the component unmounts mid-animation.
  useEffect(() => {
    return () => {
      clearTimeout(addedTimer.current)
      clearTimeout(toastTimer.current)
    }
  }, [])
  const countryCode = useParams().countryCode as string

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const variantId = new URLSearchParams(window.location.search).get("v_id")
    const variant = product.variants?.find((v) => v.id === variantId)
    if (variant) {
      setOptions(optionsAsKeymap(variant.options) ?? {})
    }
    setIsUrlVariantApplied(true)
  }, [product.variants])

  useEffect(() => {
    if (!isUrlVariantApplied) {
      return
    }

    const params = new URLSearchParams(window.location.search)
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant, isUrlVariantApplied])

  const inStock = useMemo(
    () => isVariantInStock(selectedVariant),
    [selectedVariant]
  )

  // What the mannequin wears: the chosen size and colour, live.
  const optionValueByTitle = (title: string) => {
    const option = product.options?.find(
      (o) => o.title?.toLowerCase() === title.toLowerCase()
    )
    return option ? options[option.id] : undefined
  }

  const selectedSize = optionValueByTitle("Size")
  const selectedColor = optionValueByTitle("Color")
  const hasColorOption = product.options?.some(
    (option) => option.title?.toLowerCase() === "color"
  )
  // Pieces with no Colour option still have a colour to wear: read it from
  // the shop's own image filenames (e.g. sweatshirt-vintage-front.png).
  const garmentColour =
    selectedColor ?? colourHexFromImageFilenames(product.images)
  const garmentKind = garmentKindFor(product)
  const wornTop: WornGarment | null =
    garmentKind === "tshirt" || garmentKind === "sweatshirt"
      ? { kind: garmentKind, color: garmentColour }
      : null
  const wornBottom: WornGarment | null =
    garmentKind === "sweatpants" || garmentKind === "shorts"
      ? { kind: garmentKind, color: garmentColour }
      : null
  const wearingLabel = `Wearing: ${product.title}${
    selectedSize ? ` — Size ${selectedSize}` : ""
  }${selectedColor ? `, ${selectedColor}` : ""}`

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    // Don't double-add while an add or its success animation is running.
    if (isAdding || justAdded) return null

    // Sign-up gate: a visitor must have an account before adding anything
    // to the bag. The product page is statically rendered, so the login
    // state can't be baked in on the server — check it at click time.
    const customer = await retrieveCustomer().catch(() => null)
    if (!customer) {
      const returnUrl = `${window.location.pathname}${window.location.search}`
      router.push(
        `/${countryCode}/account?view=register&next=${encodeURIComponent(
          returnUrl
        )}`
      )
      return null
    }

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })
    notifyCartUpdated()

    setIsAdding(false)

    // Success animation: brass button + toast, then back to normal.
    setJustAdded(true)
    setShowToast(true)
    clearTimeout(addedTimer.current)
    clearTimeout(toastTimer.current)
    addedTimer.current = window.setTimeout(() => setJustAdded(false), 2000)
    toastTimer.current = window.setTimeout(() => setShowToast(false), 4000)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleAddToCart()
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <form
          method="post"
          action={`/${countryCode}/cart/add`}
          onSubmit={handleSubmit}
          className="flex flex-col gap-y-2"
          {...{
            toolname: "add_to_cart",
            tooldescription:
              "Add the selected product variant to the shopping cart",
          }}
        >
          <input type="hidden" name="product_id" value={product.id} />
          <input
            type="hidden"
            name="variant_id"
            value={isValidVariant ? selectedVariant?.id ?? "" : ""}
          />
          <input type="hidden" name="quantity" value="1" />
          <div>
            {(product.variants?.length ?? 0) > 1 && (
              <div className="flex flex-col gap-y-4">
                {(product.options || []).map((option) => {
                  return (
                    <div key={option.id}>
                      <OptionSelect
                        option={option}
                        current={options[option.id]}
                        updateOption={setOptionValue}
                        title={option.title ?? ""}
                        name={`options[${option.id}]`}
                        data-testid="product-options"
                        disabled={!!disabled || isAdding}
                      />
                      {option.title === "Size" && (
                        <div className="flex justify-end mt-3">
                          <SizeGuide product={product} />
                        </div>
                      )}
                    </div>
                  )
                })}
                <Divider />
              </div>
            )}
          </div>

          <ProductPrice product={product} variant={selectedVariant} />

          {selectedVariant && isValidVariant && (
            <p
              className="text-small-regular text-ui-fg-subtle"
              data-testid="product-availability"
            >
              {inStock ? "In stock" : "Out of stock"}
            </p>
          )}

          <Button
            type="submit"
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className={clx(
              "w-full h-10 btn-shine",
              justAdded && "!bg-brass !text-ivory hover:!bg-brass-light"
            )}
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {justAdded
              ? "✓ Added to your bag"
              : !selectedVariant
              ? "Select variant"
              : !inStock || !isValidVariant
              ? "Out of stock"
              : "Add to cart"}
          </Button>
        </form>
        {/* See it worn — the mannequin wears the piece as you pick it. */}
        <div
          className="mt-6 border border-stone bg-white/50 px-4 py-6"
          data-testid="see-it-worn"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.25em] text-brass">
              See it worn
            </span>
            <ItemEmblem size={24} />
          </div>
          <div
            key={selectedVariant?.id ?? product.id}
            className="animate-pop-in mt-4"
          >
            <Mannequin
              top={wornTop}
              bottom={wornBottom}
              label={wearingLabel}
            />
          </div>
          <p className="text-xs text-ui-fg-subtle text-center mt-3">
            {hasColorOption
              ? "Pick a size and colour — the mannequin updates as you choose."
              : "Pick a size — the mannequin updates as you choose."}
          </p>
        </div>
        {showToast && (
          <div
            className="fixed bottom-24 small:bottom-8 left-4 right-4 small:left-auto small:right-8 z-50 animate-toast-in"
            role="status"
            data-testid="added-to-bag-toast"
          >
            <div className="flex items-center justify-between gap-4 bg-ivory border border-stone border-l-4 border-l-brass shadow-lg px-5 py-4">
              <span className="font-display text-lg text-ink">
                Added to your bag
              </span>
              <span className="flex items-center gap-4">
                <LocalizedClientLink
                  href="/cart"
                  className="text-xs uppercase tracking-[0.2em] text-brass underline underline-offset-4 hover:text-ink"
                >
                  View bag
                </LocalizedClientLink>
                <button
                  type="button"
                  onClick={() => setShowToast(false)}
                  aria-label="Dismiss"
                  className="text-ink/60 hover:text-ink text-xl leading-none"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        )}
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}

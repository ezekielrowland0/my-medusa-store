"use client"

import { addToCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getProductPrice } from "@lib/util/get-product-price"
import { isVariantInStock } from "@lib/util/inventory"
import { convertToLocale } from "@lib/util/money"
import { notifyCartUpdated } from "@lib/util/cart-events"
import {
  colourHexFromImageFilenames,
  imageUrlForColour,
} from "@lib/util/product-image-colour"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@modules/common/components/ui"
import ItemEmblem from "@modules/common/components/item-emblem"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Mannequin, {
  garmentKindFor,
  type WornGarment,
} from "@modules/products/components/mannequin"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import Thumbnail from "@modules/products/components/thumbnail"
import { isEqual } from "lodash"
import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  SLOT_EMPTY_COPY,
  SLOT_LABELS,
  SLOT_ORDER,
  SLOT_PICKER_COPY,
  SlotKind,
  classifyProduct,
} from "../../utils/classify-product"

type SlotSelection = {
  product: HttpTypes.StoreProduct
  options: Record<string, string | undefined>
}

type AddResult = {
  added: string[]
  failed: string[]
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
 * The variant shown when a piece is picked: size M when the product comes
 * in M (so every piece starts on the same size), otherwise the first
 * in-stock variant.
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

const defaultOptionsFor = (product: HttpTypes.StoreProduct) =>
  optionsAsKeymap(getDefaultVariant(product)?.options ?? null) ?? {}

const getSelectedVariant = (selection: SlotSelection) => {
  const { product, options } = selection
  if (!product.variants || product.variants.length === 0) {
    return undefined
  }

  return product.variants.find((v) => {
    const variantOptions = optionsAsKeymap(v.options)
    return isEqual(variantOptions, options)
  })
}

const getPriceForSelection = (selection: SlotSelection) => {
  const variant = getSelectedVariant(selection)
  const { cheapestPrice, variantPrice } = getProductPrice({
    product: selection.product,
    variantId: variant?.id,
  })

  return variantPrice ?? cheapestPrice
}

const variantDescription = (variant?: HttpTypes.StoreProductVariant) =>
  (variant?.options ?? [])
    .map((o) => o.value)
    .filter(Boolean)
    .join(" / ")

const optionValueByTitle = (selection: SlotSelection, title: string) => {
  const option = selection.product.options?.find(
    (o) => o.title?.toLowerCase() === title.toLowerCase()
  )
  return option ? selection.options[option.id] : undefined
}

// The garment this slot's chosen piece becomes on the mannequin, or null
// when the slot is empty or the piece is not a top or a bottom.
const garmentForSelection = (
  selection: SlotSelection | null,
  slot: "top" | "bottom"
): WornGarment | null => {
  if (!selection) return null
  const kind = garmentKindFor(selection.product)
  if (!kind) return null
  if (slot === "top" && kind !== "tshirt" && kind !== "sweatshirt")
    return null
  if (slot === "bottom" && kind !== "sweatpants" && kind !== "shorts")
    return null
  // Pieces with no Colour option still have a colour to wear: read it from
  // the shop's own image filenames (e.g. sweatshirt-vintage-front.png).
  const color =
    optionValueByTitle(selection, "Color") ??
    colourHexFromImageFilenames(selection.product.images)
  return { kind, color }
}

type SlotCardProps = {
  slot: SlotKind
  products: HttpTypes.StoreProduct[]
  selection: SlotSelection | null
  onSelect: (product: HttpTypes.StoreProduct) => void
  onClear: () => void
  onOptionChange: (optionId: string, value: string) => void
}

const SlotCard = ({
  slot,
  products,
  selection,
  onSelect,
  onClear,
  onOptionChange,
}: SlotCardProps) => {
  const label = SLOT_LABELS[slot]

  // Honest empty state: the shop simply doesn't carry this kind of piece yet.
  if (!selection && products.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center border border-dashed border-stone bg-ivory/60 px-4 py-10 min-h-[280px]"
        data-testid={`outfit-slot-${slot}-empty`}
      >
        <span className="font-display text-xl text-ink mb-2">
          {slot === "accessory" ? "Accessories" : label}
        </span>
        <span className="text-sm text-ui-fg-subtle mb-2">
          {SLOT_EMPTY_COPY[slot]}
        </span>
        <p className="text-sm text-ui-fg-subtle max-w-[220px]">
          New pieces will appear here as they are added to the shop.
        </p>
      </div>
    )
  }

  // Picker: choose one product for this slot.
  if (!selection) {
    return (
      <div
        className="flex flex-col border border-stone bg-ivory px-4 py-6 min-h-[280px]"
        data-testid={`outfit-slot-${slot}-picker`}
      >
        <span className="font-display text-xl text-ink mb-1">{label}</span>
        <p className="text-sm text-ui-fg-subtle mb-5">
          {SLOT_PICKER_COPY[slot]}
        </p>
        <div className="flex flex-col gap-y-2">
          {products.map((product) => {
            const { cheapestPrice } = getProductPrice({ product })
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelect(product)}
                className="flex items-center justify-between gap-3 text-left border border-stone bg-white px-4 py-3 hover:border-brass transition-colors"
                data-testid={`outfit-pick-${product.handle}`}
              >
                <span className="font-display text-lg text-ink">
                  {product.title}
                </span>
                {cheapestPrice && (
                  <span className="text-sm text-ui-fg-subtle whitespace-nowrap">
                    {cheapestPrice.calculated_price}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Filled slot: the chosen piece, its variant options, and a way to swap it.
  const { product, options } = selection
  const variant = getSelectedVariant(selection)
  const price = getPriceForSelection(selection)
  const inStock = isVariantInStock(variant)
  const description = variantDescription(variant)
  // Show the photo of the colour actually chosen (e.g. the white photo
  // when White is picked), matched from the image filenames — the default
  // thumbnail is the first photo, which is the black one.
  const chosenColour = optionValueByTitle(selection, "Color")
  const colourMatchedImage = chosenColour
    ? imageUrlForColour(product.images, chosenColour)
    : undefined

  return (
    <div
      className="flex flex-col border border-stone bg-ivory"
      data-testid={`outfit-slot-${slot}-filled`}
    >
      <Thumbnail
        thumbnail={colourMatchedImage ?? product.thumbnail}
        images={product.images}
        alt={product.title}
        size="square"
        className="rounded-none shadow-none"
      />
      <div className="flex flex-col gap-y-3 px-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="block text-xs uppercase tracking-[0.2em] text-brass mb-1">
              {label}
            </span>
            <span className="flex items-center gap-x-2">
              <ItemEmblem size={22} />
              <span className="font-display text-xl text-ink">
                {product.title}
              </span>
            </span>
            {description && (
              <span className="block text-sm text-ui-fg-subtle mt-1">
                {description}
              </span>
            )}
          </div>
          {price && (
            <span className="text-sm text-ink whitespace-nowrap">
              {price.calculated_price}
            </span>
          )}
        </div>

        {(product.options ?? []).length > 0 && (
          <div className="flex flex-col gap-y-4">
            {(product.options || []).map((option) => (
              <OptionSelect
                key={option.id}
                option={option}
                current={options[option.id]}
                updateOption={onOptionChange}
                title={option.title ?? ""}
                name={`outfit-${slot}-options[${option.id}]`}
                data-testid="outfit-option"
                disabled={false}
              />
            ))}
          </div>
        )}

        {variant && !inStock && (
          <p className="text-sm text-red-600">Out of stock</p>
        )}

        <button
          type="button"
          onClick={onClear}
          className="self-start text-xs uppercase tracking-[0.2em] text-brass underline underline-offset-4 hover:text-ink"
        >
          Change {label.toLowerCase()}
        </button>
      </div>
    </div>
  )
}

export default function OutfitBuilder({
  products,
  currencyCode,
}: {
  products: HttpTypes.StoreProduct[]
  currencyCode: string
}) {
  const router = useRouter()
  const countryCode = useParams().countryCode as string

  const productsBySlot = useMemo(() => {
    const grouped: Record<SlotKind, HttpTypes.StoreProduct[]> = {
      top: [],
      bottom: [],
      shoes: [],
      accessory: [],
    }

    products.forEach((product) => {
      const slot = classifyProduct(product)
      if (slot) {
        grouped[slot].push(product)
      }
    })

    return grouped
  }, [products])

  const [selections, setSelections] = useState<
    Record<SlotKind, SlotSelection | null>
  >({
    top: null,
    bottom: null,
    shoes: null,
    accessory: null,
  })
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [addResult, setAddResult] = useState<AddResult | null>(null)

  const selectedPieces = useMemo(
    () =>
      SLOT_ORDER.map((slot) => ({ slot, selection: selections[slot] })).filter(
        (entry): entry is { slot: SlotKind; selection: SlotSelection } =>
          entry.selection !== null
      ),
    [selections]
  )

  const total = useMemo(
    () =>
      selectedPieces.reduce(
        (sum, { selection }) =>
          sum + (getPriceForSelection(selection)?.calculated_price_number ?? 0),
        0
      ),
    [selectedPieces]
  )

  const totalLabel = convertToLocale({
    amount: total,
    currency_code: currencyCode,
  })

  const hasEmptySlotsWithNoProducts = SLOT_ORDER.some(
    (slot) => productsBySlot[slot].length === 0
  )

  // The mannequin wears the whole chosen look: top + bottom together.
  const lookTop = garmentForSelection(selections.top, "top")
  const lookBottom = garmentForSelection(selections.bottom, "bottom")
  const lookLabel =
    selectedPieces.length === 0
      ? "Pick pieces below to dress the mannequin"
      : `Wearing: ${selectedPieces
          .map(
            ({ selection }) =>
              `${selection.product.title} (${variantDescription(
                getSelectedVariant(selection)
              )})`
          )
          .join(", ")}`

  const selectProduct = (slot: SlotKind, product: HttpTypes.StoreProduct) => {
    setAddResult(null)
    setJustAdded(false)
    setSelections((prev) => ({
      ...prev,
      [slot]: { product, options: defaultOptionsFor(product) },
    }))
  }

  const clearSlot = (slot: SlotKind) => {
    setAddResult(null)
    setJustAdded(false)
    setSelections((prev) => ({ ...prev, [slot]: null }))
  }

  const updateSlotOption =
    (slot: SlotKind) => (optionId: string, value: string) => {
      setAddResult(null)
      setJustAdded(false)
      setSelections((prev) => {
        const current = prev[slot]
        if (!current) return prev
        return {
          ...prev,
          [slot]: {
            ...current,
            options: { ...current.options, [optionId]: value },
          },
        }
      })
    }

  // Add every chosen piece to the bag in one go. Empty slots are skipped —
  // a look with only a top and bottom still adds those two pieces.
  const handleAddLook = async () => {
    if (isAdding || selectedPieces.length === 0) return

    // Sign-up gate, same as the product page: a visitor must have an
    // account before anything goes in the bag.
    const customer = await retrieveCustomer().catch(() => null)
    if (!customer) {
      const returnUrl = `${window.location.pathname}${window.location.search}`
      router.push(
        `/${countryCode}/account?view=register&next=${encodeURIComponent(
          returnUrl
        )}`
      )
      return
    }

    setIsAdding(true)
    setAddResult(null)
    setJustAdded(false)

    const added: string[] = []
    const failed: string[] = []

    for (const { selection } of selectedPieces) {
      const variant = getSelectedVariant(selection)
      if (!variant?.id || !isVariantInStock(variant)) {
        failed.push(selection.product.title)
        continue
      }

      try {
        await addToCart({
          variantId: variant.id,
          quantity: 1,
          countryCode,
        })
        added.push(selection.product.title)
      } catch {
        failed.push(selection.product.title)
      }
    }

    if (added.length > 0) {
      notifyCartUpdated()
      setJustAdded(true)
    }

    setIsAdding(false)
    setAddResult({ added, failed })
  }

  return (
    <div className="content-container py-12" data-testid="outfit-builder">
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-[0.3em] text-brass">
          Build a Look
        </span>
        <h1 className="font-display text-4xl small:text-5xl text-ink mt-3">
          Build your look
        </h1>
        <p className="text-ui-fg-subtle mt-4 max-w-lg mx-auto">
          Pick a top and a bottom. Swap any piece without starting over —
          your other choices stay put.
        </p>
      </div>

      {/* The mannequin wears the whole look as you build it. */}
      <div
        className="mb-10 border border-stone bg-white/50 px-6 py-8 flex flex-col small:flex-row items-center gap-8"
        data-testid="outfit-mannequin"
      >
        <div
          key={`${selections.top?.product.id ?? "none"}-${selections.bottom?.product.id ?? "none"}`}
          className="animate-pop-in shrink-0"
        >
          <Mannequin top={lookTop} bottom={lookBottom} label={lookLabel} />
        </div>
        <div className="text-center small:text-left">
          <span className="text-xs uppercase tracking-[0.25em] text-brass">
            Your look
          </span>
          <p className="font-display text-3xl text-ink mt-2">
            {selectedPieces.length === 0
              ? "Start with a top and a bottom"
              : `${selectedPieces.length} piece${
                  selectedPieces.length > 1 ? "s" : ""
                } in your look`}
          </p>
          <p className="font-display text-2xl text-brass mt-2">
            Total: {totalLabel}
          </p>
          <p className="text-sm text-ui-fg-subtle mt-3">
            Pick pieces below — the mannequin wears them as you choose.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-4 gap-6">
        {SLOT_ORDER.map((slot) => (
          <SlotCard
            key={slot}
            slot={slot}
            products={productsBySlot[slot]}
            selection={selections[slot]}
            onSelect={(product) => selectProduct(slot, product)}
            onClear={() => clearSlot(slot)}
            onOptionChange={updateSlotOption(slot)}
          />
        ))}
      </div>

      <div className="mt-10 border border-stone bg-ivory px-6 py-8">
        <div className="flex flex-col small:flex-row small:items-center small:justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-ui-fg-subtle">
              {selectedPieces.length === 0
                ? "No pieces chosen yet"
                : `${selectedPieces.length} piece${
                    selectedPieces.length > 1 ? "s" : ""
                  } in your look`}
            </span>
            <p className="font-display text-3xl text-ink mt-2">
              Total: {totalLabel}
            </p>
            {hasEmptySlotsWithNoProducts && (
              <p className="text-sm text-ui-fg-subtle mt-2">
                Your look includes the pieces you have chosen. Shoes and
                accessories are not in the shop yet.
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleAddLook}
            disabled={selectedPieces.length === 0 || isAdding}
            isLoading={isAdding}
            className={clx(
              "w-full small:w-auto h-12 px-8 btn-shine",
              justAdded && "!bg-brass !text-ivory hover:!bg-brass-light"
            )}
            data-testid="add-look-button"
          >
            {justAdded
              ? "✓ Added to your bag"
              : selectedPieces.length === 0
              ? "Add Look to Cart"
              : `Add Look to Cart · ${totalLabel}`}
          </Button>
        </div>

        {addResult && addResult.added.length > 0 && (
          <div
            className="mt-6 border border-stone border-l-4 border-l-brass bg-white px-5 py-4"
            role="status"
            data-testid="look-added-notice"
          >
            <p className="font-display text-lg text-ink">
              Added to your bag: {addResult.added.join(", ")}
            </p>
            <LocalizedClientLink
              href="/cart"
              className="inline-block mt-2 text-xs uppercase tracking-[0.2em] text-brass underline underline-offset-4 hover:text-ink"
            >
              View bag
            </LocalizedClientLink>
          </div>
        )}

        {addResult && addResult.failed.length > 0 && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            Couldn&apos;t add: {addResult.failed.join(", ")} — out of stock or
            unavailable right now.
          </p>
        )}
      </div>
    </div>
  )
}

"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import ItemEmblem from "@modules/common/components/item-emblem"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
  /**
   * On-hand stock for this variant, when the store reports it.
   * Left undefined when the stock count is unknown — no badge is shown then.
   */
  inventoryQuantity?: number
}

// Display colours for the colour names the shop sells. Unknown colours
// fall back to a text label with no swatch.
const COLOR_HEX: Record<string, string> = {
  black: "#1C1A17",
  white: "#FAF7F2",
  red: "#B91C1C",
  blue: "#1D4ED8",
  navy: "#1E3A5F",
  green: "#15803D",
  grey: "#6B7280",
  gray: "#6B7280",
  brown: "#78350F",
  beige: "#E7E0D4",
  pink: "#EC4899",
  yellow: "#EAB308",
  purple: "#7E22CE",
  orange: "#EA580C",
}

const LOW_STOCK_THRESHOLD = 5

const Item = ({
  item,
  type = "full",
  currencyCode,
  inventoryQuantity,
}: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // The chosen size and colour, in order of reliability: the option values
  // stored on the line item, then the variant's options, then the variant
  // title ("S / Black").
  const getOptionValue = (names: string[]) => {
    const lineValues = (item.variant_option_values ?? {}) as Record<
      string,
      unknown
    >

    for (const name of names) {
      const lineValue = lineValues[name]
      if (typeof lineValue === "string" && lineValue) {
        return lineValue
      }

      const variantOption = item.variant?.options?.find(
        (option) =>
          option.option?.title?.toLowerCase() === name.toLowerCase()
      )
      if (variantOption?.value) {
        return variantOption.value
      }
    }

    return undefined
  }

  let size = getOptionValue(["Size"])
  let color = getOptionValue(["Color", "Colour"])

  if (!size || !color) {
    const titleParts = (item.variant?.title ?? "")
      .split(" / ")
      .map((part) => part.trim())
      .filter(Boolean)
    if (!size && titleParts[0]) {
      size = titleParts[0]
    }
    if (!color && titleParts[1]) {
      color = titleParts[1]
    }
  }

  const colorHex = color ? COLOR_HEX[color.toLowerCase()] : undefined

  // Low stock is only shown when the shop reports a real count for a
  // stock-managed variant that cannot be backordered. 5 or fewer units
  // left counts as low; 0 means it is gone.
  const managesInventory = !!item.variant?.manage_inventory
  const allowBackorder = !!item.variant?.allow_backorder
  const hasStockCount = typeof inventoryQuantity === "number"
  const isOutOfStock =
    hasStockCount && managesInventory && !allowBackorder && inventoryQuantity === 0
  const isLowStock =
    hasStockCount &&
    managesInventory &&
    !allowBackorder &&
    inventoryQuantity! > 0 &&
    inventoryQuantity! <= LOW_STOCK_THRESHOLD

  // Never offer more than the shop actually has, but always keep the
  // quantity already in the bag selectable.
  const maxQuantity = managesInventory && hasStockCount && !allowBackorder
    ? Math.min(Math.max(inventoryQuantity!, item.quantity), 10)
    : 10

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <span className="flex items-center gap-x-2">
          <ItemEmblem size={20} />
          <Text
            className="txt-medium-plus text-ui-fg-base"
            data-testid="product-title"
          >
            {item.product_title}
          </Text>
        </span>
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1"
          data-testid="product-variant"
        >
          {size && (
            <Text className="txt-medium text-ui-fg-subtle">
              Size: {size}
            </Text>
          )}
          {color && (
            <span className="flex items-center gap-x-1.5">
              {colorHex && (
                <span
                  className="inline-block h-4 w-4 rounded-full border border-black/10"
                  style={{ backgroundColor: colorHex }}
                  aria-hidden="true"
                />
              )}
              <Text className="txt-medium text-ui-fg-subtle">
                Colour: {color}
              </Text>
            </span>
          )}
          {!size && !color && (
            <Text className="txt-medium text-ui-fg-subtle">
              Variant: {item.variant?.title}
            </Text>
          )}
        </div>
        {(isLowStock || isOutOfStock) && (
          <span className="inline-flex items-center rounded-full border border-[#E5C97A] bg-[#FDF6E3] px-2 py-0.5 mt-2 text-xs font-medium text-[#7C5A10]">
            {isOutOfStock
              ? "Out of stock"
              : `Only ${inventoryQuantity} left — low stock`}
          </span>
        )}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-14 h-10 p-4"
              data-testid="product-select-button"
            >
              {Array.from(
                {
                  length: Math.min(maxQuantity, 10),
                },
                (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                )
              )}

              <option value={1} key={1}>
                1
              </option>
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item

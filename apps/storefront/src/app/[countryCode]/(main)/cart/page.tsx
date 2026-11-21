import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import CartTemplate from "@modules/cart/templates"
import { HttpTypes } from "@medusajs/types"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

/**
 * Builds a variant id -> on-hand stock map for the variants in the cart.
 * Uses listProducts, which already requests +variants.inventory_quantity,
 * instead of changing the cart fetch fields. Variants with no reported
 * stock are left out of the map.
 */
async function getInventoryByVariant(
  cart: HttpTypes.StoreCart | null,
  countryCode: string
): Promise<Record<string, number>> {
  const productIds = Array.from(
    new Set(
      (cart?.items ?? [])
        .map((item) => item.product_id)
        .filter((id): id is string => Boolean(id))
    )
  )

  if (!productIds.length) {
    return {}
  }

  const products = await listProducts({
    countryCode,
    queryParams: { id: productIds, limit: 100 },
  })
    .then(({ response }) => response.products)
    .catch(() => [])

  const inventoryByVariant: Record<string, number> = {}

  for (const product of products) {
    for (const variant of product.variants ?? []) {
      if (variant.id && typeof variant.inventory_quantity === "number") {
        inventoryByVariant[variant.id] = variant.inventory_quantity
      }
    }
  }

  return inventoryByVariant
}

export default async function Cart({ params }: Props) {
  const { countryCode } = await params

  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()

  const inventoryByVariant = await getInventoryByVariant(cart, countryCode)

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      countryCode={countryCode}
      inventoryByVariant={inventoryByVariant}
    />
  )
}

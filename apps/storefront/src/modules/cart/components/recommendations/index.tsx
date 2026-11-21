import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"

type CartRecommendationsProps = {
  cart: HttpTypes.StoreCart
  countryCode: string
}

const LIMIT = 4

export default async function CartRecommendations({
  cart,
  countryCode,
}: CartRecommendationsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const cartProductIds = Array.from(
    new Set(
      (cart.items ?? [])
        .map((item) => item.product_id)
        .filter((id): id is string => Boolean(id))
    )
  )

  if (!cartProductIds.length) {
    return null
  }

  const isNotInCart = (product: HttpTypes.StoreProduct) =>
    !cartProductIds.includes(product.id!)

  const fetchProducts = async (
    queryParams: HttpTypes.StoreProductListParams & { fields?: string }
  ) =>
    listProducts({ countryCode, queryParams })
      .then(({ response }) => response.products)
      .catch(() => [])

  // First try: other products in the same categories as the items in the bag.
  let products: HttpTypes.StoreProduct[] = []

  const cartProducts = await fetchProducts({
    id: cartProductIds,
    limit: 100,
    fields:
      "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,*categories",
  })

  const categoryIds = Array.from(
    new Set(
      cartProducts
        .flatMap((product) => (product.categories ?? []).map((c) => c.id))
        .filter((id): id is string => Boolean(id))
    )
  )

  if (categoryIds.length) {
    products = (await fetchProducts({ category_id: categoryIds, limit: 8 }))
      .filter(isNotInCart)
      .slice(0, LIMIT)
  }

  // Fallback: the shop's other products. With the current catalogue each
  // category holds a single product, so same-category matches are usually
  // empty and this is what actually serves the row.
  if (!products.length) {
    products = (await fetchProducts({ limit: 8 }))
      .filter(isNotInCart)
      .slice(0, LIMIT)
  }

  if (!products.length) {
    return null
  }

  return (
    <div className="mt-16 small:mt-24">
      <div className="flex flex-col gap-y-2 mb-8">
        <h2 className="font-display text-2xl small:text-3xl text-ink">
          You might also love
        </h2>
        <p className="txt-medium text-ui-fg-subtle">
          More pieces from the boutique to complete your bag.
        </p>
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-8">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview region={region} product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}

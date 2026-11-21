import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import Reveal from "@modules/common/components/reveal"
import ProductPreview from "@modules/products/components/product-preview"

/**
 * The shop's products as a grid on the home page. Used when the shop has
 * no collections yet — the collection rails in FeaturedProducts render
 * nothing without a collection, which left the home page with an empty
 * band where the products should be.
 */
export default async function ProductGrid({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts?.length) {
    return null
  }

  return (
    <div className="content-container py-16 small:py-32">
      <Reveal>
        <div className="flex justify-between mb-12">
          <Text className="txt-xlarge font-display text-ink">
            Shop the collection
          </Text>
          <InteractiveLink href="/store">View all</InteractiveLink>
        </div>
      </Reveal>
      <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-10 gap-y-28 small:gap-y-36">
        {pricedProducts.map((product, index) => (
          <li key={product.id}>
            <Reveal delay={Math.min(index, 5) * 90}>
              <ProductPreview product={product} region={region} isFeatured />
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  )
}

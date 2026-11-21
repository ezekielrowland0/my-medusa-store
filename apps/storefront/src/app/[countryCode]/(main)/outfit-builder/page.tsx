import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import OutfitBuilder from "@modules/outfit-builder/components/outfit-builder"

export const metadata: Metadata = {
  title: "Build a Look",
  description:
    "Mix and match a top, bottom, shoes and accessory into one complete look.",
}

export default async function OutfitBuilderPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const { response } = await listProducts({
    queryParams: { limit: 100 },
    countryCode,
  })

  return (
    <OutfitBuilder
      products={response.products}
      currencyCode={region.currency_code}
    />
  )
}

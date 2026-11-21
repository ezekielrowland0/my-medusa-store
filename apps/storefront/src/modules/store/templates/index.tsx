"use client"

import type { SearchClient } from "instantsearch.js"
import { Configure, InstantSearch } from "react-instantsearch"

import { PRODUCT_INDEX_NAME, searchClient } from "@lib/search-client"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MobileFilterSheet from "@modules/store/components/mobile-filter-sheet"
import StoreHits from "@modules/store/components/store-hits"
import StoreRefinements from "@modules/store/components/store-refinements"
import StoreSearchBox from "@modules/store/components/store-search-box"

const PRODUCT_LIMIT = 12

const StoreTemplate = ({ currencyCode }: { currencyCode: string }) => {
  return (
    <div className="py-6 content-container" data-testid="category-container">
      <div className="mb-8 text-2xl-semi">
        <h1 data-testid="store-page-title">All products</h1>
        <LocalizedClientLink
          href="/outfit-builder"
          className="block mt-3 text-base font-sans text-brass underline underline-offset-4 hover:text-ink"
        >
          Build a Look — mix a top and a bottom into one outfit
        </LocalizedClientLink>
      </div>

      <div className="flex flex-col small:flex-row small:items-start">
        <InstantSearch
          indexName={PRODUCT_INDEX_NAME}
          searchClient={searchClient as unknown as SearchClient}
          routing
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <Configure hitsPerPage={PRODUCT_LIMIT} />
          <div className="hidden small:block small:shrink-0">
            <StoreRefinements currencyCode={currencyCode} />
          </div>
          <div className="w-full min-w-0">
            <MobileFilterSheet currencyCode={currencyCode} />
            <StoreSearchBox />
            <StoreHits
              hitsPerPage={PRODUCT_LIMIT}
              currencyCode={currencyCode}
            />
          </div>
        </InstantSearch>
      </div>
    </div>
  )
}

export default StoreTemplate

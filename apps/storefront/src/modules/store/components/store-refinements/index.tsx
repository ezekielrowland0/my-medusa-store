"use client"

import { useClearRefinements, useSortBy } from "react-instantsearch"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import {
  CATEGORY_ATTRIBUTE,
  LABELS_ATTRIBUTE,
  getSortOptions,
} from "./attributes"
import CurrentRefinements from "./current-refinements"
import OnSaleToggle from "./on-sale-toggle"
import OptionRefinements from "./option-refinements"
import PriceRange from "./price-range"
import RefinementGroup from "./refinement-group"

const SortProducts = ({ currencyCode }: { currencyCode: string }) => {
  const items = getSortOptions(currencyCode)
  const { currentRefinement, refine } = useSortBy({ items })

  return (
    <FilterRadioGroup
      title="Sort by"
      items={items}
      value={currentRefinement}
      handleChange={refine}
      data-testid="sort-by-container"
    />
  )
}

/**
 * Always visible at the top of the filter panel. It resets every active
 * refinement (sort and the free-text query are left alone) and is disabled
 * while there is nothing to clear, so the button never vanishes on the
 * visitor.
 */
const ClearAllFilters = () => {
  const { canRefine, refine } = useClearRefinements()

  return (
    <button
      type="button"
      onClick={refine}
      disabled={!canRefine}
      className="txt-compact-small-plus w-fit uppercase tracking-[0.15em] text-brass transition-colors duration-150 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      data-testid="clear-all-filters"
    >
      Clear All Filters
    </button>
  )
}

const StoreRefinements = ({
  currencyCode,
  className,
}: {
  currencyCode: string
  className?: string
}) => {
  return (
    <div
      className={
        className ??
        "flex flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:w-[250px] small:shrink-0 small:ml-[1.675rem]"
      }
    >
      <ClearAllFilters />
      <SortProducts currencyCode={currencyCode} />
      <CurrentRefinements currencyCode={currencyCode} />
      <OptionRefinements />
      <PriceRange currencyCode={currencyCode} />
      <OnSaleToggle currencyCode={currencyCode} />
      <RefinementGroup attribute={CATEGORY_ATTRIBUTE} title="Category" />
      <RefinementGroup attribute={LABELS_ATTRIBUTE} title="Labels" />
    </div>
  )
}

export default StoreRefinements

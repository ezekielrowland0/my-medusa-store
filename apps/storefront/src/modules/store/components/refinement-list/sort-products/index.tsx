"use client"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"

export type SortOptions =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "created_at"
  | "title_asc"
  | "title_desc"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

// The same sort list as the Store page, in the same order and words.
const sortOptions = [
  {
    value: "relevance",
    label: "Relevance",
  },
  {
    value: "created_at",
    label: "Newest first",
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
  },
  {
    value: "title_asc",
    label: "Title: A -> Z",
  },
  {
    value: "title_desc",
    label: "Title: Z -> A",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const handleChange = (value: string) => {
    setQueryParams("sortBy", value as SortOptions)
  }

  return (
    <FilterRadioGroup
      title="Sort by"
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts

"use client"

import { XMarkMini } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { useCurrentRefinements } from "react-instantsearch"

import { priceAttribute } from "@lib/search-client"
import StoreRefinements from "@modules/store/components/store-refinements"

/**
 * On small screens the filter sidebar collapses into a bottom sheet. The
 * trigger button shows how many filters are active (a price range counts as
 * one, however many bounds it refines). On desktop (`small:` and up) the
 * sidebar shows instead and this renders nothing visible.
 */
const MobileFilterSheet = ({ currencyCode }: { currencyCode: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { items } = useCurrentRefinements()

  const priceAttr = priceAttribute("min_price", currencyCode)
  const activeCount = items.reduce((sum, item) => {
    if (item.attribute === priceAttr) {
      return sum + (item.refinements.length ? 1 : 0)
    }

    return sum + item.refinements.length
  }, 0)

  // Lock the page behind the sheet, and let Escape close it.
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  return (
    <div className="mb-6 small:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-filter-sheet"
        className="flex w-full items-center justify-between border border-brass bg-ivory px-4 py-3 transition-colors duration-150 hover:border-ink"
        data-testid="mobile-filters-button"
      >
        <span className="txt-compact-small-plus uppercase tracking-[0.15em] text-ink">
          Filters
        </span>
        {activeCount > 0 && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brass px-2 text-small-regular text-ivory">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="mobile-filter-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className="fixed inset-0 z-50 small:hidden"
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setIsOpen(false)}
            className="animate-fade-in absolute inset-0 bg-ink/40"
          />
          <div className="animate-sheet-up absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-ivory shadow-elevation-card-hover">
            <div className="flex shrink-0 items-center justify-between border-b border-stone px-6 py-4">
              <span className="font-display text-xl text-ink">
                Filters
                {activeCount > 0 && (
                  <span className="ml-2 text-small-regular text-brass">
                    ({activeCount} active)
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center text-ink transition-colors hover:text-brass"
              >
                <XMarkMini />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <StoreRefinements
                currencyCode={currencyCode}
                className="flex flex-col gap-12 px-6 py-4"
              />
            </div>

            <div className="shrink-0 border-t border-stone px-6 py-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="contrast-btn w-full"
                data-testid="mobile-filters-show-results"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileFilterSheet

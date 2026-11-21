"use client"

import { useEffect, useState } from "react"

import { HttpTypes } from "@medusajs/types"
import {
  MEASURE_STEPS,
  getFitNote,
  getSizeChart,
} from "@modules/products/components/size-guide/size-chart"

type SizeGuideProps = {
  /** The product, used to pick the right chart (tops or bottoms) and the fit note. */
  product: HttpTypes.StoreProduct
}

/** One measurement cell: inches on top, centimetres below. */
const MeasureCell = ({ inches, cm }: { inches: string; cm: string }) => (
  <td className="px-2 py-3 text-center align-top">
    <span className="block text-sm text-ink whitespace-nowrap">
      {inches} in
    </span>
    <span className="block text-xs text-ink/50 whitespace-nowrap">
      {cm} cm
    </span>
  </td>
)

/**
 * "Size Guide" link plus the modal it opens. The link sits next to the
 * size selector on a product page; the modal shows the measurement table
 * (inches and centimetres), how to measure at home, and a fit note for
 * the product's category.
 */
const SizeGuide = ({ product }: SizeGuideProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const categoryName = product.categories?.[0]?.name
  const chart = getSizeChart(product)

  // Lock the page behind the modal, and let Escape close it.
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
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="size-guide-modal"
        className="text-xs uppercase tracking-[0.2em] text-brass underline underline-offset-4 hover:text-ink transition-colors"
        data-testid="size-guide-button"
      >
        Size Guide
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-end small:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
          data-testid="size-guide-modal"
        >
          <div
            className="absolute inset-0 bg-ink/60 animate-fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full small:max-w-xl bg-ivory shadow-xl max-h-[88vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone">
              <h2 className="font-display text-3xl text-ink">Size Guide</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close size guide"
                className="flex items-center justify-center w-11 h-11 text-ink/60 hover:text-ink text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-6 flex flex-col gap-y-8">
              <p className="text-sm text-ink/70 leading-relaxed">
                Find your size from your body measurements. If you are
                between sizes, size up for a looser fit or down for a
                closer fit.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-brass">
                      <th className="px-2 py-3 text-left text-xs uppercase tracking-[0.15em] text-ink/60 font-normal">
                        Size
                      </th>
                      {chart.columns.map((column) => (
                        <th
                          key={column.key}
                          className="px-2 py-3 text-center text-xs uppercase tracking-[0.15em] text-ink/60 font-normal"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.rows.map((row) => (
                      <tr key={row.size} className="border-b border-stone">
                        <td className="px-2 py-3 font-display text-lg text-ink">
                          {row.size}
                        </td>
                        {chart.columns.map((column) => {
                          const cell = row.cells[column.key]

                          return cell ? (
                            <MeasureCell
                              key={column.key}
                              inches={cell.inches}
                              cm={cell.cm}
                            />
                          ) : null
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-display text-xl text-ink mb-3">
                  How to measure at home
                </h3>
                <p className="text-sm text-ink/70 leading-relaxed mb-4">
                  All you need is a soft tape measure and a mirror. Measure
                  over light clothing, and keep the tape level.
                </p>
                <ul className="flex flex-col gap-y-3">
                  {chart.columns.map((column) => {
                    const step = MEASURE_STEPS[column.key]

                    return step ? (
                      <li
                        key={column.key}
                        className="text-sm leading-relaxed"
                      >
                        <span className="text-ink font-medium">
                          {step.label}:{" "}
                        </span>
                        <span className="text-ink/70">{step.text}</span>
                      </li>
                    ) : null
                  })}
                </ul>
              </div>

              <div className="border-l-2 border-brass bg-ivory px-4 py-4">
                <h3 className="text-xs uppercase tracking-[0.2em] text-brass mb-2">
                  Fit note
                  {categoryName ? ` — ${categoryName}` : ""}
                </h3>
                <p className="text-sm text-ink/80 leading-relaxed">
                  {getFitNote(categoryName)}
                </p>
              </div>

              <p className="text-xs text-ink/50 leading-relaxed">
                These are standard body measurements, not measurements taken
                from the shop&apos;s own garments. When in doubt, the chest
                measurement is the best guide for tops, and the waist is
                the best guide for bottoms.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SizeGuide

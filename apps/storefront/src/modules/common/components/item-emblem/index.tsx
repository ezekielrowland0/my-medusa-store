import { clx } from "@modules/common/components/ui"

type ItemEmblemProps = {
  /** Diameter in pixels. */
  size?: number
  className?: string
}

/**
 * The mark of the shop: a small brass medallion, a thin brass ring with
 * a serif "M" inside, and a slow shine that sweeps across it.
 * Pure CSS — no image, no font file beyond the display serif already loaded.
 */
export default function ItemEmblem({ size = 26, className }: ItemEmblemProps) {
  return (
    <span
      aria-hidden="true"
      className={clx(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-brass bg-ivory",
        className
      )}
      style={{ width: size, height: size }}
    >
      <span
        className="font-display leading-none text-brass"
        style={{ fontSize: size * 0.58 }}
      >
        M
      </span>
      <span className="emblem-shine" />
    </span>
  )
}

import { HttpTypes } from "@medusajs/types"

export type GarmentKind = "tshirt" | "sweatshirt" | "sweatpants" | "shorts"

export type WornGarment = {
  kind: GarmentKind
  /** The real colour name from the product data, e.g. "Black". */
  color: string
}

const FIGURE_FILL = "#DCD2BF"
const INK = "#1C1A17"

/**
 * The only colours the shop actually sells (see the seed data in
 * apps/backend/src/migration-scripts/initial-data-seed.ts: Black, White).
 * Anything else falls back to ink, so the mannequin never shows a colour
 * the shop does not sell.
 */
export const colourToHex = (name?: string | null) => {
  const lower = (name ?? "").trim().toLowerCase()
  if (lower === "black") return "#1C1A17"
  if (lower === "white") return "#FAF7F2"
  return "#1C1A17"
}

/**
 * Works out which garment shape a product is, from its title, handle and
 * categories. Returns null for a product that is not a top or a bottom —
 * the mannequin simply stays bare for that piece.
 */
export const garmentKindFor = (
  product: HttpTypes.StoreProduct
): GarmentKind | null => {
  const text = [
    product.title ?? "",
    product.handle ?? "",
    ...(product.categories ?? []).map((c) => c.name ?? ""),
  ]
    .join(" ")
    .toLowerCase()

  if (text.includes("sweatshirt")) return "sweatshirt"
  if (text.includes("sweatpant") || text.includes("pant")) return "sweatpants"
  if (text.includes("short")) return "shorts"
  if (text.includes("t-shirt") || text.includes("tee") || text.includes("shirt"))
    return "tshirt"
  return null
}

type MannequinProps = {
  top?: WornGarment | null
  bottom?: WornGarment | null
  /** e.g. "Wearing: Medusa T-Shirt — Size M, Black". */
  label?: string
  className?: string
}

/**
 * A stylised flat fashion-illustration mannequin in a neutral stone tone,
 * standing on a small plinth. Garment layers drawn over the figure follow
 * the chosen pieces: short-sleeve tee, long-sleeve sweatshirt, long
 * sweatpants, or shorts, each filled with the real variant colour.
 * Colour changes glide (CSS transition on fill). Size never changes the
 * figure — it only shows in the label underneath.
 */
export default function Mannequin({
  top,
  bottom,
  label,
  className,
}: MannequinProps) {
  const topFill = top ? colourToHex(top.color) : undefined
  const bottomFill = bottom ? colourToHex(bottom.color) : undefined

  return (
    <div className={className}>
      <svg
        viewBox="0 0 220 460"
        role="img"
        aria-label={label ?? "Mannequin"}
        className="w-full max-w-[220px] mx-auto"
      >
        {/* Soft shadow and plinth */}
        <ellipse cx="110" cy="440" rx="62" ry="9" fill={INK} opacity="0.08" />
        <rect
          x="55"
          y="430"
          width="110"
          height="7"
          rx="3"
          fill="#E7E0D4"
          stroke={INK}
          strokeWidth="1"
        />
        {/* Faint brass ring behind the figure */}
        <circle
          cx="110"
          cy="225"
          r="100"
          fill="none"
          stroke="#A67C37"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Figure — head, neck, torso, arms, legs */}
        <circle cx="110" cy="36" r="16" fill={FIGURE_FILL} stroke={INK} strokeWidth="1.2" />
        <path d="M103 50 h14 v14 h-14 z" fill={FIGURE_FILL} stroke={INK} strokeWidth="1.2" />
        <path
          d="M82 74 C92 66 128 66 138 74 L140 128 C141 150 138 168 134 178 L86 178 C82 168 79 150 80 128 Z"
          fill={FIGURE_FILL}
          stroke={INK}
          strokeWidth="1.2"
        />
        {/* Arms: a wider ink stroke underneath gives the stone stroke its outline */}
        <path
          d="M84 80 C72 92 68 128 67 164 C66 182 66 196 67 206"
          fill="none"
          stroke={INK}
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M84 80 C72 92 68 128 67 164 C66 182 66 196 67 206"
          fill="none"
          stroke={FIGURE_FILL}
          strokeWidth="12.5"
          strokeLinecap="round"
        />
        <path
          d="M136 80 C148 92 152 128 153 164 C154 182 154 196 153 206"
          fill="none"
          stroke={INK}
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M136 80 C148 92 152 128 153 164 C154 182 154 196 153 206"
          fill="none"
          stroke={FIGURE_FILL}
          strokeWidth="12.5"
          strokeLinecap="round"
        />
        <circle cx="67" cy="209" r="6" fill={FIGURE_FILL} stroke={INK} strokeWidth="1.2" />
        <circle cx="153" cy="209" r="6" fill={FIGURE_FILL} stroke={INK} strokeWidth="1.2" />
        <path
          d="M94 178 L90 300 L88 420 L103 420 L105 300 L107 178 Z"
          fill={FIGURE_FILL}
          stroke={INK}
          strokeWidth="1.2"
        />
        <path
          d="M113 178 L115 300 L117 420 L132 420 L130 300 L126 178 Z"
          fill={FIGURE_FILL}
          stroke={INK}
          strokeWidth="1.2"
        />
        <ellipse cx="95" cy="424" rx="10" ry="4.5" fill={FIGURE_FILL} stroke={INK} strokeWidth="1.2" />
        <ellipse cx="125" cy="424" rx="10" ry="4.5" fill={FIGURE_FILL} stroke={INK} strokeWidth="1.2" />

        {/* Top garment */}
        {top?.kind === "tshirt" && (
          <g>
            <path
              d="M80 72 C90 66 130 66 140 72 L162 96 L148 116 L138 104 L136 148 C136 166 132 176 128 182 L92 182 C88 176 84 166 84 148 L82 104 L72 116 L58 96 Z"
              fill={topFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path
              d="M96 72 Q110 82 124 72"
              fill="none"
              stroke={INK}
              strokeWidth="1"
              opacity="0.5"
            />
          </g>
        )}
        {top?.kind === "sweatshirt" && (
          <g>
            <path
              d="M80 72 C90 66 130 66 140 72 L140 148 C140 166 136 176 130 182 L90 182 C84 176 80 166 80 148 Z"
              fill={topFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path
              d="M80 74 C70 84 65 118 64 158 C63 180 63 196 64 206 L78 206 C78 192 79 172 80 150 C81 124 84 98 90 82 Z"
              fill={topFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path
              d="M140 74 C150 84 155 118 156 158 C157 180 157 196 156 206 L142 206 C142 192 141 172 140 150 C139 124 136 98 130 82 Z"
              fill={topFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path d="M82 168 L138 168" stroke={INK} strokeWidth="1" opacity="0.4" />
            <path d="M64 196 L78 196" stroke={INK} strokeWidth="1" opacity="0.4" />
            <path d="M142 196 L156 196" stroke={INK} strokeWidth="1" opacity="0.4" />
            <path
              d="M96 72 Q110 82 124 72"
              fill="none"
              stroke={INK}
              strokeWidth="1"
              opacity="0.5"
            />
          </g>
        )}

        {/* Bottom garment */}
        {bottom?.kind === "sweatpants" && (
          <g>
            <path
              d="M87 187 L85 300 L84 418 L100 418 L103 300 L106 187 Z"
              fill={bottomFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path
              d="M114 187 L117 300 L120 418 L136 418 L135 300 L133 187 Z"
              fill={bottomFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <rect
              x="86"
              y="176"
              width="48"
              height="11"
              rx="2"
              fill={bottomFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path d="M104 180 v8 M116 180 v8" stroke={INK} strokeWidth="1" opacity="0.5" />
          </g>
        )}
        {bottom?.kind === "shorts" && (
          <g>
            <path
              d="M87 187 L86 252 L105 252 L107 187 Z"
              fill={bottomFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path
              d="M113 187 L115 252 L134 252 L133 187 Z"
              fill={bottomFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <rect
              x="86"
              y="176"
              width="48"
              height="11"
              rx="2"
              fill={bottomFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
          </g>
        )}
      </svg>
      {label && (
        <p className="text-center text-sm text-ui-fg-subtle mt-3">{label}</p>
      )}
    </div>
  )
}

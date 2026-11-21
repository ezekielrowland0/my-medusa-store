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
 * A hex value (from the image-filename fallback) is passed through as-is.
 * Anything else falls back to ink, so the mannequin never shows a colour
 * the shop does not sell.
 */
export const colourToHex = (name?: string | null) => {
  const trimmed = (name ?? "").trim()
  if (trimmed.startsWith("#")) {
    return trimmed
  }
  const lower = trimmed.toLowerCase()
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
 * standing on a small plinth. Proportions are kept human: a longer torso,
 * legs about half the figure's height, and arms that end at the wrist,
 * level with the sleeve hems. Garment layers drawn over the figure follow
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
        <circle cx="110" cy="34" r="15" fill={FIGURE_FILL} stroke={INK} strokeWidth="1.2" />
        <path d="M103 47 h14 v16 h-14 z" fill={FIGURE_FILL} stroke={INK} strokeWidth="1.2" />
        <path
          d="M82 76 C92 67 128 67 138 76 L140 130 C141 162 138 192 134 210 L86 210 C82 192 79 162 80 130 Z"
          fill={FIGURE_FILL}
          stroke={INK}
          strokeWidth="1.2"
        />
        {/* Arms: a wider ink stroke underneath gives the stone stroke its outline */}
        <path
          d="M84 82 C74 94 70 128 69 162 C68 176 68 186 69 194"
          fill="none"
          stroke={INK}
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M84 82 C74 94 70 128 69 162 C68 176 68 186 69 194"
          fill="none"
          stroke={FIGURE_FILL}
          strokeWidth="12.5"
          strokeLinecap="round"
        />
        <path
          d="M136 82 C146 94 150 128 151 162 C152 176 152 186 151 194"
          fill="none"
          stroke={INK}
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M136 82 C146 94 150 128 151 162 C152 176 152 186 151 194"
          fill="none"
          stroke={FIGURE_FILL}
          strokeWidth="12.5"
          strokeLinecap="round"
        />
        <circle cx="69" cy="197" r="6" fill={FIGURE_FILL} stroke={INK} strokeWidth="1.2" />
        <circle cx="151" cy="197" r="6" fill={FIGURE_FILL} stroke={INK} strokeWidth="1.2" />
        <path
          d="M94 210 L90 310 L88 420 L103 420 L105 310 L107 210 Z"
          fill={FIGURE_FILL}
          stroke={INK}
          strokeWidth="1.2"
        />
        <path
          d="M113 210 L115 310 L117 420 L132 420 L130 310 L126 210 Z"
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
              d="M80 72 C90 66 130 66 140 72 L162 96 L148 116 L138 104 L136 150 C136 172 132 188 128 196 L92 196 C88 188 84 172 84 150 L82 104 L72 116 L58 96 Z"
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
              d="M80 72 C90 66 130 66 140 72 L140 150 C140 172 136 188 130 196 L90 196 C84 188 80 172 80 150 Z"
              fill={topFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path
              d="M80 74 C70 84 65 118 64 158 C63 178 63 188 64 196 L78 196 C78 186 79 170 80 150 C81 124 84 98 90 82 Z"
              fill={topFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path
              d="M140 74 C150 84 155 118 156 158 C157 178 157 188 156 196 L142 196 C142 186 141 170 140 150 C139 124 136 98 130 82 Z"
              fill={topFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path d="M82 182 L138 182" stroke={INK} strokeWidth="1" opacity="0.4" />
            <path d="M64 186 L78 186" stroke={INK} strokeWidth="1" opacity="0.4" />
            <path d="M142 186 L156 186" stroke={INK} strokeWidth="1" opacity="0.4" />
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
              d="M87 209 L85 310 L84 418 L100 418 L103 310 L106 209 Z"
              fill={bottomFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path
              d="M114 209 L117 310 L120 418 L136 418 L135 310 L133 209 Z"
              fill={bottomFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <rect
              x="86"
              y="198"
              width="48"
              height="11"
              rx="2"
              fill={bottomFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path d="M104 202 v8 M116 202 v8" stroke={INK} strokeWidth="1" opacity="0.5" />
          </g>
        )}
        {bottom?.kind === "shorts" && (
          <g>
            <path
              d="M87 209 L86 265 L105 265 L107 209 Z"
              fill={bottomFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <path
              d="M113 209 L115 265 L134 265 L133 209 Z"
              fill={bottomFill}
              stroke={INK}
              strokeWidth="1.2"
              className="mannequin-garment"
            />
            <rect
              x="86"
              y="198"
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

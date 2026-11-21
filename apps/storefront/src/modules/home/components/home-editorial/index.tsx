import Image from "next/image"
import Reveal from "@modules/common/components/reveal"

const MARQUEE_WORDS =
  "Medusa Store — Fine Essentials — Est. 2026 — Four Timeless Pieces — "

const VALUES = [
  {
    title: "Made to be kept",
    text: "Four pieces built for everyday wear, not for one season.",
  },
  {
    title: "Four timeless pieces",
    text: "A T-shirt, a sweatshirt, sweatpants and shorts. Nothing more.",
  },
  {
    title: "One small collection",
    text: "A short list, chosen with care, so every piece earns its place.",
  },
]

/**
 * The editorial middle of the home page: a story section, a full-bleed
 * image band, a values strip, and a brand marquee. Everything said here
 * is about the four pieces themselves — no shipping or returns promises
 * the shop does not make.
 */
export default function HomeEditorial() {
  return (
    <>
      {/* The Collection — the story */}
      <section className="content-container py-16 small:py-24 text-center">
        <Reveal>
          <span className="text-[11px] uppercase tracking-[0.35em] text-brass">
            The Collection
          </span>
          <h2 className="font-display text-4xl small:text-6xl text-ink mt-4 leading-tight">
            Four pieces.
            <br />
            Nothing more, nothing less.
          </h2>
          <span className="block h-px w-16 bg-brass mx-auto mt-8" />
          <p className="text-base-regular text-ui-fg-subtle max-w-xl mx-auto mt-6">
            A T-shirt, a sweatshirt, sweatpants and shorts — each one made to
            be worn every day, and kept for years.
          </p>
        </Reveal>
      </section>

      {/* Full-bleed image band */}
      <section className="relative h-[60vh] min-h-[380px] w-full overflow-hidden">
        <Image
          src="/hero-luxury.webp"
          alt="A luxury fashion store interior in marble and brass"
          fill
          className="object-cover object-center animate-ken-burns"
        />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <Reveal>
            <p className="font-display text-3xl small:text-5xl text-ivory leading-tight max-w-2xl">
              Worn every day.
              <br />
              Kept for years.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Values strip */}
      <section className="content-container py-16 small:py-20">
        <div className="grid grid-cols-1 small:grid-cols-3 gap-10 small:gap-6 text-center">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 120}>
              <span className="font-display text-2xl text-ink">
                {value.title}
              </span>
              <p className="text-sm text-ui-fg-subtle mt-3 max-w-xs mx-auto">
                {value.text}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Brand marquee */}
      <div
        className="overflow-hidden border-y border-stone bg-ivory py-4"
        aria-hidden="true"
      >
        <div className="flex w-max animate-marquee whitespace-nowrap">
          <span className="font-display text-xl tracking-[0.2em] text-brass">
            {MARQUEE_WORDS.repeat(4)}
          </span>
          <span className="font-display text-xl tracking-[0.2em] text-brass">
            {MARQUEE_WORDS.repeat(4)}
          </span>
        </div>
      </div>
    </>
  )
}

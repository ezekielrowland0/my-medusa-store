import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading } from "@modules/common/components/ui"

const Hero = () => {
  return (
    <div className="relative h-[85vh] min-h-[540px] w-full overflow-hidden">
      <Image
        src="/hero-luxury.webp"
        alt="A luxury fashion store interior in marble and brass"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 gap-6">
        <span className="text-[11px] uppercase tracking-[0.35em] text-brass-light font-medium">
          Est. 2026 — Fine Essentials
        </span>
        <Heading
          level="h1"
          className="font-display text-5xl small:text-6xl leading-tight text-ivory font-medium max-w-3xl"
        >
          Everyday essentials, beautifully elevated
        </Heading>
        <span className="block h-px w-16 bg-brass" />
        <p className="text-base-regular text-ivory/80 max-w-xl">
          Four timeless pieces, made to be worn, kept, and loved.
        </p>
        <LocalizedClientLink
          href="/store"
          className="inline-block border border-ivory/80 px-10 py-4 text-xs uppercase tracking-[0.25em] text-ivory transition-colors duration-300 hover:bg-ivory hover:text-ink"
        >
          Shop the collection
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Hero

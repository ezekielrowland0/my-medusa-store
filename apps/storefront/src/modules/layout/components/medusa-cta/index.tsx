import { Text } from "@modules/common/components/ui"

import Medusa from "../../../common/icons/medusa"
import NextJs from "../../../common/icons/nextjs"

const MedusaCTA = () => {
  return (
    <Text className="flex gap-x-2 txt-compact-small-plus items-center">
      Powered by
      <a
        href="https://www.medusajs.com"
        target="_blank"
        rel="noreferrer"
        aria-label="Medusa"
        className="flex items-center gap-x-1.5 text-ui-fg-muted hover:text-ink"
      >
        <Medusa fill="#9ca3af" className="fill-[#9ca3af]" />
        <span>Medusa</span>
      </a>
      &
      <a
        href="https://nextjs.org"
        target="_blank"
        rel="noreferrer"
        aria-label="Next.js"
        className="flex items-center gap-x-1.5 text-ui-fg-muted hover:text-ink"
      >
        <NextJs fill="#9ca3af" />
        <span>Next.js</span>
      </a>
    </Text>
  )
}

export default MedusaCTA

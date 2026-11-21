import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Cormorant_Garamond, Jost } from "next/font/google"
import "styles/globals.css"

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
})

const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${display.variable} ${sans.variable}`}
    >
      <head>
        <link rel="ucp" href="/.well-known/ucp" />
      </head>
      <body className="bg-ivory font-sans text-ink antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}

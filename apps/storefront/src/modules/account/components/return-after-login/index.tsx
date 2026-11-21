"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * After sign-in / sign-up, sends the customer back to the page they came
 * from (?next=... on the account URL). Rendered only on the account
 * dashboard, so it runs only once the customer is logged in.
 * The destination must be a same-site path, never an outside link.
 */
const ReturnAfterLogin = () => {
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const next = params.get("next")
    const current = window.location.pathname + window.location.search

    if (
      next &&
      next.startsWith("/") &&
      !next.startsWith("//") &&
      next !== current
    ) {
      router.replace(next)
    }
  }, [router])

  return null
}

export default ReturnAfterLogin

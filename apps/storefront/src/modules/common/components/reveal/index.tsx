"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { clx } from "@modules/common/components/ui"

type RevealProps = {
  children: ReactNode
  /** Stagger delay in milliseconds, for grids. */
  delay?: number
  className?: string
}

/**
 * Fades and rises its children into view the first time they scroll
 * on screen. Uses the .reveal / .reveal-visible classes in globals.css,
 * which also turn the effect off for prefers-reduced-motion.
 */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={clx("reveal", visible && "reveal-visible", className)}
    >
      {children}
    </div>
  )
}

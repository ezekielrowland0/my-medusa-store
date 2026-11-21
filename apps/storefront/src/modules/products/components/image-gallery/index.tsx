"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import { useRef, useState } from "react"

const MAX_IMAGES = 6
const MAX_ZOOM = 3
const HOVER_ZOOM = 2
const SWIPE_THRESHOLD = 50
const DOUBLE_TAP_MS = 300

type GalleryItem =
  | { kind: "image"; id: string; url: string; alt: string }
  | { kind: "video"; id: string; url: string; poster?: string }

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  videoUrl?: string | null
}

const buildItems = (
  images: HttpTypes.StoreProductImage[],
  videoUrl?: string | null
): GalleryItem[] => {
  const items: GalleryItem[] = images
    .filter((image) => !!image.url)
    .slice(0, MAX_IMAGES)
    .map((image, index) => ({
      kind: "image" as const,
      id: image.id,
      url: image.url as string,
      alt: `Product image ${index + 1}`,
    }))

  // The video slot is always last and only exists when the product really
  // has a clip (set as `video_url` in the product metadata in the admin).
  if (videoUrl) {
    items.push({
      kind: "video",
      id: "product-video",
      url: videoUrl,
      poster:
        items[0] && items[0].kind === "image" ? items[0].url : undefined,
    })
  }

  return items
}

const getTouchDistance = (touches: React.TouchList) => {
  const first = touches[0]
  const second = touches[1]
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
}

const Chevron = ({ direction }: { direction: "left" | "right" }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    className={direction === "left" ? "rotate-90" : "-rotate-90"}
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 8.5L15.5 12L10 15.5V8.5Z" fill="currentColor" />
  </svg>
)

const ImageGallery = ({ images, videoUrl }: ImageGalleryProps) => {
  const items = buildItems(images, videoUrl)

  const [activeIndex, setActiveIndex] = useState(0)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [hoverZoom, setHoverZoom] = useState(false)
  const [gesturing, setGesturing] = useState(false)

  const viewerRef = useRef<HTMLDivElement>(null)
  const isTouchDevice = useRef(false)
  const touchState = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    moved: 0,
    pinchStartDistance: 0,
    pinchStartScale: 1,
    pinching: false,
    lastTapAt: 0,
    lastTapX: 0,
    lastTapY: 0,
  })

  const activeItem = items[Math.min(activeIndex, items.length - 1)]

  const resetZoom = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
    setOrigin({ x: 50, y: 50 })
    setHoverZoom(false)
  }

  const goTo = (index: number) => {
    if (items.length === 0) {
      return
    }
    resetZoom()
    setActiveIndex(((index % items.length) + items.length) % items.length)
  }

  const clampPan = (x: number, y: number, nextScale: number) => {
    const max = 160 * (nextScale - 1)
    return {
      x: Math.max(-max, Math.min(max, x)),
      y: Math.max(-max, Math.min(max, y)),
    }
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    isTouchDevice.current = true
    setGesturing(true)
    const touches = event.touches
    const state = touchState.current

    if (touches.length === 2) {
      state.pinching = true
      state.pinchStartDistance = getTouchDistance(touches)
      state.pinchStartScale = scale
      return
    }

    const touch = touches[0]
    state.startX = touch.clientX
    state.startY = touch.clientY
    state.lastX = touch.clientX
    state.lastY = touch.clientY
    state.moved = 0
    state.pinching = false
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    const touches = event.touches
    const state = touchState.current
    const isVideo = activeItem?.kind === "video"

    if (touches.length === 2 && state.pinching && !isVideo) {
      const distance = getTouchDistance(touches)
      if (state.pinchStartDistance > 0) {
        const nextScale = Math.max(
          1,
          Math.min(
            MAX_ZOOM,
            state.pinchStartScale * (distance / state.pinchStartDistance)
          )
        )
        setScale(nextScale)
        setPan((prev) => clampPan(prev.x, prev.y, nextScale))
        if (nextScale === 1) {
          setPan({ x: 0, y: 0 })
        }
      }
      return
    }

    if (touches.length !== 1) {
      return
    }

    const touch = touches[0]
    const dx = touch.clientX - state.lastX
    const dy = touch.clientY - state.lastY
    state.moved += Math.abs(dx) + Math.abs(dy)
    state.lastX = touch.clientX
    state.lastY = touch.clientY

    // Pan the zoomed image; otherwise the movement is a potential swipe.
    if (scale > 1 && !isVideo) {
      setPan((prev) => clampPan(prev.x + dx, prev.y + dy, scale))
    }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    const state = touchState.current

    if (state.pinching) {
      if (event.touches.length < 2) {
        state.pinching = false
      }
      setGesturing(false)
      return
    }

    const totalDx = state.lastX - state.startX
    const totalDy = state.lastY - state.startY
    const now = Date.now()

    // Double-tap toggles zoom at the tapped point (images only).
    if (
      state.moved < 12 &&
      activeItem?.kind === "image" &&
      now - state.lastTapAt < DOUBLE_TAP_MS &&
      Math.abs(state.lastX - state.lastTapX) < 40 &&
      Math.abs(state.lastY - state.lastTapY) < 40
    ) {
      const viewer = viewerRef.current
      if (viewer) {
        const rect = viewer.getBoundingClientRect()
        const x = ((state.lastX - rect.left) / rect.width) * 100
        const y = ((state.lastY - rect.top) / rect.height) * 100
        if (scale === 1) {
          setOrigin({ x, y })
          setScale(2)
        } else {
          resetZoom()
        }
      }
      state.lastTapAt = 0
      setGesturing(false)
      return
    }

    if (state.moved < 12) {
      state.lastTapAt = now
      state.lastTapX = state.lastX
      state.lastTapY = state.lastY
    }

    // Horizontal swipe changes the image; vertical movement is ignored.
    if (
      Math.abs(totalDx) > SWIPE_THRESHOLD &&
      Math.abs(totalDx) > Math.abs(totalDy) * 1.2
    ) {
      goTo(activeIndex + (totalDx < 0 ? 1 : -1))
    }

    setGesturing(false)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isTouchDevice.current || activeItem?.kind !== "image") {
      return
    }
    if (!window.matchMedia("(pointer: fine)").matches) {
      return
    }
    const viewer = viewerRef.current
    if (!viewer) {
      return
    }
    const rect = viewer.getBoundingClientRect()
    setOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    })
    setHoverZoom(true)
  }

  const handleMouseLeave = () => {
    setHoverZoom(false)
    setOrigin({ x: 50, y: 50 })
  }

  const effectiveScale = hoverZoom && scale === 1 ? HOVER_ZOOM : scale

  if (items.length === 0) {
    return (
      <div className="flex items-start relative">
        <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
          <div className="relative aspect-[29/34] w-full overflow-hidden bg-stone rounded-rounded flex items-center justify-center">
            <p className="font-display text-lg text-ink/60 px-8 text-center">
              Photo coming soon
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
        <div
          ref={viewerRef}
          className="group relative aspect-[29/34] w-full overflow-hidden bg-stone border border-stone rounded-rounded select-none"
          style={{ touchAction: "none" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {activeItem.kind === "image" ? (
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${effectiveScale})`,
                transformOrigin: `${origin.x}% ${origin.y}%`,
                transition: gesturing
                  ? "none"
                  : "transform 200ms ease-out",
                cursor:
                  effectiveScale > 1 ? "grab" : "zoom-in",
              }}
            >
              <Image
                src={activeItem.url}
                priority={activeIndex === 0}
                className="absolute inset-0 rounded-rounded"
                alt={activeItem.alt}
                fill
                sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                style={{ objectFit: "contain" }}
                draggable={false}
              />
            </div>
          ) : (
            <video
              src={activeItem.url}
              poster={activeItem.poster}
              controls
              loop
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover rounded-rounded"
            />
          )}

          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-md transition-opacity small:opacity-0 small:group-hover:opacity-100 hover:bg-ivory"
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-md transition-opacity small:opacity-0 small:group-hover:opacity-100 hover:bg-ivory"
              >
                <Chevron direction="right" />
              </button>
            </>
          )}

          <span className="absolute bottom-3 right-3 z-10 bg-ivory/90 text-ink text-xs tracking-[0.15em] px-2.5 py-1 rounded-full font-display">
            {activeIndex + 1} / {items.length}
          </span>
        </div>

        {items.length > 1 && (
          <div
            className="flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Product images"
          >
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={
                  item.kind === "video"
                    ? "Play product video"
                    : `Show image ${index + 1}`
                }
                onClick={() => goTo(index)}
                className={clx(
                  "h-2 rounded-full transition-all duration-200",
                  index === activeIndex
                    ? "w-6 bg-brass"
                    : "w-2 bg-stone hover:bg-brass/60"
                )}
              />
            ))}
          </div>
        )}

        {items.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={
                  item.kind === "video"
                    ? "Product video"
                    : `View image ${index + 1}`
                }
                onClick={() => goTo(index)}
                className={clx(
                  "relative shrink-0 w-[72px] aspect-[29/34] overflow-hidden rounded-rounded bg-stone border border-stone transition-shadow",
                  index === activeIndex
                    ? "ring-2 ring-brass ring-offset-2 ring-offset-ivory"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                {item.kind === "image" ? (
                  <Image
                    src={item.url}
                    alt={item.alt}
                    fill
                    sizes="72px"
                    style={{ objectFit: "contain" }}
                    draggable={false}
                  />
                ) : (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/85 text-ivory">
                    <PlayIcon />
                    <span className="text-[10px] uppercase tracking-[0.2em]">
                      Video
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-ink/50 tracking-wide">
          <span className="small:hidden">
            Swipe to browse · Pinch or double-tap to zoom
          </span>
          <span className="hidden small:inline">
            Hover to zoom · Click a thumbnail to browse
          </span>
        </p>
      </div>
    </div>
  )
}

export default ImageGallery

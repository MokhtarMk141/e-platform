'use client'

import Link from 'next/link'
import { useMemo, useState, useCallback, useRef } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useBrands } from '@/hooks/useBrands'
import { useCart } from '@/hooks/useCart'

/* ─── Types ─── */
interface ShowcaseProduct {
  id: string
  name: string
  price: number
  sku: string
  description: string | null
  stock: number
  image: string
  category: string
}

interface ShowcaseBrand {
  id: string
  name: string
  logo: string | null
  products: ShowcaseProduct[]
}

/* ─── Constants ─── */
const VISIBLE_PRODUCT_OFFSETS = [-2, -1, 0, 1, 2]

const isAccessoryCategory = (categoryName: string | null | undefined) => {
  if (!categoryName) return false
  const normalized = categoryName.trim().toLowerCase()
  return normalized === 'accessory' || normalized === 'accessories'
}


/* ─── Helpers ─── */
const getProductWindow = (products: ShowcaseProduct[], activeIndex: number) => {
  if (products.length === 0) return []
  const count = Math.min(products.length, VISIBLE_PRODUCT_OFFSETS.length)
  const start = 2 - Math.floor(count / 2)
  const offsets = VISIBLE_PRODUCT_OFFSETS.slice(start, start + count)

  return offsets.map((offset) => {
    const idx = (activeIndex + offset + products.length) % products.length
    return { product: products[idx], offset }
  })
}

/* ─── Component ─── */
export default function BrandAccessoryShowcase() {
  const { products: dbProducts, loading } = useProducts({ limit: 100 })
  const { brands: dbBrands, loading: brandsLoading } = useBrands()
  const { addItem } = useCart()

  const [activeBrandIndex, setActiveBrandIndex] = useState(0)
  const [activeProductIndex, setActiveProductIndex] = useState<number | null>(null)
  const [productFade, setProductFade] = useState<'in' | 'out' | 'none'>('none')
  const [transitioning, setTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  /* ─── Derive brands with their products ─── */
  const brands = useMemo<ShowcaseBrand[]>(() => {
    const accessoryProducts = dbProducts.filter((p) => isAccessoryCategory(p.category?.name))
    const withBrand = accessoryProducts.filter((p) => p.brand)
    const mappedBrands = dbBrands
      .map((b) => ({
        id: b.id,
        name: b.name,
        logo: b.logoUrl,
        products: withBrand
          .filter((p) => p.brand?.id === b.id)
          .slice(0, 10)
          .map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price ?? 0,
            sku: p.sku || '',
            description: p.description,
            stock: p.stock ?? 0,
            image: p.imageUrl || '/showcase/keyboard.png',
            category: p.category?.name || 'Accessory',
          })),
      }))
      .filter((b) => b.products.length > 0)

    if (mappedBrands.length > 0) {
      return mappedBrands
    }

    const fallbackProducts = accessoryProducts.slice(0, 10).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price ?? 0,
      sku: p.sku || '',
      description: p.description,
      stock: p.stock ?? 0,
      image: p.imageUrl || '/showcase/keyboard.png',
      category: p.category?.name || 'Accessory',
    }))

    if (fallbackProducts.length === 0) {
      return []
    }

    return [
      {
        id: 'featured-accessories',
        name: 'Featured Accessories',
        logo: null,
        products: fallbackProducts,
      },
    ]
  }, [dbBrands, dbProducts])

  const safeBrand = Math.min(activeBrandIndex, Math.max(0, brands.length - 1))
  const currentBrand = brands[safeBrand]
  const products = useMemo(() => currentBrand?.products ?? [], [currentBrand])
  const defaultProductIndex = products.length === 0 ? 0 : Math.floor(products.length / 2)
  const safeProd =
    products.length === 0
      ? 0
      : Math.min(activeProductIndex ?? defaultProductIndex, products.length - 1)
  const visibleProducts = useMemo(() => getProductWindow(products, safeProd), [products, safeProd])

  /* ─── Brand switch ─── */
  const switchBrand = useCallback(
    (index: number) => {
      if (index === safeBrand || transitioning) return
      setTransitioning(true)
      setProductFade('out')

      setTimeout(() => {
        setActiveBrandIndex(index)
        setActiveProductIndex(Math.floor(brands[index].products.length / 2))
        setProductFade('in')

        setTimeout(() => {
          setProductFade('none')
          setTransitioning(false)
        }, 450)
      }, 250)
    },
    [safeBrand, transitioning, brands],
  )

  /* ─── Product click ─── */
  const focusProduct = useCallback(
    (productId: string) => {
      const idx = products.findIndex((p) => p.id === productId)
      if (idx >= 0 && idx !== safeProd) {
        setActiveProductIndex(idx)
      }
    },
    [products, safeProd],
  )

  /* ─── Auto-rotate brands on mount ─── */
  if ((loading || brandsLoading) && brands.length === 0) return null

  const featureProduct = products[safeProd]

  /* ─── Brand arc positioning ─── */
  return (
    <section
      id="brand-showcase"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        overflow: 'hidden',
        padding: '80px 0 40px',
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
        background:
          'radial-gradient(ellipse at top center, rgba(255,40,0,0.10) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(255,40,0,0.06) 0%, transparent 40%), linear-gradient(180deg, var(--background) 0%, var(--surface) 50%, var(--background) 100%)',
      }}
    >
      <style>{`
        /* ═══════════════════════════════════════════
           BRAND ACCESSORY SHOWCASE — REDESIGN
           ═══════════════════════════════════════════ */

        .bas-shell {
          width: min(1320px, calc(100vw - 40px));
          margin: 0 auto;
          padding: 0 20px;
        }

        /* ── Section Header ── */
        .bas-header {
          text-align: center;
          margin-bottom: 40px;
          position: relative;
          z-index: 2;
        }

        .bas-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brand-red);
          margin-bottom: 14px;
        }

        .bas-badge-line {
          width: 26px;
          height: 2px;
          background: var(--brand-red);
          border-radius: 999px;
        }

        .bas-title {
          font-size: clamp(30px, 4.2vw, 48px);
          font-weight: 900;
          letter-spacing: -0.05em;
          color: var(--foreground);
          margin: 0 0 12px;
          line-height: 1.05;
        }

        .bas-subtitle {
          font-size: 14px;
          color: var(--text-dim);
          margin: 0 auto;
          max-width: 560px;
          line-height: 1.65;
        }

        /* ── Stage Container ── */
        .bas-stage {
          position: relative;
          border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
          border-radius: 36px;
          overflow: hidden;
          background:
            linear-gradient(180deg,
              color-mix(in srgb, var(--background) 90%, transparent) 0%,
              color-mix(in srgb, var(--surface) 98%, transparent) 100%);
          box-shadow:
            0 30px 80px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.06);
          backdrop-filter: blur(16px);
        }

        .bas-stage::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(255,40,0,0.12), transparent 40%),
            linear-gradient(135deg, rgba(255,255,255,0.04), transparent 30%);
        }

        .bas-empty {
          position: relative;
          z-index: 1;
          padding: 56px 24px;
          display: grid;
          gap: 12px;
          justify-items: center;
          text-align: center;
        }

        .bas-empty-title {
          margin: 0;
          font-size: clamp(22px, 3vw, 30px);
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--foreground);
        }

        .bas-empty-copy {
          margin: 0;
          max-width: 560px;
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-dim);
        }

        .dark .bas-stage {
          box-shadow:
            0 30px 80px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.03);
        }

        /* ── Products Carousel ── */
        .bas-products {
          position: relative;
          height: 470px;
          padding: 40px 0 0;
          opacity: 1;
          transform: translateY(0);
          transition:
            opacity 0.35s cubic-bezier(0.16,1,0.3,1),
            transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }

        .bas-products.fade-out {
          opacity: 0;
          transform: translateY(16px);
        }

        .bas-product-link {
          position: absolute;
          top: 20px;
          left: 50%;
          width: min(32vw, 280px);
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          transition:
            transform 0.55s cubic-bezier(0.16,1,0.3,1),
            opacity 0.4s ease,
            filter 0.4s ease;
        }

        .bas-product-card {
          height: 100%;
          min-height: 380px;
          border-radius: 24px;
          border: 1px solid color-mix(in srgb, var(--border) 84%, transparent);
          background:
            linear-gradient(180deg,
              color-mix(in srgb, var(--background) 98%, transparent) 0%,
              color-mix(in srgb, var(--surface) 98%, transparent) 100%);
          overflow: hidden;
          box-shadow:
            0 20px 50px rgba(0,0,0,0.10),
            inset 0 1px 0 rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          transition:
            transform 0.45s cubic-bezier(0.16,1,0.3,1),
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .bas-product-link.featured .bas-product-card {
          box-shadow:
            0 30px 70px rgba(255,40,0,0.12),
            0 10px 30px rgba(0,0,0,0.12),
            inset 0 1px 0 rgba(255,255,255,0.08);
          border-color: rgba(255,40,0,0.20);
        }

        .bas-product-link:hover .bas-product-card {
          border-color: rgba(255,40,0,0.45);
          box-shadow:
            0 30px 60px rgba(255,40,0,0.16),
            0 10px 30px rgba(0,0,0,0.12);
        }

        /* Product Image */
        .bas-product-media {
          position: relative;
          height: 200px;
          padding: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          margin: 16px 16px 0;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 20%, rgba(255,40,0,0.12), transparent 58%),
            linear-gradient(180deg,
              color-mix(in srgb, var(--surface) 90%, transparent) 0%,
              color-mix(in srgb, var(--background) 100%, transparent) 100%);
          box-shadow:
            inset 0 0 0 1px color-mix(in srgb, var(--border) 75%, transparent),
            0 12px 28px rgba(0,0,0,0.08);
        }

        .bas-product-link.featured .bas-product-media {
          height: 250px;
        }

        .bas-product-img {
          width: 100%;
          height: 100%;
          aspect-ratio: 4 / 3;
          object-fit: contain;
          filter: drop-shadow(0 16px 20px rgba(0,0,0,0.16));
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
        }

        .bas-product-link:hover .bas-product-img {
          transform: scale(1.06);
        }

        .bas-product-chip {
          position: absolute;
          top: 16px;
          left: 16px;
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--border) 84%, transparent);
          background: color-mix(in srgb, var(--background) 92%, transparent);
          color: var(--foreground);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
        }

        /* Product Content */
        .bas-product-body {
          flex: 1;
          padding: 18px 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bas-product-kicker {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-dim);
        }

        .bas-product-name {
          margin: 0;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.35;
          color: var(--foreground);
          letter-spacing: -0.03em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .bas-product-link.featured .bas-product-name {
          font-size: 20px;
        }

        .bas-product-desc {
          margin: 0;
          font-size: 12px;
          line-height: 1.6;
          color: var(--text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .bas-product-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 8px;
        }

        .bas-price {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--foreground);
        }

        .bas-product-link.featured .bas-price {
          font-size: 22px;
        }

        .bas-add-btn {
          border: none;
          border-radius: 12px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #ff2800 0%, #ff5b36 100%);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(255,40,0,0.22);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .bas-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(255,40,0,0.30);
        }

        .bas-add-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
          background: color-mix(in srgb, var(--surface) 90%, transparent);
          color: var(--text-dim);
          box-shadow: none;
          border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
        }

        /* ── Brand Selector ── */
        .bas-arc-section {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 18px;
          margin-top: 22px;
          padding: 0 24px 8px;
        }

        .bas-brand-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          transition:
            transform 0.3s cubic-bezier(0.16,1,0.3,1),
            opacity 0.3s ease;
        }

        .bas-brand-btn::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,40,0,0.10), transparent 70%);
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
        }

        .bas-brand-btn:hover::after,
        .bas-brand-btn.active::after {
          opacity: 1;
          transform: scale(1);
        }

        /* Brand Badge Circle */
        .bas-brand-badge {
          width: 70px;
          height: 70px;
          border-radius: 22px;
          border: 1.5px solid color-mix(in srgb, var(--border) 76%, transparent);
          background:
            linear-gradient(180deg,
              color-mix(in srgb, var(--surface) 92%, rgba(255,255,255,0.04)) 0%,
              color-mix(in srgb, var(--background) 96%, transparent) 100%);
          box-shadow:
            0 10px 24px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          transition:
            transform 0.4s cubic-bezier(0.16,1,0.3,1),
            border-color 0.35s ease,
            box-shadow 0.35s ease,
            background 0.35s ease;
        }

        .bas-brand-badge::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.06), transparent 40%),
            radial-gradient(circle at 80% 100%, rgba(255,40,0,0.06), transparent 30%);
          pointer-events: none;
        }

        .bas-brand-btn:hover .bas-brand-badge {
          transform: translateY(-2px);
          border-color: rgba(255,40,0,0.25);
          box-shadow:
            0 14px 28px rgba(0,0,0,0.12),
            0 0 0 4px rgba(255,40,0,0.06);
        }

        .bas-brand-btn.active .bas-brand-badge {
          transform: translateY(-3px) scale(1.06);
          border-color: rgba(255,40,0,0.45);
          background:
            linear-gradient(180deg,
              color-mix(in srgb, var(--surface) 88%, rgba(255,40,0,0.06)) 0%,
              color-mix(in srgb, var(--background) 92%, rgba(255,40,0,0.04)) 100%);
          box-shadow:
            0 16px 32px rgba(255,40,0,0.16),
            0 0 0 6px rgba(255,40,0,0.10),
            0 0 40px rgba(255,40,0,0.08);
        }


        .bas-brand-logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
          position: relative;
          z-index: 1;
          transition:
            transform 0.35s ease,
            filter 0.35s ease;
        }

        .bas-brand-btn:hover .bas-brand-logo {
          transform: scale(1.05);
        }

        .bas-brand-btn.active .bas-brand-logo {
          transform: scale(1.08);
        }

        .bas-brand-fallback {
          font-size: 22px;
          font-weight: 900;
          color: var(--foreground);
          letter-spacing: -0.04em;
          position: relative;
          z-index: 1;
        }

        .bas-brand-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-dim);
          max-width: 88px;
          text-align: center;
          line-height: 1.3;
          transition: color 0.3s ease;
        }

        .bas-brand-btn.active .bas-brand-label {
          color: var(--foreground);
        }

        /* ── Active brand indicator ── */
        .bas-brand-indicator {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--brand-red);
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .bas-brand-btn.active .bas-brand-indicator {
          opacity: 1;
        }

        /* ── Bottom Info Bar ── */
        .bas-info {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 14px;
          padding: 18px 0 24px;
          color: var(--text-dim);
          font-size: 13px;
          text-align: center;
        }

        .bas-info strong {
          color: var(--foreground);
          font-weight: 800;
        }

        .bas-info-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,40,0,0.5);
        }

        /* ── Navigation Arrows ── */
        .bas-nav-arrows {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          padding: 0 16px;
          pointer-events: none;
          z-index: 10;
        }

        .bas-arrow-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
          background: color-mix(in srgb, var(--background) 90%, transparent);
          color: var(--foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: all;
          backdrop-filter: blur(8px);
          transition: all 0.25s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }

        .bas-arrow-btn:hover {
          border-color: rgba(255,40,0,0.4);
          background: rgba(255,40,0,0.08);
          color: var(--brand-red);
          transform: scale(1.08);
          box-shadow: 0 8px 24px rgba(255,40,0,0.12);
        }

        /* ── Product counter dots ── */
        .bas-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 6px;
        }

        .bas-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--border);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        .bas-dot.active {
          width: 24px;
          border-radius: 3px;
          background: var(--brand-red);
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .bas-products {
            height: 430px;
          }
          .bas-product-link {
            width: min(30vw, 260px);
          }

        }

        @media (max-width: 860px) {
          .bas-stage {
            border-radius: 24px;
          }

          .bas-products {
            height: auto;
            padding: 24px 16px 0;
            display: flex;
            gap: 12px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }

          .bas-product-link {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            width: 260px !important;
            min-width: 260px;
            transform: none !important;
            opacity: 1 !important;
            filter: none !important;
            scroll-snap-align: center;
          }

          .bas-product-card,
          .bas-product-link.featured .bas-product-card {
            min-height: 0;
          }

          .bas-product-media,
          .bas-product-link.featured .bas-product-media {
            height: 200px;
          }

          .bas-arc-section {
            flex-wrap: nowrap;
            gap: 12px;
            overflow-x: auto;
            padding: 12px 16px;
            scroll-snap-type: x proximity;
          }

          .bas-brand-btn {
            flex: 0 0 auto;
            scroll-snap-align: center;
          }

          .bas-nav-arrows {
            display: none;
          }
        }
      `}</style>

      <div className="bas-shell">
        {/* ── Header ── */}
        <div className="bas-header">
          <div className="bas-badge">
            <span className="bas-badge-line" />
            PC Accessories
            <span className="bas-badge-line" />
          </div>
          <h2 className="bas-title">Premium Accessories</h2>
          <p className="bas-subtitle">
            Select a brand below to explore their accessories. Click any side product to bring it to center stage.
          </p>
        </div>

        {/* ── Stage ── */}
        <div className="bas-stage">
          {!currentBrand && (
            <div className="bas-empty">
              <h3 className="bas-empty-title">Accessories are on the way</h3>
              <p className="bas-empty-copy">
                This showcase stays visible now, but it needs products in the catalog before we can build out the brand carousel.
              </p>
            </div>
          )}

          {currentBrand && (
            <>
          {/* Products Carousel */}
          <div className={`bas-products ${productFade === 'out' ? 'fade-out' : ''}`}>
            {/* Navigation Arrows */}
            <div className="bas-nav-arrows">
              <button
                className="bas-arrow-btn"
                onClick={() => {
                  const prev = (safeProd - 1 + products.length) % products.length
                  setActiveProductIndex(prev)
                }}
                aria-label="Previous product"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                className="bas-arrow-btn"
                onClick={() => {
                  const next = (safeProd + 1) % products.length
                  setActiveProductIndex(next)
                }}
                aria-label="Next product"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {visibleProducts.map(({ product, offset }) => {
              const isFeatured = offset === 0
              const absOffset = Math.abs(offset)
              const translateX = offset * 230
              const translateY = isFeatured ? 0 : absOffset === 1 ? 40 : 72
              const scale = isFeatured ? 1 : absOffset === 1 ? 0.88 : 0.75
              const opacity = isFeatured ? 1 : absOffset === 1 ? 0.85 : 0.55
              const zIndex = isFeatured ? 5 : 5 - absOffset

              return (
                <Link
                  key={`${currentBrand.id}-${product.id}-${offset}`}
                  href={`/product-page/${product.id}`}
                  className={`bas-product-link ${isFeatured ? 'featured' : ''}`}
                  onClick={(e) => {
                    if (!isFeatured) {
                      e.preventDefault()
                      focusProduct(product.id)
                    }
                  }}
                  style={{
                    transform: `translateX(calc(-50% + ${translateX}px)) translateY(${translateY}px) scale(${scale})`,
                    opacity,
                    zIndex,
                    filter: isFeatured ? 'none' : `saturate(0.85) brightness(${absOffset === 1 ? 0.95 : 0.85})`,
                  }}
                >
                  <article className="bas-product-card">
                    <div className="bas-product-media">
                      <img className="bas-product-img" src={product.image} alt={product.name} />
                      <span className="bas-product-chip">{product.category}</span>
                    </div>
                    <div className="bas-product-body">
                      <div className="bas-product-kicker">{product.sku || currentBrand.name}</div>
                      <h3 className="bas-product-name">{product.name}</h3>
                      {product.description && <p className="bas-product-desc">{product.description}</p>}
                      <div className="bas-product-footer">
                        <span className="bas-price">TND {product.price.toFixed(2)}</span>
                        <button
                          className="bas-add-btn"
                          disabled={product.stock === 0}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addItem(product.id, 1, {
                              productId: product.id,
                              name: product.name,
                              price: product.price,
                              imageUrl: product.image,
                              sku: product.sku,
                            })
                          }}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add +'}
                        </button>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>

          {/* Product dots */}
          {products.length > 1 && (
            <div className="bas-dots">
              {products.map((_, i) => (
                <button
                  key={i}
                  className={`bas-dot ${i === safeProd ? 'active' : ''}`}
                  onClick={() => setActiveProductIndex(i)}
                  aria-label={`Go to product ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Brand Selector */}
          <div className="bas-arc-section">
            {brands.map((brand, index) => {
              const isActive = index === safeBrand

              return (
                <button
                  key={brand.id}
                  type="button"
                  className={`bas-brand-btn ${isActive ? 'active' : ''}`}
                  onClick={() => switchBrand(index)}
                  aria-pressed={isActive}
                  aria-label={`Show ${brand.name} accessories`}
                >
                  <span className="bas-brand-badge">
                    {brand.logo ? (
                      <img className="bas-brand-logo" src={brand.logo} alt={brand.name} />
                    ) : (
                      <span className="bas-brand-fallback">{brand.name.charAt(0)}</span>
                    )}
                  </span>
                  <span className="bas-brand-label">{brand.name}</span>
                  <span className="bas-brand-indicator" />
                </button>
              )
            })}
          </div>

          {/* Info Bar */}
          {featureProduct && (
            <div className="bas-info">
              <strong>{currentBrand.name}</strong>
              <span className="bas-info-dot" />
              <span>{products.length} accessories</span>
              <span className="bas-info-dot" />
              <span>Click a side product to bring it to center</span>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}




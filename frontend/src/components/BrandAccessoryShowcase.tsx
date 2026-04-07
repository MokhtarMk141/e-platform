'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useBrands } from '@/hooks/useBrands'
import { useCart } from '@/hooks/useCart'

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

interface PositionedProduct {
  product: ShowcaseProduct
  offset: number
}

const PRODUCT_OFFSETS = [-2, -1, 0, 1, 2]

const getCircularOffset = (index: number, activeIndex: number, length: number) => {
  if (length <= 1) return 0

  let diff = index - activeIndex
  const half = Math.floor(length / 2)

  if (diff > half) diff -= length
  if (diff < -half) diff += length

  return diff
}

const getBrandArcStyle = (offset: number, total: number) => {
  const half = Math.max(1, Math.ceil((total - 1) / 2))
  const step = Math.min(22, 80 / half)
  const angle = (90 - offset * step) * (Math.PI / 180)
  const radius = total > 8 ? 270 : 300
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  const distance = Math.abs(offset)
  const scale = offset === 0 ? 1.18 : Math.max(0.68, 1 - distance * 0.1)
  const opacity = offset === 0 ? 1 : Math.max(0.26, 0.9 - distance * 0.16)

  return {
    left: `calc(50% + ${x}px)`,
    top: `${radius - y + 92}px`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    opacity,
    zIndex: total - distance,
  }
}

const getProductWindow = (products: ShowcaseProduct[], activeIndex: number): PositionedProduct[] => {
  if (products.length === 0) return []

  const visibleCount = Math.min(products.length, PRODUCT_OFFSETS.length)
  const start = 2 - Math.floor(visibleCount / 2)
  const visibleOffsets = PRODUCT_OFFSETS.slice(start, start + visibleCount)

  return visibleOffsets.map((offset) => {
    const productIndex = (activeIndex + offset + products.length) % products.length

    return {
      product: products[productIndex],
      offset,
    }
  })
}

export default function BrandAccessoryShowcase() {
  const { products: dbProducts, loading } = useProducts({ limit: 100 })
  const { brands: dbBrands } = useBrands()
  const { addItem } = useCart()
  const [activeBrandIndex, setActiveBrandIndex] = useState(0)
  const [activeProductIndex, setActiveProductIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [productFade, setProductFade] = useState<'in' | 'out' | 'none'>('none')

  const brands = useMemo<ShowcaseBrand[]>(() => {
    const productsWithBrands = dbProducts.filter((product) => product.brand)

    return dbBrands
      .map((brand) => {
        const brandProducts = productsWithBrands
          .filter((product) => product.brand?.id === brand.id)
          .slice(0, 8)
          .map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price ?? 0,
            sku: product.sku || '',
            description: product.description,
            stock: product.stock ?? 0,
            image: product.imageUrl || '/showcase/keyboard.png',
            category: product.category?.name || 'Accessory',
          }))

        return {
          id: brand.id,
          name: brand.name,
          logo: brand.logoUrl,
          products: brandProducts,
        }
      })
      .filter((brand) => brand.products.length > 0)
  }, [dbBrands, dbProducts])

  const safeBrandIndex = brands.length === 0 ? 0 : Math.min(activeBrandIndex, brands.length - 1)
  const currentBrand = brands[safeBrandIndex]
  const hasShowcaseData = brands.length > 0 && currentBrand
  const products = useMemo(() => currentBrand?.products ?? [], [currentBrand])
  const safeProductIndex = products.length === 0 ? 0 : Math.min(activeProductIndex, products.length - 1)
  const visibleProducts = useMemo(() => getProductWindow(products, safeProductIndex), [products, safeProductIndex])

  if (loading && brands.length === 0) return null
  if (!hasShowcaseData) return null

  const switchBrand = (index: number) => {
    if (index === safeBrandIndex || transitioning) return

    setTransitioning(true)
    setProductFade('out')

    setTimeout(() => {
      setActiveBrandIndex(index)
      setActiveProductIndex(Math.floor(brands[index].products.length / 2))
      setProductFade('in')

      setTimeout(() => {
        setProductFade('none')
        setTransitioning(false)
      }, 420)
    }, 220)
  }

  const featureProduct = products[safeProductIndex]

  return (
    <section
      id="brand-showcase"
      style={{
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        overflow: 'hidden',
        padding: '92px 0 46px',
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
        background:
          'radial-gradient(circle at top center, rgba(255,40,0,0.12) 0%, transparent 24%), radial-gradient(circle at 0% 100%, rgba(255,40,0,0.06) 0%, transparent 28%), linear-gradient(180deg, var(--background) 0%, var(--surface) 48%, var(--background) 100%)',
      }}
    >
      <style>{`
        .sc-shell {
          width: min(1240px, calc(100vw - 40px));
          margin: 0 auto;
          padding: 0 10px;
        }

        .sc-stage {
          position: relative;
          border: 1px solid color-mix(in srgb, var(--border) 84%, transparent);
          border-radius: 40px;
          padding: 44px 28px 340px;
          overflow: hidden;
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--background) 86%, transparent) 0%, color-mix(in srgb, var(--surface) 98%, transparent) 100%);
          box-shadow:
            0 26px 60px rgba(17, 24, 39, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(18px);
        }

        .sc-stage::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 50% 0%, rgba(255,40,0,0.14), transparent 36%),
            linear-gradient(135deg, rgba(255,255,255,0.05), transparent 36%);
        }

        .sc-brand-ring {
          position: relative;
          height: 360px;
          margin: 8px 0 0;
        }

        .sc-ring-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .sc-brand-button {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition:
            transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.35s ease;
        }

        .sc-brand-button::before {
          content: '';
          position: absolute;
          inset: -6px -8px -10px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,40,0,0.08), transparent 68%);
          opacity: 0;
          transform: scale(0.9);
          transition:
            opacity 0.3s ease,
            transform 0.3s ease;
          pointer-events: none;
        }

        .sc-brand-button:hover::before,
        .sc-brand-button.active::before {
          opacity: 1;
          transform: scale(1);
        }

        .sc-brand-badge {
          width: 72px;
          height: 72px;
          border-radius: 22px;
          border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, rgba(255,255,255,0.04)) 0%, color-mix(in srgb, var(--background) 96%, transparent) 100%);
          box-shadow:
            0 10px 22px rgba(15, 23, 42, 0.07),
            inset 0 1px 0 rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          transition:
            transform 0.35s ease,
            border-color 0.35s ease,
            box-shadow 0.35s ease,
            background 0.35s ease;
        }

        .sc-brand-badge::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.08), transparent 36%),
            radial-gradient(circle at 85% 100%, rgba(255,40,0,0.08), transparent 32%);
          pointer-events: none;
        }

        .sc-brand-button:hover .sc-brand-badge {
          transform: translateY(-1px);
          border-color: rgba(255,40,0,0.22);
          box-shadow:
            0 14px 26px rgba(15, 23, 42, 0.1),
            0 0 0 4px rgba(255,40,0,0.05);
        }

        .sc-brand-button.active .sc-brand-badge {
          transform: translateY(-2px) scale(1.04);
          border-color: rgba(255,40,0,0.38);
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--surface) 88%, rgba(255,40,0,0.08)) 0%, color-mix(in srgb, var(--background) 94%, rgba(255,40,0,0.04)) 100%);
          box-shadow:
            0 14px 28px rgba(255,40,0,0.14),
            0 0 0 6px rgba(255,40,0,0.08);
        }

        .sc-brand-logo {
          width: 42px;
          height: 42px;
          object-fit: contain;
          filter: saturate(1) contrast(1.02);
          position: relative;
          z-index: 1;
          transition:
            transform 0.35s ease,
            filter 0.35s ease,
            opacity 0.35s ease;
        }

        .sc-brand-button:hover .sc-brand-logo {
          transform: scale(1.04);
        }

        .sc-brand-button.active .sc-brand-logo {
          transform: scale(1.06);
        }

        .sc-brand-fallback {
          font-size: 24px;
          font-weight: 900;
          color: var(--foreground);
          letter-spacing: -0.04em;
          position: relative;
          z-index: 1;
        }

        .sc-brand-name {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-dim);
          max-width: 88px;
          text-align: center;
          line-height: 1.3;
          padding: 0;
          border: none;
          background: transparent;
          box-shadow: none;
          transition:
            color 0.3s ease,
            opacity 0.3s ease;
        }

        .sc-brand-button.active .sc-brand-name {
          color: var(--foreground);
          opacity: 1;
        }

        .sc-products-stage {
          position: relative;
          height: 470px;
          margin-bottom: 10px;
          opacity: 1;
          transform: translateY(0);
          transition:
            opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sc-products-stage.fade-out {
          opacity: 0;
          transform: translateY(14px);
        }

        .sc-product-link {
          position: absolute;
          top: 16px;
          left: 50%;
          width: min(34vw, 300px);
          text-decoration: none;
          color: inherit;
          transition:
            transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.35s ease,
            filter 0.35s ease;
        }

        .sc-product-card {
          height: 100%;
          min-height: 390px;
          border-radius: 28px;
          border: 1px solid color-mix(in srgb, var(--border) 84%, transparent);
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--background) 98%, transparent) 0%, color-mix(in srgb, var(--surface) 98%, transparent) 100%);
          overflow: hidden;
          box-shadow:
            0 22px 46px rgba(15, 23, 42, 0.12),
            inset 0 1px 0 rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          transition:
            transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .sc-product-link:hover .sc-product-card {
          border-color: rgba(255,40,0,0.42);
          box-shadow:
            0 28px 56px rgba(255,40,0,0.14),
            0 10px 30px rgba(15, 23, 42, 0.12);
        }

        .sc-product-media {
          position: relative;
          height: 214px;
          padding: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 50% 10%, rgba(255,40,0,0.14), transparent 58%),
            linear-gradient(180deg, color-mix(in srgb, var(--surface) 90%, transparent) 0%, color-mix(in srgb, var(--background) 100%, transparent) 100%);
        }

        .sc-product-link.featured .sc-product-media {
          height: 264px;
        }

        .sc-product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 18px 18px rgba(15, 23, 42, 0.18));
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sc-product-link:hover .sc-product-image {
          transform: scale(1.05);
        }

        .sc-product-chip {
          position: absolute;
          top: 18px;
          left: 18px;
          padding: 7px 12px;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--border) 84%, transparent);
          background: color-mix(in srgb, var(--background) 92%, transparent);
          color: var(--foreground);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .sc-product-content {
          flex: 1;
          padding: 22px 22px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sc-product-kicker {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-dim);
        }

        .sc-product-title {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
          line-height: 1.35;
          color: var(--foreground);
          letter-spacing: -0.03em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sc-product-link.featured .sc-product-title {
          font-size: 21px;
        }

        .sc-product-desc {
          margin: 0;
          font-size: 13px;
          line-height: 1.65;
          color: var(--text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sc-product-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-top: 10px;
        }

        .sc-price {
          font-size: 19px;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--foreground);
        }

        .sc-product-link.featured .sc-price {
          font-size: 24px;
        }

        .sc-add-button {
          border: none;
          border-radius: 14px;
          padding: 11px 18px;
          background: linear-gradient(135deg, #ff2800 0%, #ff5b36 100%);
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 10px 22px rgba(255,40,0,0.22);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .sc-add-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(255,40,0,0.28);
        }

        .sc-add-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
          background: color-mix(in srgb, var(--surface) 90%, transparent);
          color: var(--text-dim);
          box-shadow: none;
          border: 1px solid color-mix(in srgb, var(--border) 84%, transparent);
        }

        .sc-brand-meta {
          margin-top: 22px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          color: var(--text-dim);
          font-size: 13px;
          text-align: center;
        }

        .sc-brand-meta strong {
          color: var(--foreground);
        }

        .sc-brand-meta-dot {
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: rgba(255,40,0,0.45);
        }

        .dark .sc-stage {
          box-shadow:
            0 26px 60px rgba(0, 0, 0, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        @media (max-width: 1100px) {
          .sc-stage {
            padding-bottom: 320px;
          }

          .sc-products-stage {
            height: 430px;
          }

          .sc-product-link {
            width: min(32vw, 264px);
          }
        }

        @media (max-width: 860px) {
          .sc-stage {
            padding: 34px 18px 26px;
          }

          .sc-products-stage {
            height: auto;
            display: grid;
            grid-template-columns: 1fr;
            gap: 18px;
            margin-bottom: 28px;
          }

          .sc-product-link {
            position: relative;
            top: auto;
            left: auto;
            width: 100%;
            transform: none !important;
            opacity: 1 !important;
          }

          .sc-product-card,
          .sc-product-link.featured .sc-product-card {
            min-height: 0;
          }

          .sc-product-media,
          .sc-product-link.featured .sc-product-media {
            height: 220px;
          }

          .sc-brand-ring {
            height: auto;
            display: flex;
            gap: 14px;
            overflow-x: auto;
            padding: 10px 2px 6px;
            scroll-snap-type: x proximity;
          }

          .sc-ring-svg {
            display: none;
          }

          .sc-brand-button {
            position: relative;
            left: auto !important;
            top: auto !important;
            transform: none !important;
            opacity: 1 !important;
            z-index: auto !important;
            flex: 0 0 auto;
            scroll-snap-align: center;
          }

          .sc-brand-badge {
            width: 62px;
            height: 62px;
            border-radius: 18px;
          }

          .sc-brand-logo {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>

      <div className="sc-shell">
        <div
          style={{
            textAlign: 'center',
            marginBottom: 34,
            padding: '0 8px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--brand-red)',
              marginBottom: 14,
            }}
          >
            <span style={{ width: 26, height: 2, background: 'var(--brand-red)', borderRadius: 999 }} />
            Gaming Gear
            <span style={{ width: 26, height: 2, background: 'var(--brand-red)', borderRadius: 999 }} />
          </div>

          <h2
            style={{
              fontSize: 'clamp(30px, 4.2vw, 46px)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              color: 'var(--foreground)',
              margin: '0 0 10px',
              lineHeight: 1.05,
            }}
          >
            Premium Accessories
          </h2>

          <p
            style={{
              fontSize: 14,
              color: 'var(--text-dim)',
              margin: 0,
              maxWidth: 560,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.65,
            }}
          >
            Browse each brand on the arc below and bring its gear into focus with one oversized product in the center.
          </p>
        </div>

        <div className="sc-stage">
          <div className={`sc-products-stage ${productFade === 'out' ? 'fade-out' : ''}`}>
            {visibleProducts.map(({ product, offset }) => {
              const isFeatured = offset === 0
              const absOffset = Math.abs(offset)
              const translateX = offset * 220
              const translateY = isFeatured ? 0 : absOffset === 1 ? 38 : 66
              const scale = isFeatured ? 1 : absOffset === 1 ? 0.9 : 0.78
              const opacity = isFeatured ? 1 : absOffset === 1 ? 0.88 : 0.62
              const zIndex = isFeatured ? 5 : 5 - absOffset

              return (
                <Link
                  key={`${currentBrand.id}-${product.id}-${offset}`}
                  href={`/product-page/${product.id}`}
                  className={`sc-product-link ${isFeatured ? 'featured' : ''}`}
                  onClick={(event) => {
                    if (!isFeatured) {
                      event.preventDefault()
                      setActiveProductIndex(products.findIndex((item) => item.id === product.id))
                    }
                  }}
                  style={{
                    transform: `translateX(calc(-50% + ${translateX}px)) translateY(${translateY}px) scale(${scale})`,
                    opacity,
                    zIndex,
                    filter: isFeatured ? 'none' : 'saturate(0.88)',
                  }}
                >
                  <article className="sc-product-card">
                    <div className="sc-product-media">
                      <img className="sc-product-image" src={product.image} alt={product.name} />
                      <span className="sc-product-chip">{product.category}</span>
                    </div>

                    <div className="sc-product-content">
                      <div className="sc-product-kicker">{product.sku || currentBrand.name}</div>
                      <h3 className="sc-product-title">{product.name}</h3>

                      {product.description && <p className="sc-product-desc">{product.description}</p>}

                      <div className="sc-product-footer">
                        <span className="sc-price">TND {product.price.toFixed(2)}</span>

                        <button
                          className="sc-add-button"
                          disabled={product.stock === 0}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            addItem(product.id, 1, {
                              productId: product.id,
                              name: product.name,
                              price: product.price,
                              imageUrl: product.image,
                              sku: product.sku,
                            })
                          }}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Bag +'}
                        </button>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>

          <div className="sc-brand-ring">
            <svg className="sc-ring-svg" viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M120 78C252 262 748 262 880 78"
                fill="none"
                stroke="rgba(255,40,0,0.18)"
                strokeWidth="2"
                strokeDasharray="6 10"
              />
              <path
                d="M190 60C308 210 692 210 810 60"
                fill="none"
                stroke="rgba(255,40,0,0.08)"
                strokeWidth="1.5"
              />
            </svg>

            {brands.map((brand, index) => {
              const offset = getCircularOffset(index, safeBrandIndex, brands.length)
              const brandStyle = getBrandArcStyle(offset, brands.length)
              const isActive = index === safeBrandIndex

              return (
                <button
                  key={brand.id}
                  type="button"
                  className={`sc-brand-button ${isActive ? 'active' : ''}`}
                  style={brandStyle}
                  onClick={() => switchBrand(index)}
                  aria-pressed={isActive}
                  aria-label={`Show ${brand.name} products`}
                >
                  <span className="sc-brand-badge">
                    {brand.logo ? (
                      <img className="sc-brand-logo" src={brand.logo} alt={brand.name} />
                    ) : (
                      <span className="sc-brand-fallback">{brand.name.charAt(0)}</span>
                    )}
                  </span>
                  <span className="sc-brand-name">{brand.name}</span>
                </button>
              )
            })}
          </div>

          {featureProduct && (
            <div className="sc-brand-meta">
              <strong>{currentBrand.name}</strong>
              <span className="sc-brand-meta-dot" />
              <span>{products.length} products in spotlight</span>
              <span className="sc-brand-meta-dot" />
              <span>Tap a side product to bring it to the center</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

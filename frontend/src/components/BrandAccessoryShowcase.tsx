'use client'

import { useEffect, useState, type CSSProperties } from 'react'

interface Product {
  id: string
  name: string
  price: string
  image: string
  category: string
}

interface Brand {
  id: string
  name: string
  logo: string
  products: Product[]
}

const brands: Brand[] = [
  {
    id: 'msi',
    name: 'MSI',
    logo: 'https://storage-asset.msi.com/event/spb/2017/InfiniteA_H5page/images/logo.png',
    products: [
      { id: 'msi-1', name: 'MSI MEG Trident X2', price: '2,499', image: '/showcase/pc-case.png', category: 'PC Case' },
      { id: 'msi-2', name: 'MSI Optix MAG274QRF', price: '449', image: '/showcase/monitor.png', category: 'Monitor' },
      { id: 'msi-3', name: 'MSI Vigor GK71 Sonic', price: '129', image: '/showcase/keyboard.png', category: 'Keyboard' },
      { id: 'msi-4', name: 'MSI Immerse GH50', price: '59', image: '/showcase/headset.png', category: 'Headset' },
      { id: 'msi-5', name: 'MSI Clutch GM41', price: '49', image: '/showcase/mouse.png', category: 'Mouse' },
    ],
  },
  {
    id: 'redragon',
    name: 'Redragon',
    logo: 'https://redragonshop.com/cdn/shop/files/redragon-logo-text.png?v=1726780948&width=200',
    products: [
      { id: 'rd-1', name: 'Redragon GC-700 Chassis', price: '189', image: '/showcase/pc-case.png', category: 'PC Case' },
      { id: 'rd-2', name: 'Redragon Mirror GM-24G5F', price: '279', image: '/showcase/monitor.png', category: 'Monitor' },
      { id: 'rd-3', name: 'Redragon K556 Devarajas', price: '59', image: '/showcase/keyboard.png', category: 'Keyboard' },
      { id: 'rd-4', name: 'Redragon H510 Zeus', price: '39', image: '/showcase/headset.png', category: 'Headset' },
      { id: 'rd-5', name: 'Redragon M913 Impact', price: '34', image: '/showcase/mouse.png', category: 'Mouse' },
    ],
  },
  {
    id: 'lenovo',
    name: 'Lenovo',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Lenovo_logo_2015.svg/2560px-Lenovo_logo_2015.svg.png',
    products: [
      { id: 'ln-1', name: 'Lenovo Legion Tower 7i', price: '2,199', image: '/showcase/pc-case.png', category: 'PC Case' },
      { id: 'ln-2', name: 'Lenovo Legion Y27q-30', price: '399', image: '/showcase/monitor.png', category: 'Monitor' },
      { id: 'ln-3', name: 'Lenovo Legion K500', price: '89', image: '/showcase/keyboard.png', category: 'Keyboard' },
      { id: 'ln-4', name: 'Lenovo Legion H600', price: '79', image: '/showcase/headset.png', category: 'Headset' },
      { id: 'ln-5', name: 'Lenovo Legion M600s', price: '59', image: '/showcase/mouse.png', category: 'Mouse' },
    ],
  },
  {
    id: 'logitech',
    name: 'Logitech',
    logo: 'https://companieslogo.com/img/orig/LOGI_BIG.D-3f288e21.png?t=1720244492',
    products: [
      { id: 'lg-1', name: 'Logitech G PC Tower', price: '1,899', image: '/showcase/pc-case.png', category: 'PC Case' },
      { id: 'lg-2', name: 'Logitech G Pro X27', price: '499', image: '/showcase/monitor.png', category: 'Monitor' },
      { id: 'lg-3', name: 'Logitech G Pro X TKL', price: '199', image: '/showcase/keyboard.png', category: 'Keyboard' },
      { id: 'lg-4', name: 'Logitech G Pro X 2', price: '249', image: '/showcase/headset.png', category: 'Headset' },
      { id: 'lg-5', name: 'Logitech G Pro X Superlight', price: '159', image: '/showcase/mouse.png', category: 'Mouse' },
    ],
  },
  {
    id: 'razer',
    name: 'Razer',
    logo: 'https://www.svgrepo.com/show/306644/razer.svg',
    products: [
      { id: 'rz-1', name: 'Razer Tomahawk ATX', price: '299', image: '/showcase/pc-case.png', category: 'PC Case' },
      { id: 'rz-2', name: 'Razer Raptor 27 QHD', price: '799', image: '/showcase/monitor.png', category: 'Monitor' },
      { id: 'rz-3', name: 'Razer Huntsman V3 Pro', price: '249', image: '/showcase/keyboard.png', category: 'Keyboard' },
      { id: 'rz-4', name: 'Razer Kraken V4 Pro', price: '399', image: '/showcase/headset.png', category: 'Headset' },
      { id: 'rz-5', name: 'Razer DeathAdder V3 Pro', price: '89', image: '/showcase/mouse.png', category: 'Mouse' },
    ],
  },
]

export default function BrandAccessoryShowcase() {
  const [activeBrandIndex, setActiveBrandIndex] = useState(2)
  const [centerProductIndex, setCenterProductIndex] = useState(2)
  const [transitioning, setTransitioning] = useState(false)
  const [productFade, setProductFade] = useState<'in' | 'out' | 'none'>('none')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentBrand = brands[activeBrandIndex]
  const products = currentBrand.products

  const switchBrand = (index: number) => {
    if (index === activeBrandIndex || transitioning) return
    setTransitioning(true)
    setProductFade('out')

    setTimeout(() => {
      setActiveBrandIndex(index)
      setCenterProductIndex(0)
      setProductFade('in')

      setTimeout(() => {
        setProductFade('none')
        setTransitioning(false)
      }, 450)
    }, 260)
  }

  const switchProduct = (index: number) => {
    if (index === centerProductIndex || transitioning) return
    setTransitioning(true)
    setProductFade('out')

    setTimeout(() => {
      setCenterProductIndex(index)
      setProductFade('in')

      setTimeout(() => {
        setProductFade('none')
        setTransitioning(false)
      }, 380)
    }, 220)
  }

  const getProductPosition = (index: number) => index - centerProductIndex
  const getBrandPosition = (index: number) => index - activeBrandIndex

  const getProductCardStyle = (index: number): CSSProperties => {
    const position = getProductPosition(index)
    const absPos = Math.abs(position)
    const isCenter = position === 0

    return {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(calc(-50% + ${position * 300}px), calc(-50% + ${isCenter ? 0 : absPos === 1 ? 24 : 42}px)) scale(${isCenter ? 1.04 : absPos === 1 ? 0.86 : 0.72})`,
      zIndex: isCenter ? 10 : 5 - absPos,
      opacity: productFade === 'out' ? 0 : absPos > 2 ? 0 : 1,
      transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      cursor: isCenter ? 'default' : 'pointer',
      pointerEvents: absPos > 2 ? 'none' : 'auto',
    }
  }

  if (!mounted) return null

  return (
    <section
      id="brand-showcase"
      style={{
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        overflow: 'hidden',
        padding: '88px 0 38px',
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
        background:
          'radial-gradient(circle at top center, rgba(255,40,0,0.08) 0%, transparent 32%), linear-gradient(180deg, var(--background) 0%, var(--surface) 56%, var(--background) 100%)',
      }}
    >
      <style>{`
        @keyframes scPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }

        .sc-brand-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px 14px;
          border: none;
          border-bottom: 2px solid transparent;
          background: transparent;
          transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          white-space: nowrap;
        }

        .sc-brand-pill:hover {
          border-bottom-color: rgba(255,40,0,0.35);
          transform: translateY(-3px);
        }

        .sc-brand-pill.active {
          border-bottom-color: var(--brand-red);
        }

        .sc-brand-logo {
          height: 22px;
          object-fit: contain;
          transition: all 0.3s ease;
        }

        .dark .sc-brand-logo {
          filter: grayscale(1) brightness(0) invert(1);
          opacity: 0.55;
        }

        :root .sc-brand-logo {
          filter: grayscale(1) brightness(0.22);
          opacity: 0.5;
        }

        .sc-brand-pill.active .sc-brand-logo {
          opacity: 1 !important;
        }

        .dark .sc-brand-pill.active .sc-brand-logo {
          filter: brightness(0) invert(1) !important;
        }

        :root .sc-brand-pill.active .sc-brand-logo {
          filter: none !important;
        }

        .sc-brand-name {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: color 0.2s;
        }

        .dark .sc-brand-name { color: rgba(255,255,255,0.45); }
        :root .sc-brand-name { color: rgba(0,0,0,0.36); }
        .sc-brand-pill.active .sc-brand-name { color: var(--foreground) !important; }

        .sc-product-card {
          width: 285px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--background);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sc-product-card:hover {
          border-color: var(--brand-red);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(255,40,0,0.08);
          transform: translateY(-4px) !important;
        }

        .sc-product-card.center-card {
          width: 340px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,40,0,0.08);
        }

        .sc-product-img-wrap {
          position: relative;
          height: 250px;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .sc-product-card.center-card .sc-product-img-wrap {
          height: 310px;
        }

        .sc-product-img-wrap img {
          width: 82%;
          height: 82%;
          object-fit: contain;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          filter: drop-shadow(0 0 10px rgba(0,0,0,0.1));
        }

        .sc-product-card:hover .sc-product-img-wrap img {
          transform: scale(1.06);
        }

        .sc-product-category-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          background: var(--background);
          color: var(--foreground);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.02em;
          padding: 5px 12px;
          border-radius: 30px;
          border: 1px solid var(--border);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .sc-product-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sc-stage-fill { fill: #f4efef; }
        .dark .sc-stage-fill { fill: #121212; }
        .sc-stage-stroke { stroke: rgba(0,0,0,0.06); }
        .dark .sc-stage-stroke { stroke: rgba(255,255,255,0.08); }
        .sc-stage-inner-stroke { stroke: rgba(0,0,0,0.03); }
        .dark .sc-stage-inner-stroke { stroke: rgba(255,40,0,0.04); }

        .sc-nav-btn {
          position: absolute;
          z-index: 30;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }

        .sc-nav-btn:hover {
          border-color: var(--brand-red);
          box-shadow: 0 8px 24px rgba(255,40,0,0.15);
        }

        @media (max-width: 1100px) {
          .sc-product-card { width: 220px !important; }
          .sc-product-card.center-card { width: 270px !important; }
          .sc-product-img-wrap { height: 180px !important; }
          .sc-product-card.center-card .sc-product-img-wrap { height: 220px !important; }
        }

        @media (max-width: 768px) {
          .sc-product-card { width: 180px !important; }
          .sc-product-card.center-card { width: 220px !important; }
          .sc-product-img-wrap { height: 140px !important; }
          .sc-product-card.center-card .sc-product-img-wrap { height: 170px !important; }
          .sc-brand-pill { gap: 8px !important; padding-bottom: 12px !important; }
          .sc-brand-logo { height: 18px !important; }
          .sc-brand-name { font-size: 10px !important; }
        }
      `}</style>

      <div
        style={{
          textAlign: 'center',
          marginBottom: 48,
          padding: '0 40px',
          position: 'relative',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--brand-red)',
            marginBottom: 14,
          }}
        >
          <span style={{ width: 24, height: 2, background: 'var(--brand-red)', borderRadius: 2 }} />
          Gaming Gear
          <span style={{ width: 24, height: 2, background: 'var(--brand-red)', borderRadius: 2 }} />
        </div>

        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: 'var(--foreground)',
            margin: '0 0 8px',
            lineHeight: 1.1,
          }}
        >
          Premium Accessories
        </h2>

        <p
          style={{
            fontSize: 14,
            color: 'var(--text-dim)',
            margin: 0,
            maxWidth: 460,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}
        >
          Explore top-tier peripherals from the world&apos;s leading gaming brands
        </p>
      </div>

      <div style={{ position: 'relative', width: '100%', height: 430, marginBottom: 64 }}>
        <button
          className="sc-nav-btn"
          onClick={() => switchProduct((centerProductIndex - 1 + products.length) % products.length)}
          style={{ left: 40, top: '50%', transform: 'translateY(-50%)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          className="sc-nav-btn"
          onClick={() => switchProduct((centerProductIndex + 1) % products.length)}
          style={{ right: 40, top: '50%', transform: 'translateY(-50%)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {products.map((product, i) => {
            const position = getProductPosition(i)
            const isCenter = position === 0

            return (
              <div key={product.id} style={getProductCardStyle(i)} onClick={() => !isCenter && switchProduct(i)}>
                <div className={`sc-product-card ${isCenter ? 'center-card' : ''}`}>
                  <div className="sc-product-img-wrap">
                    <img src={product.image} alt={product.name} />
                    <span className="sc-product-category-tag">{product.category}</span>
                  </div>

                  <div className="sc-product-info">
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-dim)',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {currentBrand.name}
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: isCenter ? 16 : 14,
                        fontWeight: 800,
                        color: 'var(--foreground)',
                        lineHeight: 1.4,
                        letterSpacing: '-0.02em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.name}
                    </p>

                    <div
                      style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: isCenter ? 22 : 18,
                          fontWeight: 900,
                          color: 'var(--foreground)',
                          letterSpacing: '-0.04em',
                        }}
                      >
                        DTN {product.price}
                      </span>

                      {isCenter && (
                        <button
                          style={{
                            background: 'var(--brand-red)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(255,40,0,0.2)',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          Add to Bag +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            zIndex: 20,
          }}
        >
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => switchProduct(i)}
              style={{
                width: i === centerProductIndex ? 28 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === centerProductIndex ? 'var(--brand-red)' : 'var(--border)',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: 350 }}>
        <svg
          viewBox="0 0 1400 350"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="scStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,40,0,0)" />
              <stop offset="25%" stopColor="rgba(255,40,0,0.16)" />
              <stop offset="50%" stopColor="rgba(255,40,0,0.28)" />
              <stop offset="75%" stopColor="rgba(255,40,0,0.16)" />
              <stop offset="100%" stopColor="rgba(255,40,0,0)" />
            </linearGradient>
          </defs>

          <ellipse className="sc-stage-fill" cx="700" cy="350" rx="730" ry="325" />
          <ellipse className="sc-stage-stroke" cx="700" cy="350" rx="730" ry="325" fill="none" stroke="url(#scStroke)" strokeWidth="1.5" />
          <ellipse className="sc-stage-inner-stroke" cx="700" cy="356" rx="610" ry="275" fill="none" strokeWidth="0.5" />
          <ellipse className="sc-stage-inner-stroke" cx="700" cy="362" rx="490" ry="224" fill="none" strokeWidth="0.5" />

          {[...Array(9)].map((_, i) => (
            <line
              key={i}
              x1={200 + i * 125}
              y1="56"
              x2={200 + i * 125}
              y2="350"
              stroke="rgba(255,40,0,0.02)"
              strokeWidth="0.5"
            />
          ))}
        </svg>

        <div
          style={{
            position: 'absolute',
            bottom: 36,
            left: 0,
            right: 0,
            height: 300,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
          >
            {brands.map((brand, i) => {
              const position = getBrandPosition(i)
              const absPos = Math.abs(position)
              const isCenter = position === 0
              const angleRad = ((position * 20) * Math.PI) / 180
              const arcRadius = 360
              const xOffset = Math.sin(angleRad) * arcRadius
              const yOffset = (1 - Math.cos(angleRad)) * arcRadius * 0.58

              return (
                <div
                  key={brand.id}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 12,
                    transform: `translateX(calc(-50% + ${xOffset}px)) translateY(${-yOffset}px) scale(${isCenter ? 1.1 : absPos === 1 ? 0.9 : 0.74})`,
                    zIndex: isCenter ? 10 : 5 - absPos,
                    opacity: absPos > 2 ? 0.18 : 1,
                    transition: 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                    pointerEvents: absPos > 2 ? 'none' : 'auto',
                  }}
                  onClick={() => switchBrand(i)}
                >
                  <div className={`sc-brand-pill ${isCenter ? 'active' : ''}`}>
                    <img src={brand.logo} alt={brand.name} className="sc-brand-logo" />
                    <span className="sc-brand-name">{brand.name}</span>
                    {isCenter && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--brand-red)',
                          animation: 'scPulse 2s ease-in-out infinite',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button className="sc-nav-btn" onClick={() => switchBrand((activeBrandIndex - 1 + brands.length) % brands.length)} style={{ left: '8%', bottom: 66 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <button className="sc-nav-btn" onClick={() => switchBrand((activeBrandIndex + 1) % brands.length)} style={{ right: '8%', bottom: 66 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}

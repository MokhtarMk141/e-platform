'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useCart } from '@/hooks/useCart'
import { ReviewService } from '@/services/review.service'
import { TopRatedProduct } from '@/types/product.types'
import MegaMenu from '../mega-menu/megaMenu'
import BrandAccessoryShowcase from '@/components/BrandAccessoryShowcase'
import { HomepageConfigService, HeroSlide } from '@/services/homepage-config.service'
import { PromotionService } from '@/services/promotion.service'
import './homepage.css'

const logos = [
  { src: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg', alt: 'Intel' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/NVIDIA_logo_white.svg/3840px-NVIDIA_logo_white.svg.png', alt: 'NVIDIA' },
  { src: 'https://media.johnlewiscontent.com/i/JohnLewis/amd_brl_white?fmt=auto&$alpha$', alt: 'AMD' },
  { src: 'https://www.pngplay.com/wp-content/uploads/13/Corsair-PNG-HD-Quality.png', alt: 'Corsair' },
  { src: 'https://www.svgrepo.com/show/306644/razer.svg', alt: 'Razer' },
  { src: 'https://www.freepnglogos.com/uploads/logo-asus-png/asus-white-logo-png-22.png', alt: 'ASUS' },
  { src: 'https://storage-asset.msi.com/event/spb/2017/InfiniteA_H5page/images/logo.png', alt: 'MSI' },
  { src: 'https://companieslogo.com/img/orig/LOGI_BIG.D-3f288e21.png?t=1720244492', alt: 'Logitech' },
]

const categoryImages: Record<string, string> = {
  cpu: 'https://media.materiel.net/nbo/matnet/buying-guide-page/processeur/processeur-15.jpg',
  gpu: 'https://global.aorus.com/upload/Admin/images/RTX3080_max_cover_cooling.jpg',
  ram: 'https://cdn.mos.cms.futurecdn.net/GFukx5y3yrGrBthhPcnBwL.jpg',
  storage: 'https://hyperpc.ae/images/support/articles/how-to-increase-storage-space-on-a-pc/how-to-choose-an-ssd-banner_webp.jpg',
  psu: 'https://www.bargainhardware.co.uk/wp/wp-content/uploads/2024/06/7ME636bQNGEGGrg5qEtWrK-1-scaled.jpg',
  case: 'https://cdn.deepcool.com/public/Global-images/products/Cases/2025/05/CH690_DIGITAL_1.jpg?fm=webp&q=60',
  cooling: 'https://dlcdnwebimgs.asus.com/files/media/A88CF078-6931-4BD6-80AF-F60DA9C6A4B5/v1/img/compatibility.jpg',
  monitor: 'https://oasis.opstatics.com/content/dam/oasis/page/frankfurt/27-share.jpg',
  keyboard: 'https://assets2.razerzone.com/images/pnx.assets/935c8e83ae6a5092102e5134acd0a335/ergonomic-wrist-rest.webp',
  mouse: 'https://static0.thegamerimages.com/wordpress/wp-content/uploads/2025/07/razer-hyperflux-v2-on-black-background.jpg?w=1600&h=900&fit=crop',
  headset: 'https://assets2.razerzone.com/images/gaming-audio/headsets-audio-category.png',
  default: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80&fit=crop',
}
const getCategoryImage = (n: string) => {
  const l = n.toLowerCase()
  for (const k of Object.keys(categoryImages)) { if (l.includes(k)) return categoryImages[k] }
  return categoryImages.default
}

/* ── Reusable Product Card matching product-page GridCard ── */
function ProductCard({ product, delay }: { product: any; delay: number }) {
  const [hovered, setHovered] = useState(false)
  const { addItem } = useCart()
  return (
    <Link href={`/product-page/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="hp-product-card" style={{
        border: `1px solid ${hovered ? 'var(--brand-red)' : 'var(--border)'}`,
        animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${delay * 80}ms both`,
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(255,40,0,0.08)' : '0 4px 12px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}>
        <div className="hp-product-media">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{
              width: '80%', height: '80%', objectFit: 'contain',
              transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
              filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.1))',
            }} />
          ) : (<div style={{ fontSize: 48, opacity: 0.1, color: 'var(--foreground)' }}>◈</div>)}
          {product.category && (
            <span className="hp-product-chip">{product.category.name}</span>
          )}
          {product.stock === 0 && (
            <div className="hp-product-sold-overlay">
              <span className="hp-product-sold-badge">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="hp-product-body">
          <div className="hp-product-sku">{product.sku}</div>
          <p className="hp-product-name">{product.name}</p>
          {product.description && (
            <p className="hp-product-desc">{product.description}</p>
          )}
          <div className="hp-product-footer">
            <span className="hp-product-price">
              DTN {product.price?.toFixed(2) ?? '0.00'}
            </span>
            <button disabled={product.stock === 0} onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product.id, 1, { productId: product.id, name: product.name, price: product.price ?? 0, imageUrl: product.imageUrl ?? null, sku: product.sku }) }}
              className={`hp-add-btn ${product.stock === 0 ? 'hp-add-btn--disabled' : ''}`}
              style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(10px)', visibility: hovered ? 'visible' : 'hidden' }}>
              {product.stock === 0 ? 'Sold' : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Arrow Icon helper ── */
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
)

export default function HomePage() {
  const router = useRouter()
  const { categories } = useCategories()
  const { products: newestProducts } = useProducts({ sortBy: 'newest', limit: 8 })
  const { products: fallbackPopular } = useProducts({ sortBy: 'featured', limit: 8 })

  // Fetch top-rated products from review API
  const [topRatedProducts, setTopRatedProducts] = useState<TopRatedProduct[]>([])
  useEffect(() => {
    ReviewService.getTopRatedProducts(8)
      .then(res => { if (res.data?.length) setTopRatedProducts(res.data) })
      .catch(() => { /* use fallback */ })
  }, [])

  // Use top-rated if available, otherwise fallback to featured
  const popularProducts = topRatedProducts.length > 0 ? topRatedProducts : fallbackPopular

  const storefrontCategories = useMemo(
    () => categories.filter(c => (c.productCount ?? 0) > 0),
    [categories]
  )

  /* Hero slider for main banner — fetched from API */
  const DEFAULT_HERO_SLIDES: HeroSlide[] = [
    { title: 'Upgrade Your\nGaming Setup', subtitle: 'Discover the latest GPUs, processors, and accessories at unbeatable prices.', buttonText: 'Shop Now', buttonLink: '/product-page', imageUrl: 'https://dlcdnwebimgs.asus.com/gain/9AC8BE01-2A3C-4E58-93E3-FD06B6B51FDF/w717/h525/q87/fwebp' },
    { title: 'Next-Gen\nComponents', subtitle: 'Be the first to get the latest CPUs, SSDs, and DDR5 memory kits.', buttonText: 'Explore', buttonLink: '/product-page', imageUrl: 'https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2505603-ryzen-9-702702-702703.jpg' },
    { title: 'Build Your\nDream PC', subtitle: 'Let our AI assistant help you discover parts that fit your setup and budget.', buttonText: 'Build with AI', buttonLink: '/build-with-ai', imageUrl: 'https://cdn.deepcool.com/public/Global-images/products/Cases/2025/05/CH690_DIGITAL_1.jpg?fm=webp&q=60' },
  ]
  const [heroIdx, setHeroIdx] = useState(0)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES)
  useEffect(() => {
    HomepageConfigService.get()
      .then(config => { if (config.heroSlides?.length) setHeroSlides(config.heroSlides) })
      .catch(() => { /* keep defaults */ })
  }, [])
  useEffect(() => { const t = setInterval(() => setHeroIdx(p => (p + 1) % heroSlides.length), 5500); return () => clearInterval(t) }, [heroSlides.length])

  /* Active Flash Sale */
  const [activeFlashSale, setActiveFlashSale] = useState<any>(null)
  useEffect(() => {
    PromotionService.getActivePromotions()
      .then(res => {
        if (res.flashSales && res.flashSales.length > 0) {
          setActiveFlashSale(res.flashSales[0])
        }
      })
      .catch(() => { /* ignore */ })
  }, [])

  /* Countdown */
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    if (!activeFlashSale?.endDate) return
    const end = new Date(activeFlashSale.endDate).getTime()
    const t = setInterval(() => {
      const now = new Date().getTime()
      const diff = end - now
      if (diff <= 0) {
        setCd({ d: 0, h: 0, m: 0, s: 0 })
        clearInterval(t)
        return
      }
      setCd({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }, 1000)
    return () => clearInterval(t)
  }, [activeFlashSale])

  const flashProducts = useMemo(() => {
    if (!activeFlashSale || !activeFlashSale.products) return []
    return activeFlashSale.products.map((p: any) => {
      const prod = p.product
      let discounted = prod.price
      if (activeFlashSale.discountType === 'PERCENTAGE') {
        discounted = prod.price * (1 - activeFlashSale.discountValue / 100)
      } else {
        discounted = Math.max(0, prod.price - activeFlashSale.discountValue)
      }
      return { ...prod, price: discounted, originalPrice: prod.price }
    })
  }, [activeFlashSale])

  const hs = heroSlides[heroIdx]

  /* Scroll refs for horizontal carousels */
  const newArrivalsRef = useRef<HTMLDivElement>(null)
  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' })
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>

      <MegaMenu />

      {/* ═══════════ HERO SLIDER (UNTOUCHED) ═══════════ */}
      <section className="hero-full" onClick={() => router.push(hs.buttonLink)} style={{ cursor: 'pointer' }}>
        <div className="hero-main-bg" key={heroIdx} style={{ backgroundImage: `url(${hs.imageUrl})` }} />
        <div className="hero-main-overlay" />
        <div className="hero-full-content">
          <h1 className="hero-main-title">{hs.title}</h1>
          <p className="hero-main-sub">{hs.subtitle}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href={hs.buttonLink} className="hero-main-cta" onClick={e => e.stopPropagation()}>
              {hs.buttonText}
              <ArrowIcon />
            </Link>
            <Link href="/product-page" className="hero-cta-sec" onClick={e => e.stopPropagation()}>
              Browse All Products
            </Link>
          </div>
          <div className="hero-dots">
            {heroSlides.map((_, i) => (<button key={i} className={`hero-dot${i === heroIdx ? ' active' : ''}`} onClick={e => { e.stopPropagation(); setHeroIdx(i) }} />))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES BAR ═══════════ */}
      <div className="vit-features">
        {[
          { title: 'Livraison Rapide', desc: 'Expédition sous 24-48h' },
          { title: 'Garantie Officielle', desc: 'Produits 100% authentiques' },
          { title: 'Paiement Sécurisé', desc: 'Transactions protégées' },
          { title: 'Support 7j/7', desc: 'Assistance technique dédiée' },
        ].map((f, i) => (
          <div key={i} className="vit-feat">
            <div className="vit-feat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l2.5 2.5L16 9" />
              </svg>
            </div>
            <div>
              <p className="vit-feat-title">{f.title}</p>
              <p className="vit-feat-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════ NEW ARRIVALS — Horizontal Scroll ═══════════ */}
      <section className="hp-section">
        <div className="hp-section-header">
          <div>
            <div className="vit-section-badge"><span className="vit-section-badge-line" />New Arrivals</div>
            <h2 className="vit-section-title">Just Dropped</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="hp-scroll-btn" onClick={() => scrollCarousel(newArrivalsRef, 'left')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            </button>
            <button className="hp-scroll-btn" onClick={() => scrollCarousel(newArrivalsRef, 'right')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
            <Link href="/product-page" className="vit-view-all">View All <ArrowIcon /></Link>
          </div>
        </div>
        <div className="hp-carousel" ref={newArrivalsRef}>
          {newestProducts.map((p, i) => (
            <div key={p.id} className="hp-carousel-item">
              <ProductCard product={p} delay={i} />
            </div>
          ))}
        </div>
      </section>

      <div className="vit-divider"><div className="vit-divider-line" /></div>

      {/* ═══════════ CATEGORIES — Feature Style ═══════════ */}
      <section className="hp-section">
        <div className="hp-section-header">
          <div>
            <div className="vit-section-badge"><span className="vit-section-badge-line" />Shop by Category</div>
            <h2 className="vit-section-title">Browse Our Collection</h2>
          </div>
          <Link href="/product-page" className="vit-view-all">View All <ArrowIcon /></Link>
        </div>
        <div className="hp-cat-showcase">
          {storefrontCategories.slice(0, 8).map((cat, i) => (
            <Link key={cat.id} href={`/product-page?category=${encodeURIComponent(cat.name.toLowerCase().replace(/\s+/g, '-'))}`}
              className="hp-cat-card" style={{ animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms both` }}>
              <div className="hp-cat-bg" style={{ backgroundImage: `url(${getCategoryImage(cat.name)})` }} />
              <div className="hp-cat-overlay" />
              <div className="hp-cat-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
              <div className="hp-cat-content">
                <p className="hp-cat-title">{cat.name}</p>
                <p className="hp-cat-count">{cat.productCount} Products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>



      {/* ═══════════ FLASH DEALS ═══════════ */}
      {activeFlashSale && flashProducts.length > 0 && (
        <section className="hp-section">
          <div className="hp-flash-header">
            <div className="hp-flash-left">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="hp-flash-icon">⚡</div>
                <h2 className="vit-section-title" style={{ fontSize: 28 }}>{activeFlashSale.name || 'Flash Deals'}</h2>
              </div>
              {activeFlashSale.endDate && (
                <div className="vit-cd">
                  {[{ v: cd.d, l: 'Days' }, { v: cd.h, l: 'Hrs' }, { v: cd.m, l: 'Min' }, { v: cd.s, l: 'Sec' }].map((c, i) => (
                    <div key={i} className="vit-cd-box"><span className="vit-cd-num">{String(c.v).padStart(2, '0')}</span><span className="vit-cd-lbl">{c.l}</span></div>
                  ))}
                </div>
              )}
            </div>
            <Link href="/product-page" className="vit-view-all">View All <ArrowIcon /></Link>
          </div>
          <div className="vit-pgrid">
            {flashProducts.slice(0, 4).map((p: any, i: number) => <ProductCard key={p.id} product={p} delay={i} />)}
          </div>
        </section>
      )}



      {/* ═══════════ BRAND ACCESSORY SHOWCASE ═══════════ */}
      <BrandAccessoryShowcase />

      {/* ═══════════ POPULAR PRODUCTS ═══════════ */}
      <section className="hp-section">
        <div className="hp-section-header">
          <div>
            <div className="vit-section-badge"><span className="vit-section-badge-line" />{topRatedProducts.length > 0 ? 'Top Rated' : 'Most Popular'}</div>
            <h2 className="vit-section-title">{topRatedProducts.length > 0 ? 'Highest Rated Products' : 'Trending Now'}</h2>
          </div>
          <Link href="/product-page" className="vit-view-all">View All <ArrowIcon /></Link>
        </div>
        <div className="vit-pgrid">
          {popularProducts.slice(0, 8).map((p, i) => (
            <div key={p.id} style={{ position: 'relative' }}>
              <ProductCard product={p} delay={i} />
              {/* Rating badge overlay for top-rated products */}
              {'averageRating' in p && (p as TopRatedProduct).totalReviews > 0 && (
                <div style={{
                  position: 'absolute', top: 12, right: 12, zIndex: 2,
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                  padding: '5px 10px', borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffb800" stroke="#ffb800" strokeWidth="1">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span style={{
                    fontSize: 12, fontWeight: 800, color: '#fff',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {(p as TopRatedProduct).averageRating.toFixed(1)}
                  </span>
                  <span style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.6)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    ({(p as TopRatedProduct).totalReviews})
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      {/* ═══════════ NEWSLETTER ═══════════ */}
      <section className="hp-newsletter">
        <div className="hp-newsletter-inner">
          <div className="hp-newsletter-text">
            <h2 className="hp-newsletter-title">Stay in the Loop</h2>
            <p className="hp-newsletter-desc">Get exclusive deals, new arrivals, and expert build tips delivered to your inbox.</p>
          </div>
          <div className="hp-newsletter-form">
            <input type="email" placeholder="Enter your email address" className="hp-newsletter-input" />
            <button className="hp-newsletter-btn">Subscribe</button>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER BRANDS ═══════════ */}
      <div className="vit-brands">
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          <div className="vit-brands-track" style={{ animationDirection: 'reverse' }}>{[...logos, ...logos, ...logos, ...logos].map((l, i) => <img key={i} src={l.src} alt={l.alt} className="vit-brand-logo" />)}</div>
        </div>
      </div>
    </div>
  )
}

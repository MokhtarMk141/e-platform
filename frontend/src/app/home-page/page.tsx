'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useCart } from '@/hooks/useCart'
import MegaMenu from '../mega-menu/megaMenu'
import BrandAccessoryShowcase from '@/components/BrandAccessoryShowcase'

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

function ProductCard({ product, delay }: { product: any; delay: number }) {
  const [hovered, setHovered] = useState(false)
  const { addItem } = useCart()
  return (
    <Link href={`/product-page/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{
        background: 'var(--background)', border: `1px solid ${hovered ? 'var(--brand-red)' : 'var(--border)'}`,
        borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${delay * 80}ms both`,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(255,40,0,0.08)' : '0 4px 12px rgba(0,0,0,0.04)',
        cursor: 'pointer', transform: hovered ? 'translateY(-6px)' : 'translateY(0)', height: '100%',
      }}>
        <div style={{ position: 'relative', height: 220, background: 'var(--surface)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{
              width: '80%', height: '80%', objectFit: 'contain',
              transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
              filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.1))',
            }} />
          ) : (<div style={{ fontSize: 48, opacity: 0.1, color: 'var(--foreground)' }}>◈</div>)}
          {product.category && (
            <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--background)', backdropFilter: 'blur(8px)', color: 'var(--foreground)', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 30, border: '1px solid var(--border)' }}>
              {product.category.name}
            </span>
          )}
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1.4, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--foreground)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.04em' }}>
              DTN {product.price?.toFixed(2) ?? '0.00'}
            </span>
            <button disabled={product.stock === 0} onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product.id, 1, { productId: product.id, name: product.name, price: product.price ?? 0, imageUrl: product.imageUrl ?? null, sku: product.sku }) }}
              style={{ background: product.stock === 0 ? 'transparent' : 'var(--brand-red)', color: product.stock === 0 ? 'var(--text-dim)' : '#fff', border: product.stock === 0 ? '1px solid var(--border)' : 'none', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: product.stock === 0 ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s', boxShadow: product.stock === 0 ? 'none' : '0 4px 12px rgba(255,40,0,0.2)' }}>
              {product.stock === 0 ? 'Sold Out' : 'Add +'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { categories } = useCategories()
  const { products: newestProducts } = useProducts({ sortBy: 'newest', limit: 8 })
  const { products: popularProducts } = useProducts({ sortBy: 'featured', limit: 8 })
  const storefrontCategories = useMemo(
    () => categories.filter(c => (c.productCount ?? 0) > 0),
    [categories]
  )

  /* Hero slider for main banner */
  const [heroIdx, setHeroIdx] = useState(0)
  const heroSlides = [
    { badge: '🔥 Seasonal Deals', title: 'Upgrade Your\nGaming Setup', sub: 'Discover the latest GPUs, processors & accessories at unbeatable prices.', cta: 'Shop Now', link: '/product-page', img: 'https://dlcdnwebimgs.asus.com/gain/9AC8BE01-2A3C-4E58-93E3-FD06B6B51FDF/w717/h525/q87/fwebp' },
    { badge: '⚡ New Arrivals', title: 'Next-Gen\nComponents', sub: 'Be the first to get the latest CPUs, SSDs, and DDR5 memory kits.', cta: 'Explore', link: '/product-page', img: 'https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2505603-ryzen-9-702702-702703.jpg' },
    { badge: '🤖 AI Builder', title: 'Build Your\nDream PC', sub: 'Let our AI configure the perfect build. Just describe what you need.', cta: 'Build with AI', link: '/build-with-ai', img: 'https://cdn.deepcool.com/public/Global-images/products/Cases/2025/05/CH690_DIGITAL_1.jpg?fm=webp&q=60' },
  ]
  useEffect(() => { const t = setInterval(() => setHeroIdx(p => (p + 1) % heroSlides.length), 5500); return () => clearInterval(t) }, [])

  /* Countdown */
  const [cd, setCd] = useState({ d: 2, h: 13, m: 44, s: 57 })
  useEffect(() => {
    const t = setInterval(() => setCd(p => { let { d, h, m, s } = p; s--; if (s < 0) { s = 59; m-- } if (m < 0) { m = 59; h-- } if (h < 0) { h = 23; d-- } if (d < 0) return { d: 0, h: 0, m: 0, s: 0 }; return { d, h, m, s } }), 1000)
    return () => clearInterval(t)
  }, [])

  const hs = heroSlides[heroIdx]

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scrollBrands { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
        @keyframes pulseGlow { 0%,100% { opacity:.4; transform:scale(1); } 50% { opacity:.7; transform:scale(1.05); } }
        @keyframes heroFade { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; }
        ::selection { background:var(--brand-red); color:#fff; }

        /* ── Full-Width Hero ── */
        .hero-full { position:relative; width:100%; min-height:520px; overflow:hidden; display:flex; align-items:center; }
        .hero-main-bg { position:absolute; inset:0; background-size:cover; background-position:center; transition:opacity 0.8s ease, transform 12s ease; animation:heroZoom 12s ease forwards; }
        @keyframes heroZoom { from { transform:scale(1); } to { transform:scale(1.06); } }
        .hero-main-overlay { position:absolute; inset:0; background:linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.15) 100%); z-index:2; }
        .hero-full-content { position:relative; z-index:3; max-width:1400px; width:100%; margin:0 auto; padding:80px 60px; }

        .hero-badge-pill { display:inline-flex; align-items:center; gap:6px; padding:8px 18px; border-radius:999px; font-size:12px; font-weight:800; letter-spacing:0.02em; margin-bottom:20px; background:rgba(255,40,0,0.85); color:#fff; backdrop-filter:blur(12px); animation:heroFade 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-main-title { font-size:clamp(32px,5vw,56px); font-weight:900; color:#fff; line-height:1.08; letter-spacing:-0.04em; margin:0 0 16px; white-space:pre-line; animation:heroFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .hero-main-sub { font-size:16px; color:rgba(255,255,255,0.7); font-family:'DM Sans',sans-serif; line-height:1.7; margin:0 0 28px; max-width:480px; font-weight:500; animation:heroFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .hero-main-cta { display:inline-flex; align-items:center; gap:8px; padding:14px 32px; border-radius:12px; background:#fff; color:var(--brand-red); font-size:14px; font-weight:800; text-decoration:none; transition:all 0.25s; box-shadow:0 8px 24px rgba(0,0,0,0.25); animation:heroFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
        .hero-main-cta:hover { transform:translateY(-3px); box-shadow:0 14px 32px rgba(0,0,0,0.3); background:var(--brand-red); color:#fff; }
        .hero-cta-sec { display:inline-flex; align-items:center; gap:8px; padding:14px 28px; border-radius:12px; border:1.5px solid rgba(255,255,255,0.3); background:transparent; color:#fff; font-size:14px; font-weight:800; text-decoration:none; transition:all 0.25s; animation:heroFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both; backdrop-filter:blur(8px); }
        .hero-cta-sec:hover { border-color:#fff; background:rgba(255,255,255,0.1); transform:translateY(-2px); }

        .hero-dots { display:flex; gap:8px; margin-top:28px; animation:heroFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
        .hero-dot { width:32px; height:4px; border-radius:4px; border:none; cursor:pointer; transition:all 0.3s; background:rgba(255,255,255,0.3); }
        .hero-dot.active { background:#fff; width:48px; }


        /* ── Features Bar ── */
        .vit-features { display:grid; grid-template-columns:repeat(4,1fr); border-bottom:1px solid var(--border); background:var(--surface); }
        .vit-feat { display:flex; align-items:center; gap:14px; padding:24px 28px; position:relative; transition:all 0.3s; }
        .vit-feat:not(:last-child)::after { content:''; position:absolute; right:0; top:20%; height:60%; width:1px; background:var(--border); }
        .vit-feat:hover { background:var(--background); }
        .vit-feat-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; background:rgba(255,40,0,0.08); color:var(--brand-red); border:1px solid rgba(255,40,0,0.12); flex-shrink:0; transition:all 0.3s; }
        .vit-feat:hover .vit-feat-icon { background:rgba(255,40,0,0.14); transform:scale(1.06); box-shadow:0 6px 16px rgba(255,40,0,0.12); }
        .vit-feat-title { font-size:13px; font-weight:800; color:var(--foreground); letter-spacing:-0.01em; margin:0 0 2px; }
        .vit-feat-desc { font-size:11px; color:var(--text-dim); font-family:'DM Sans',sans-serif; margin:0; }

        /* ── Section ── */
        .vit-section { padding:72px 40px; max-width:1400px; margin:0 auto; }
        .vit-section-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:36px; }
        .vit-section-badge { display:inline-flex; align-items:center; gap:8px; font-size:11px; font-weight:800; letter-spacing:0.15em; text-transform:uppercase; color:var(--brand-red); margin-bottom:10px; }
        .vit-section-badge-line { width:24px; height:2px; background:var(--brand-red); border-radius:2px; }
        .vit-section-title { font-size:32px; font-weight:900; letter-spacing:-0.04em; color:var(--foreground); margin:0; line-height:1.15; }
        .vit-view-all { display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:800; color:var(--foreground); text-decoration:none; padding:10px 20px; border-radius:10px; background:var(--surface-hover); border:1px solid var(--border); transition:all 0.2s; font-family:'Plus Jakarta Sans',sans-serif; letter-spacing:-0.01em; flex-shrink:0; }
        .vit-view-all:hover { background:var(--foreground); color:var(--background); border-color:var(--foreground); transform:translateY(-1px); }

        /* ── Category Grid ── */
        .vit-cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:24px; }
        .vit-cat-card { display:flex; flex-direction:column; align-items:center; gap:14px; text-decoration:none; color:inherit; cursor:pointer; text-align:center; transition:all 0.3s cubic-bezier(0.16,1,0.3,1); }
        .vit-cat-card:hover { transform:translateY(-6px); }
        .vit-cat-wrap { width:120px; height:120px; border-radius:50%; padding:6px; background:var(--surface); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; transition:all 0.4s cubic-bezier(0.16,1,0.3,1); box-shadow:0 4px 12px rgba(0,0,0,0.05); }
        .vit-cat-card:hover .vit-cat-wrap { border-color:var(--brand-red); box-shadow:0 16px 32px rgba(255,40,0,0.15); transform:scale(1.05); background:rgba(255,40,0,0.04); }
        .vit-cat-inner { width:100%; height:100%; border-radius:50%; overflow:hidden; background:var(--background); }
        .vit-cat-img { width:100%; height:100%; object-fit:cover; transition:transform 0.6s cubic-bezier(0.16,1,0.3,1); }
        .vit-cat-card:hover .vit-cat-img { transform:scale(1.15) rotate(3deg); }
        .vit-cat-name { font-size:14px; font-weight:800; color:var(--foreground); transition:color 0.3s; }
        .vit-cat-card:hover .vit-cat-name { color:var(--brand-red); }
        .vit-cat-count { font-size:12px; color:var(--text-dim); font-family:'DM Sans',sans-serif; }

        /* ── Product Grid ── */
        .vit-pgrid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }

        /* ── Promo Row ── */
        .vit-promo-row { display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:1400px; margin:0 auto; padding:0 40px; }
        .vit-promo-card { position:relative; border-radius:20px; overflow:hidden; min-height:220px; display:flex; align-items:flex-end; padding:32px; cursor:pointer; transition:all 0.4s cubic-bezier(0.16,1,0.3,1); border:1px solid var(--border); }
        .vit-promo-card:hover { transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,0.15); }

        /* ── Flash Sale ── */
        .vit-flash { max-width:1400px; margin:0 auto; padding:60px 40px; }
        .vit-flash-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; flex-wrap:wrap; gap:16px; }
        .vit-flash-left { display:flex; align-items:center; gap:20px; }
        .vit-flash-title { font-size:28px; font-weight:900; color:var(--foreground); letter-spacing:-0.03em; margin:0; }
        .vit-cd { display:flex; gap:8px; }
        .vit-cd-box { display:flex; flex-direction:column; align-items:center; background:var(--surface); border:1px solid rgba(255,40,0,0.15); border-radius:10px; padding:8px 12px; min-width:52px; }
        .vit-cd-num { font-size:20px; font-weight:900; color:var(--brand-red); letter-spacing:-0.02em; line-height:1; }
        .vit-cd-lbl { font-size:9px; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.05em; margin-top:4px; }

        /* ── AI CTA ── */
        .vit-ai-cta { max-width:1400px; margin:0 auto; padding:0 40px 72px; }
        .vit-ai-inner { border-radius:24px; padding:56px; display:flex; align-items:center; gap:48px; position:relative; overflow:hidden; border:1px solid rgba(255,40,0,0.15); }
        .dark .vit-ai-inner { background:linear-gradient(135deg,#110505 0%,#0a0a0a 50%,#0f0505 100%); }
        :root .vit-ai-inner { background:linear-gradient(135deg,#fff8f5 0%,#ffffff 50%,#fffaf8 100%); }
        .vit-ai-orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }

        /* ── Brands ── */
        .vit-brands { padding:52px 0; overflow:hidden; border-top:1px solid var(--border); border-bottom:1px solid var(--border); background:var(--surface); }
        .vit-brands-track { display:flex; align-items:center; gap:64px; animation:scrollBrands 30s linear infinite; }
        .vit-brands-track:hover { animation-play-state:paused; }
        .vit-brand-logo { height:24px; opacity:0.5; filter:grayscale(1); object-fit:contain; flex-shrink:0; transition:all 0.3s; }
        .vit-brand-logo:hover { opacity:1; filter:grayscale(0); transform:scale(1.1); }
        :root .vit-brand-logo { filter:grayscale(1) brightness(0.4); }
        .dark .vit-brand-logo { filter:grayscale(1) brightness(0) invert(1); }
        :root .vit-brand-logo:hover { filter:grayscale(0); }
        .dark .vit-brand-logo:hover { filter:brightness(0) invert(1); }

        /* ── Divider ── */
        .vit-divider { max-width:1400px; margin:0 auto; padding:0 40px; }
        .vit-divider-line { height:1px; background:var(--border); }

        /* ── Responsive ── */
        @media (max-width:1100px) { .vit-pgrid { grid-template-columns:repeat(3,1fr); } }
        @media (max-width:900px) { .hero-grid { grid-template-columns:1fr; grid-template-rows:auto auto auto; min-height:auto; } .hero-main { min-height:340px; } .hero-side { min-height:180px; } }
        @media (max-width:800px) {
          .vit-pgrid { grid-template-columns:repeat(2,1fr); }
          .vit-section { padding:56px 20px; }
          .vit-features { grid-template-columns:repeat(2,1fr); }
          .vit-promo-row { grid-template-columns:1fr; padding:0 20px; }
          .vit-flash { padding:40px 20px; }
          .vit-ai-cta { padding:0 20px 56px; }
          .vit-ai-inner { padding:36px 24px; flex-direction:column; text-align:center; }
          .hero-grid { padding:16px 20px; }
        }
        @media (max-width:500px) { .vit-pgrid { grid-template-columns:1fr; } .vit-features { grid-template-columns:1fr 1fr; } }
      `}</style>

      <MegaMenu />

      {/* ═══════════ FULL-WIDTH HERO SLIDER ═══════════ */}
      <section className="hero-full" onClick={() => router.push(hs.link)} style={{ cursor: 'pointer' }}>
        <div className="hero-main-bg" key={heroIdx} style={{ backgroundImage: `url(${hs.img})` }} />
        <div className="hero-main-overlay" />
        <div className="hero-full-content">
          <div className="hero-badge-pill">{hs.badge}</div>
          <h1 className="hero-main-title">{hs.title}</h1>
          <p className="hero-main-sub">{hs.sub}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href={hs.link} className="hero-main-cta" onClick={e => e.stopPropagation()}>
              {hs.cta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
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

      {/* ═══════════ BRANDS TICKER ═══════════ */}
      <div className="vit-brands">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0 }}>Trusted by top brands</p>
        </div>
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          <div className="vit-brands-track">{[...logos, ...logos, ...logos, ...logos].map((l, i) => <img key={i} src={l.src} alt={l.alt} className="vit-brand-logo" />)}</div>
        </div>
      </div>
      {/* ═══════════ FEATURES BAR ═══════════ */}
      <div className="vit-features">
        {[
          { icon: 'M5 12h14M12 5l7 7', title: 'Free Shipping', desc: 'On orders over 500 DTN' },
          { icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1-14v4l3 3', title: '24/7 Support', desc: 'Always here to help' },
          { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
          { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'Easy Returns', desc: '30-day return policy' },
        ].map((f, i) => (
          <div key={i} className="vit-feat">
            <div className="vit-feat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
            </div>
            <div>
              <p className="vit-feat-title">{f.title}</p>
              <p className="vit-feat-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════ FLASH SALE ═══════════ */}
      <div className="vit-flash">
        <div className="vit-flash-header">
          <div className="vit-flash-left">
            <h2 className="vit-flash-title">⚡ Flash Sale</h2>
            <div className="vit-cd">
              {[{ v: cd.d, l: 'Days' }, { v: cd.h, l: 'Hrs' }, { v: cd.m, l: 'Min' }, { v: cd.s, l: 'Sec' }].map((c, i) => (
                <div key={i} className="vit-cd-box"><span className="vit-cd-num">{String(c.v).padStart(2, '0')}</span><span className="vit-cd-lbl">{c.l}</span></div>
              ))}
            </div>
          </div>
          <Link href="/product-page" className="vit-view-all">View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></Link>
        </div>
        <div className="vit-pgrid">
          {newestProducts.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} delay={i} />)}
        </div>
      </div>


      {/* ═══════════ BRAND ACCESSORY SHOWCASE ═══════════ */}
      <BrandAccessoryShowcase />

      {/* ═══════════ CATEGORIES ═══════════ */}
      <div className="vit-section">
        <div className="vit-section-header">
          <div>
            <div className="vit-section-badge"><span className="vit-section-badge-line" />Shop by Category</div>
            <h2 className="vit-section-title">Browse Categories</h2>
          </div>
          <Link href="/product-page" className="vit-view-all">View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></Link>
        </div>
        <div className="vit-cat-grid">
          {storefrontCategories.map((cat, i) => (
            <Link key={cat.id} href={`/product-page?category=${encodeURIComponent(cat.name.toLowerCase().replace(/\s+/g, '-'))}`} className="vit-cat-card" style={{ animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` }}>
              <div className="vit-cat-wrap"><div className="vit-cat-inner"><img src={getCategoryImage(cat.name)} alt={cat.name} className="vit-cat-img" /></div></div>
              <div><div className="vit-cat-name">{cat.name}</div><div className="vit-cat-count">Discover {cat.productCount} Products</div></div>
            </Link>
          ))}
        </div>
      </div>

      <div className="vit-divider"><div className="vit-divider-line" /></div>

      {/* ═══════════ BRAND SHOWCASE BENTO GRID ═══════════ */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '56px 40px 0' }}>
        <div className="vit-section-header" style={{ marginBottom: 28 }}>
          <div>
            <div className="vit-section-badge"><span className="vit-section-badge-line" />Top Brands</div>
            <h2 className="vit-section-title">Shop by Brand</h2>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gridTemplateRows: '1fr 1fr', gap: 16, minHeight: 520 }}>

          {/* NVIDIA GeForce RTX — Large left card spanning 2 rows */}
          <div style={{ gridRow: '1/3', borderRadius: 20, position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)', border: '1px solid rgba(118,185,0,0.12)', background: '#0a0a0a' }} className="vit-promo-card" onClick={() => router.push('/product-page?category=gpu')}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url(https://s.yimg.com/ny/api/res/1.2/qIHV9sk.mpiWTwLElXT.wQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTk2MDtoPTU0MA--/https://media.zenfs.com/en/toms_guide_826/9df500f356761951a2b69aab4b408fe6)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.42,
              }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)' }} />
            <div style={{ position: 'absolute', top: -80, right: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(118,185,0,0.2) 0%, transparent 50%)', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%', background: 'linear-gradient(135deg, transparent 0%, rgba(118,185,0,0.03) 50%, rgba(118,185,0,0.06) 100%)', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 0% 100%)' }} />
            <div style={{ position: 'relative', zIndex: 3, padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <span style={{ display: 'inline-flex', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 6, marginBottom: 16, background: 'rgba(118,185,0,0.15)', color: '#76b900', border: '1px solid rgba(118,185,0,0.25)', width: 'fit-content' }}>Le Jeu Ultime</span>
              <h3 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 6px', lineHeight: 1.08, color: '#fff', textTransform: 'uppercase' }}>GeForce RTX<br />Series</h3>
              <p style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", margin: '0 0 22px', color: '#76b900', fontWeight: 700 }}>RTX 30 & 40 Series</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, padding: '12px 24px', borderRadius: 10, background: 'rgba(118,185,0,0.15)', color: '#76b900', border: '1px solid rgba(118,185,0,0.3)', backdropFilter: 'blur(8px)', fontFamily: "'Plus Jakarta Sans'", width: 'fit-content', transition: 'all 0.25s' }}>
                Explorer Les Cartes Graphiques
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </span>
            </div>
          </div>

          {/* AMD Radeon GPU — Top right */}
          <div style={{ borderRadius: 16, position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)', border: '1px solid rgba(237,28,36,0.12)', background: '#0a0a0a' }} className="vit-promo-card" onClick={() => router.push('/product-page?category=gpu')}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)' }} />
            <div style={{ position: 'absolute', top: -40, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(237,28,36,0.2) 0%, transparent 50%)', filter: 'blur(40px)' }} />
            <div style={{ position: 'relative', zIndex: 3, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <span style={{ display: 'inline-flex', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 5, marginBottom: 12, background: 'rgba(237,28,36,0.15)', color: '#ed1c24', border: '1px solid rgba(237,28,36,0.25)', width: 'fit-content' }}>Performance Ultime</span>
              <h3 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 4px', lineHeight: 1.1, color: '#fff', textTransform: 'uppercase' }}>AMD Radeon RX</h3>
              <p style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", margin: '0 0 14px', color: '#ed1c24', fontWeight: 700 }}>RX 7000 Series</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, padding: '8px 18px', borderRadius: 8, background: 'rgba(237,28,36,0.12)', color: '#ed1c24', border: '1px solid rgba(237,28,36,0.25)', fontFamily: "'Plus Jakarta Sans'", width: 'fit-content' }}>
                Explorer →
              </span>
            </div>
          </div>

          {/* Intel & AMD CPU — Bottom right, split into 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Intel CPU */}
            <div style={{ borderRadius: 16, position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)', border: '1px solid rgba(0,125,195,0.12)', background: '#0a0a0a' }} className="vit-promo-card" onClick={() => router.push('/product-page?category=cpu')}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'url(https://static0.xdaimages.com/wordpress/wp-content/uploads/2023/08/intel-core.jpg?w=1200&h=675&fit=crop)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.36,
                }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)' }} />
              <div style={{ position: 'absolute', top: -30, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,125,195,0.25) 0%, transparent 50%)', filter: 'blur(30px)' }} />
              <div style={{ position: 'relative', zIndex: 3, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <span style={{ display: 'inline-flex', fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 5, marginBottom: 10, background: 'rgba(0,125,195,0.15)', color: '#0071c5', border: '1px solid rgba(0,125,195,0.25)', width: 'fit-content' }}>Intel Inside</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 4px', lineHeight: 1.12, color: '#fff' }}>Intel Core</h3>
                <p style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", margin: '0 0 12px', color: '#0071c5', fontWeight: 700 }}>13th & 14th Gen</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, padding: '8px 16px', borderRadius: 8, background: 'rgba(0,125,195,0.12)', color: '#0071c5', border: '1px solid rgba(0,125,195,0.2)', fontFamily: "'Plus Jakarta Sans'", width: 'fit-content' }}>
                  Explorer →
                </span>
              </div>
            </div>

            {/* AMD Ryzen CPU */}
            <div style={{ borderRadius: 16, position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)', border: '1px solid rgba(237,28,36,0.12)', background: '#0a0a0a' }} className="vit-promo-card" onClick={() => router.push('/product-page?category=cpu')}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://media.materiel.net/nbo/matnet/buying-guide-page/processeur/processeur-15.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)' }} />
              <div style={{ position: 'absolute', top: -30, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,100,0,0.2) 0%, transparent 50%)', filter: 'blur(30px)' }} />
              <div style={{ position: 'relative', zIndex: 3, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <span style={{ display: 'inline-flex', fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 5, marginBottom: 10, background: 'rgba(255,100,0,0.12)', color: '#ff6400', border: '1px solid rgba(255,100,0,0.2)', width: 'fit-content' }}>Puissance Au Cœur</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 4px', lineHeight: 1.12, color: '#fff' }}>AMD Ryzen</h3>
                <p style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", margin: '0 0 12px', color: '#ff6400', fontWeight: 700 }}>Zen 4 & 5 Series</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, padding: '8px 16px', borderRadius: 8, background: 'rgba(255,100,0,0.12)', color: '#ff6400', border: '1px solid rgba(255,100,0,0.2)', fontFamily: "'Plus Jakarta Sans'", width: 'fit-content' }}>
                  Explorer →
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════ POPULAR PRODUCTS ═══════════ */}
      <div className="vit-section">
        <div className="vit-section-header">
          <div>
            <div className="vit-section-badge"><span className="vit-section-badge-line" />Most Popular</div>
            <h2 className="vit-section-title">Trending Now</h2>
          </div>
          <Link href="/product-page" className="vit-view-all">View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></Link>
        </div>
        <div className="vit-pgrid">
          {popularProducts.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} delay={i} />)}
        </div>
      </div>

      {/* ═══════════ AI CTA BANNER ═══════════ */}
      <div className="vit-ai-cta">
        <div className="vit-ai-inner">
          <div className="vit-ai-orb" style={{ width: 400, height: 400, top: -100, right: -80, background: 'radial-gradient(circle, rgba(255,40,0,0.12) 0%, transparent 50%)', animation: 'pulseGlow 6s ease-in-out infinite' }} />
          <div className="vit-ai-orb" style={{ width: 300, height: 300, bottom: -60, left: -40, background: 'radial-gradient(circle, rgba(255,120,0,0.08) 0%, transparent 50%)', animation: 'pulseGlow 8s ease-in-out infinite 2s' }} />
          <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 20, border: '1px solid rgba(255,40,0,0.2)', background: 'rgba(255,40,0,0.08)', color: 'var(--brand-red)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-red)', animation: 'pulseGlow 2s ease-in-out infinite' }} />AI-Powered
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 14px', lineHeight: 1.15 }}>
              <span style={{ background: 'linear-gradient(135deg, var(--foreground) 0%, var(--foreground) 50%, var(--brand-red) 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Not sure what to pick?</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-muted)', maxWidth: 440, margin: '0 0 28px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
              Let our AI assistant build the perfect PC for you. Just describe your needs — gaming, streaming, design — and we'll handle the rest.
            </p>
            <Link href="/build-with-ai" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 14, background: 'linear-gradient(135deg, var(--brand-red) 0%, #ff5500 100%)', color: '#fff', fontSize: 15, fontWeight: 800, textDecoration: 'none', boxShadow: '0 8px 28px rgba(255,40,0,0.3)', transition: 'all 0.25s' }}>
              Build with AI
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6 4.8 2.4-7.2-6-4.8h7.2z" /></svg>
            </Link>
          </div>
          <div style={{ flex: '0 0 200px', position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 160, height: 160, borderRadius: 24, background: 'rgba(255,40,0,0.06)', border: '1px solid rgba(255,40,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🤖</div>
          </div>
        </div>
      </div>

      {/* ═══════════ FOOTER BRANDS ═══════════ */}
      <div className="vit-brands">
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          <div className="vit-brands-track" style={{ animationDirection: 'reverse' }}>{[...logos, ...logos, ...logos, ...logos].map((l, i) => <img key={i} src={l.src} alt={l.alt} className="vit-brand-logo" />)}</div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useCart } from '@/hooks/useCart'
import MegaMenu from '../mega-menu/megaMenu'
import BrandAccessoryShowcase from '@/components/BrandAccessoryShowcase'

/* ─── brand logos (same as login page) ─── */
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

/* ─── category icon paths ─── */
const categoryIcons: Record<string, string> = {
  cpu: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
  gpu: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm4 10v2m4-2v2m4-2v2',
  ram: 'M3 7h18M3 12h18M3 17h18M7 3v18M17 3v18',
  storage: 'M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8zm3 4h.01M16 12h.01',
  psu: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  case: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  cooling: 'M12 3a9 9 0 100 18A9 9 0 0012 3zm0 0v4m0 14v-4M3 12h4m14 0h-4',
  monitor: 'M9 3H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-4M12 17v4m-4 0h8',
  keyboard: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm4 4h.01M12 10h.01M16 10h.01',
  mouse: 'M12 2C8.7 2 6 4.7 6 8v8c0 3.3 2.7 6 6 6s6-2.7 6-6V8c0-3.3-2.7-6-6-6zm0 0v6',
  headset: 'M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5zm16 0a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5z',
  default: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z',
}

const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase()
  for (const key of Object.keys(categoryIcons)) {
    if (lower.includes(key)) return categoryIcons[key]
  }
  return categoryIcons.default
}

/* ─── category image paths (for real images) ─── */
const categoryImages: Record<string, string> = {
  cpu: 'https://media.materiel.net/nbo/matnet/buying-guide-page/processeur/processeur-15.jpg',
  gpu: 'https://global.aorus.com/upload/Admin/images/RTX3080_max_cover_cooling.jpg',
  ram: 'https://cdn.mos.cms.futurecdn.net/GFukx5y3yrGrBthhPcnBwL.jpg',
  storage: 'https://hyperpc.ae/images/support/articles/how-to-increase-storage-space-on-a-pc/how-to-choose-an-ssd-banner_webp.jpg',
  psu: 'https://www.bargainhardware.co.uk/wp/wp-content/uploads/2024/06/7ME636bQNGEGGrg5qEtWrK-1-scaled.jpg',
  case: 'https://cdn.deepcool.com/public/Global-images/products/Cases/2025/05/CH690_DIGITAL_1.jpg?fm=webp&q=60',
  cooling: 'https://dlcdnwebimgs.asus.com/files/media/A88CF078-6931-4BD6-80AF-F60DA9C6A4B5/v1/img/compatibility.jpg',
  monitor: 'https://oasis.opstatics.com/content/dam/oasis/page/frankfurt/27-share.jpg',
  keyboard: 'https://assets2.razerzone.com/images/pnx.assets/935c8e83ae6a5092102e5134acd0a435/ergonomic-wrist-rest.webp',
  mouse: 'https://static0.thegamerimages.com/wordpress/wp-content/uploads/2025/07/razer-hyperflux-v2-on-black-background.jpg?w=1600&h=900&fit=crop',
  headset: 'https://assets2.razerzone.com/images/gaming-audio/headsets-audio-category.png',
  default: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80&fit=crop',
}

const getCategoryImage = (name: string) => {
  const lower = name.toLowerCase()
  for (const key of Object.keys(categoryImages)) {
    if (lower.includes(key)) return categoryImages[key]
  }
  return categoryImages.default
}

/* ─── AI builder purpose tags ─── */
const purposeTags = [
  { label: '🎮 Gaming', value: 'gaming' },
  { label: '🎬 Streaming', value: 'streaming' },
  { label: '💼 Office', value: 'office' },
  { label: '🎨 Design', value: 'design' },
  { label: '🔬 Engineering', value: 'engineering' },
  { label: '📹 Video Editing', value: 'video-editing' },
]

const budgetOptions = [
  { label: 'Budget (300-500 DTN)', value: '300-500' },
  { label: 'Mid-Range (500-1000 DTN)', value: '500-1000' },
  { label: 'High-End (1000-2000 DTN)', value: '1000-2000' },
  { label: 'Premium (2000+ DTN)', value: '2000+' },
]

/* ─── Product card ─── */
function ProductCard({ product, delay }: { product: any; delay: number }) {
  const [hovered, setHovered] = useState(false)
  const { addItem } = useCart()

  return (
    <Link
      href={`/product-page/${product.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: 'var(--background)',
        border: `1px solid ${hovered ? 'var(--brand-red)' : 'var(--border)'}`,
        borderRadius: 20, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${delay * 80}ms both`,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: hovered
          ? '0 20px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(255,40,0,0.08)'
          : '0 4px 12px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        height: '100%',
      }}>
        <div style={{
          position: 'relative', height: 220,
          background: 'var(--surface)',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl} alt={product.name}
              style={{
                width: '80%', height: '80%', objectFit: 'contain',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.1))',
              }}
            />
          ) : (
            <div style={{ fontSize: 48, opacity: 0.1, color: 'var(--foreground)' }}>◈</div>
          )}
          {product.category && (
            <span style={{
              position: 'absolute', top: 12, left: 12,
              background: 'var(--background)', backdropFilter: 'blur(8px)',
              color: 'var(--foreground)', fontSize: 10, fontWeight: 800,
              padding: '4px 10px', borderRadius: 30,
              border: '1px solid var(--border)',
            }}>
              {product.category.name}
            </span>
          )}
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
          <p style={{
            margin: 0, fontSize: 14, fontWeight: 800,
            color: 'var(--foreground)', lineHeight: 1.4,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.02em',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.name}
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
            <span style={{
              fontSize: 18, fontWeight: 900, color: 'var(--foreground)',
              fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.04em',
            }}>
              DTN {product.price?.toFixed(2) ?? '0.00'}
            </span>
            <button
              disabled={product.stock === 0}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addItem(product.id, 1, {
                  productId: product.id,
                  name: product.name,
                  price: product.price ?? 0,
                  imageUrl: product.imageUrl ?? null,
                  sku: product.sku,
                })
              }}
              style={{
                background: product.stock === 0 ? 'transparent' : 'var(--brand-red)',
                color: product.stock === 0 ? 'var(--text-dim)' : '#fff',
                border: product.stock === 0 ? '1px solid var(--border)' : 'none',
                padding: '8px 14px', borderRadius: 10,
                fontSize: 12, fontWeight: 800,
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all 0.2s',
                boxShadow: product.stock === 0 ? 'none' : '0 4px 12px rgba(255,40,0,0.2)',
              }}
            >
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

  /* ── AI Builder state ── */
  const [builderStep, setBuilderStep] = useState<'choice' | 'ai-prompt'>('choice')
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [selectedBudget, setSelectedBudget] = useState('')
  const [promptText, setPromptText] = useState(
    'I need a PC for gaming with a budget around 1000 DTN. I want to play modern AAA games at 1080p with high settings. I also need good cooling and a clean aesthetic.'
  )

  /* ── Data hooks ── */
  const { categories } = useCategories()
  const { products: newestProducts } = useProducts({ sortBy: 'newest', limit: 8 })
  const { products: popularProducts } = useProducts({ sortBy: 'featured', limit: 8 })
  const storefrontCategories = useMemo(
    () => categories.filter(c => (c.productCount ?? 0) > 0),
    [categories]
  )

  const handleGenerate = () => {
    const searchTerms = [selectedPurpose, selectedBudget].filter(Boolean).join(' ')
    router.push(`/product-page${searchTerms ? `?search=${encodeURIComponent(searchTerms)}` : ''}`)
  }

  /* ── Countdown timer for flash sale ── */
  const [countdown, setCountdown] = useState({ days: 0, hours: 13, minutes: 44, seconds: 57 })
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) { seconds = 59; minutes-- }
        if (minutes < 0) { minutes = 59; hours-- }
        if (hours < 0) { hours = 23; days-- }
        if (days < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        return { days, hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      background: 'var(--background)',
      minHeight: '100vh',
      color: 'var(--foreground)',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scrollBrands {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes subtlePulse {
          0%, 100% { transform: scale(1); opacity: 0.08; }
          50%      { transform: scale(1.08); opacity: 0.14; }
        }
        @keyframes gridPan {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-32px, -32px); }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,40,0,0.05); }
          50%      { box-shadow: 0 0 30px rgba(255,40,0,0.12); }
        }

        * { box-sizing: border-box; }
        ::selection { background: var(--brand-red); color: #fff; }

        .hero-section {
          position: relative;
          min-height: 680px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(160deg, #110505 0%, #0a0a0a 40%, #0f0a0a 100%);
        }
        :root .hero-section {
          background: linear-gradient(160deg, #fffafa 0%, #ffffff 40%, #fcf5f5 100%);
        }
        .dark .hero-section {
          background: linear-gradient(160deg, #110505 0%, #0a0a0a 40%, #0f0a0a 100%);
        }

        .hero-grid-bg {
          position: absolute;
          inset: -32px;
          opacity: 0.04;
          background-image:
            linear-gradient(var(--foreground) 1px, transparent 1px),
            linear-gradient(90deg, var(--foreground) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridPan 20s linear infinite;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .hero-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(255,40,0,0.15) 0%, transparent 70%);
          top: -100px; right: -50px;
          animation: pulseGlow 6s ease-in-out infinite;
        }
        .hero-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,120,0,0.1) 0%, transparent 70%);
          bottom: -80px; left: -60px;
          animation: pulseGlow 8s ease-in-out infinite 2s;
        }
        .hero-orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(255,40,0,0.08) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: pulseGlow 5s ease-in-out infinite 1s;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 780px;
          width: 100%;
          padding: 80px 32px 60px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          margin-bottom: 32px;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both;
          border: 1px solid rgba(255,40,0,0.2);
          background: rgba(255,40,0,0.08);
          color: var(--brand-red);
          backdrop-filter: blur(12px);
        }

        .hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--brand-red);
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .hero-title {
          font-size: clamp(36px, 5.5vw, 64px);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.04em;
          margin: 0 0 24px;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }
        .hero-title-gradient {
          background: linear-gradient(135deg, var(--foreground) 0%, var(--foreground) 40%, var(--brand-red) 80%, #ff7a00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 16px;
          line-height: 1.7;
          color: var(--text-muted);
          max-width: 540px;
          margin: 0 0 40px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }

        .builder-box {
          width: 100%;
          max-width: 680px;
          border-radius: 20px;
          border: 1px solid var(--border-strong);
          background: var(--background);
          overflow: hidden;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.04);
        }

        .builder-inner {
          padding: 28px;
        }

        .choice-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .choice-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 36px 24px 32px;
          border-radius: 18px;
          border: 1.5px solid var(--border);
          background: linear-gradient(145deg, var(--surface) 0%, var(--background) 100%);
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          text-align: center;
          overflow: hidden;
        }
        .choice-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          opacity: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(255,40,0,0.08) 0%, transparent 70%);
          transition: opacity 0.4s;
        }
        .choice-card:hover::before { opacity: 1; }
        .choice-card:hover {
          border-color: rgba(255,40,0,0.5);
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 40px rgba(255,40,0,0.12), 0 0 0 1px rgba(255,40,0,0.1);
        }
        .choice-card:active {
          transform: translateY(-2px) scale(0.99);
        }

        .choice-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,40,0,0.08);
          color: var(--brand-red);
          border: 1px solid rgba(255,40,0,0.15);
          transition: all 0.35s;
          position: relative;
          z-index: 1;
        }
        .choice-card:hover .choice-icon {
          background: rgba(255,40,0,0.14);
          border-color: rgba(255,40,0,0.3);
          box-shadow: 0 8px 24px rgba(255,40,0,0.18);
          transform: scale(1.08);
        }

        .choice-label {
          font-size: 16px;
          font-weight: 900;
          color: var(--foreground);
          letter-spacing: -0.02em;
          position: relative;
          z-index: 1;
        }
        .choice-desc {
          font-size: 13px;
          color: var(--text-dim);
          font-family: 'DM Sans', sans-serif;
          line-height: 1.5;
          max-width: 200px;
          position: relative;
          z-index: 1;
        }
        .choice-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px; height: 32px;
          border-radius: 8px;
          background: rgba(255,40,0,0.08);
          color: var(--brand-red);
          transition: all 0.3s;
          position: relative;
          z-index: 1;
          margin-top: 4px;
        }
        .choice-card:hover .choice-arrow {
          background: var(--brand-red);
          color: #fff;
          transform: translateX(3px);
        }

        .prompt-area {
          width: 100%;
          min-height: 110px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          border-radius: 14px;
          padding: 18px 20px;
          font-size: 14px;
          color: var(--foreground);
          font-family: 'DM Sans', sans-serif;
          resize: vertical;
          outline: none;
          line-height: 1.7;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .prompt-area::placeholder { color: var(--text-dim); }
        .prompt-area:focus {
          border-color: var(--brand-red);
          box-shadow: 0 0 0 3px rgba(255,40,0,0.12), 0 8px 24px rgba(255,40,0,0.06);
        }

        .prompt-section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px;
          font-size: 11px;
          font-weight: 800;
          color: var(--text-dim);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .prompt-section-label svg {
          color: var(--brand-red);
          opacity: 0.7;
        }

        .prompt-divider {
          width: 100%;
          height: 1px;
          background: var(--border);
          margin: 20px 0;
        }

        .tag-chip {
          display: inline-flex;
          align-items: center;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--text-muted);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .tag-chip:hover {
          border-color: var(--brand-red);
          color: var(--brand-red);
        }
        .tag-chip.active {
          border-color: var(--brand-red);
          background: rgba(255,40,0,0.1);
          color: var(--brand-red);
        }

        .generate-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, var(--brand-red) 0%, #ff5500 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 8px 24px rgba(255,40,0,0.3);
          letter-spacing: -0.01em;
        }
        .generate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255,40,0,0.4);
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .back-btn:hover {
          border-color: var(--foreground);
          color: var(--foreground);
        }

        .builder-footer {
          padding: 16px 28px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--surface);
        }

        /* ── Section styles ── */
        .section {
          padding: 80px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--brand-red);
          margin-bottom: 12px;
        }
        .section-badge-line {
          width: 24px; height: 2px;
          background: var(--brand-red);
          border-radius: 2px;
        }
        .section-title {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--foreground);
          margin: 0;
          line-height: 1.15;
        }
        .section-view-all {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 800;
          color: var(--foreground);
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 10px;
          background: var(--surface-hover);
          border: 1px solid var(--border);
          transition: all 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.01em;
          flex-shrink: 0;
        }
        .section-view-all:hover {
          background: var(--foreground);
          color: var(--background);
          border-color: var(--foreground);
          transform: translateY(-1px);
        }

        /* ── Categories Circular grid ── */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 24px;
          justify-content: center;
        }
        .cat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .cat-card:hover {
          transform: translateY(-6px);
        }
        .cat-img-wrap {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          padding: 6px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .cat-card:hover .cat-img-wrap {
          border-color: var(--brand-red);
          box-shadow: 0 16px 32px rgba(255,40,0,0.15);
          transform: scale(1.05);
          background: rgba(255,40,0,0.04);
        }
        .cat-img-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: var(--background);
        }
        .cat-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .cat-card:hover .cat-img {
          transform: scale(1.15) rotate(3deg);
        }
        .cat-name {
          font-size: 14px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.01em;
          transition: color 0.3s;
        }
        .cat-card:hover .cat-name {
          color: var(--brand-red);
        }
        .cat-count {
          font-size: 12px;
          color: var(--text-dim);
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Product grid ── */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1100px) {
          .product-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 800px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); }
          .choice-grid { grid-template-columns: 1fr; }
          .method-grid { grid-template-columns: 1fr; }
          .section { padding: 60px 20px; }
          .cat-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
        }
        @media (max-width: 500px) {
          .product-grid { grid-template-columns: 1fr; }
        }

        /* ── Brands section ── */
        .brands-section {
          padding: 60px 0;
          overflow: hidden;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          position: relative;
        }
        .brands-track {
          display: flex;
          align-items: center;
          gap: 64px;
          animation: scrollBrands 30s linear infinite;
        }
        .brands-track:hover {
          animation-play-state: paused;
        }
        .brand-logo {
          height: 24px;
          opacity: 0.5;
          filter: grayscale(1);
          object-fit: contain;
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .brand-logo:hover {
          opacity: 1;
          filter: grayscale(0);
          transform: scale(1.1);
        }
        :root .brand-logo {
          filter: grayscale(1) brightness(0.4);
        }
        .dark .brand-logo {
          filter: grayscale(1) brightness(0) invert(1);
        }
        :root .brand-logo:hover {
          filter: grayscale(0);
        }
        .dark .brand-logo:hover {
          filter: brightness(0) invert(1);
        }

        /* ── Features Bar ── */
        .features-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
        }
        .feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 36px 20px;
          text-align: center;
          position: relative;
          transition: all 0.3s;
        }
        .feature-item:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 20%;
          height: 60%;
          width: 1px;
          background: var(--border);
        }
        .feature-item:hover { background: var(--background); }
        .feature-icon-circle {
          width: 52px; height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,40,0,0.08);
          color: var(--brand-red);
          border: 1.5px solid rgba(255,40,0,0.15);
          transition: all 0.3s;
        }
        .feature-item:hover .feature-icon-circle {
          background: rgba(255,40,0,0.14);
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(255,40,0,0.15);
        }
        .feature-title {
          font-size: 13px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.01em;
        }
        .feature-desc {
          font-size: 11px;
          color: var(--text-dim);
          font-family: 'DM Sans', sans-serif;
          line-height: 1.4;
        }

        /* ── Promo Banners ── */
        .promo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 40px 0;
        }
        .promo-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          min-height: 240px;
          display: flex;
          align-items: flex-end;
          padding: 32px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          border: 1px solid var(--border);
        }
        .promo-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .promo-card-dark {
          background: linear-gradient(135deg, #1a0808 0%, #0f0505 50%, #180a0a 100%);
        }
        :root .promo-card-dark {
          background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 50%, #fff8f5 100%);
        }
        .promo-card-accent {
          background: linear-gradient(135deg, var(--brand-red) 0%, #cc2000 50%, #ff5500 100%);
        }
        .promo-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 6px;
          margin-bottom: 12px;
        }
        .promo-card-dark .promo-badge {
          background: rgba(255,40,0,0.12);
          color: var(--brand-red);
          border: 1px solid rgba(255,40,0,0.2);
        }
        .promo-card-accent .promo-badge {
          background: rgba(255,255,255,0.2);
          color: #fff;
        }
        .promo-title {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin: 0 0 8px;
          line-height: 1.15;
        }
        .promo-card-dark .promo-title { color: var(--foreground); }
        .promo-card-accent .promo-title { color: #fff; }
        .promo-subtitle {
          font-size: 13px;
          line-height: 1.5;
          font-family: 'DM Sans', sans-serif;
          margin: 0 0 16px;
        }
        .promo-card-dark .promo-subtitle { color: var(--text-muted); }
        .promo-card-accent .promo-subtitle { color: rgba(255,255,255,0.8); }
        .promo-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 800;
          padding: 8px 18px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .promo-card-dark .promo-cta {
          background: var(--brand-red);
          color: #fff;
          box-shadow: 0 6px 16px rgba(255,40,0,0.3);
        }
        .promo-card-accent .promo-cta {
          background: #fff;
          color: var(--brand-red);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        .promo-card .promo-cta:hover { transform: translateY(-1px); }
        .promo-image-wrap {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          width: 180px;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .promo-image-wrap img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.2));
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .promo-card:hover .promo-image-wrap img {
          transform: scale(1.08) rotate(-2deg);
        }

        /* ── Flash Sale ── */
        .flash-sale-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 40px;
        }
        .flash-sale-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .flash-sale-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .flash-sale-title {
          font-size: 28px;
          font-weight: 900;
          color: var(--foreground);
          letter-spacing: -0.03em;
          margin: 0;
        }
        .countdown-wrap {
          display: flex;
          gap: 8px;
        }
        .countdown-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--surface);
          border: 1px solid rgba(255,40,0,0.15);
          border-radius: 10px;
          padding: 8px 12px;
          min-width: 52px;
        }
        .countdown-num {
          font-size: 20px;
          font-weight: 900;
          color: var(--brand-red);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .countdown-label {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 4px;
        }
        .flash-product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        /* ── Bottom Promo Row ── */
        .bottom-promo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px 60px;
        }
        .bottom-promo-card {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 28px 32px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: var(--surface);
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          cursor: pointer;
          text-decoration: none;
          color: inherit;
        }
        .bottom-promo-card:hover {
          border-color: var(--brand-red);
          transform: translateY(-3px);
          box-shadow: 0 16px 32px rgba(255,40,0,0.08);
        }
        .bottom-promo-icon {
          width: 56px; height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,40,0,0.08);
          color: var(--brand-red);
          border: 1px solid rgba(255,40,0,0.15);
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .bottom-promo-card:hover .bottom-promo-icon {
          background: rgba(255,40,0,0.14);
          box-shadow: 0 6px 18px rgba(255,40,0,0.15);
        }
        .bottom-promo-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--foreground);
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }
        .bottom-promo-desc {
          font-size: 12px;
          color: var(--text-dim);
          margin: 0;
          font-family: 'DM Sans', sans-serif;
          line-height: 1.4;
        }

        @media (max-width: 800px) {
          .features-bar { grid-template-columns: repeat(2, 1fr); }
          .promo-grid { grid-template-columns: 1fr; padding: 40px 20px 0; }
          .flash-product-grid { grid-template-columns: repeat(2, 1fr); }
          .bottom-promo-grid { grid-template-columns: 1fr; padding: 0 20px 40px; }
          .flash-sale-section { padding: 40px 20px; }
        }
        @media (max-width: 500px) {
          .features-bar { grid-template-columns: 1fr 1fr; }
          .flash-product-grid { grid-template-columns: 1fr; }
        }

        /* ── Divider ── */
        .section-divider {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
        }
        .section-divider-line {
          height: 1px;
          background: var(--border);
        }

        /* ── Text Input ── */
        .prompt-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--foreground);
          font-size: 13px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .prompt-input::placeholder { color: var(--text-dim); font-weight: 500; }
        .prompt-input:focus {
          border-color: var(--brand-red);
          box-shadow: 0 0 0 3px rgba(255,40,0,0.1);
        }
      `}</style>

      <MegaMenu />

      {/* ════════════════════════════════════════════
          HERO — AI PC BUILDER SECTION
         ════════════════════════════════════════════ */}
      <section className="hero-section">
        {/* Background effects */}
        <div className="hero-grid-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Decorative floating shapes */}
        <div style={{
          position: 'absolute', top: '15%', left: '8%',
          width: 60, height: 60, borderRadius: 16,
          border: '1px solid rgba(255,40,0,0.15)',
          animation: 'float 6s ease-in-out infinite',
          transform: 'rotate(20deg)',
          opacity: 0.3,
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: 40, height: 40, borderRadius: '50%',
          border: '1px solid rgba(255,40,0,0.12)',
          animation: 'float 5s ease-in-out infinite 1s',
          opacity: 0.25,
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '20%',
          width: 80, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(255,40,0,0.2), transparent)',
          animation: 'float 7s ease-in-out infinite 0.5s',
          opacity: 0.4,
        }} />

        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered PC Builder
          </div>

          {/* Title */}
          <h1 className="hero-title">
            <span className="hero-title-gradient">
              Build Your Dream PC.{' '}
            </span>
            <br />
            <span className="hero-title-gradient">
              Just Describe It.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Our AI assistant helps you configure the perfect PC for your needs.
            Simply describe what you want — we handle the components, compatibility, and budget.
          </p>

          {/* ── Builder Box ── */}
          <div className="builder-box">
            <div className="builder-inner">

              {/* Step 1: Choice — 2 Premium Cards */}
              {builderStep === 'choice' && (
                <div style={{ animation: 'slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                  <div className="choice-grid">
                    {/* Build Your PC */}
                    <div className="choice-card" onClick={() => setBuilderStep('ai-prompt')}>
                      <div className="choice-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6 4.8 2.4-7.2-6-4.8h7.2z" />
                        </svg>
                      </div>
                      <span className="choice-label">Build Your PC</span>
                      <span className="choice-desc">Use AI to configure the perfect build based on your needs and budget</span>
                      <span className="choice-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </span>
                    </div>

                    {/* Pre-Built PC */}
                    <div className="choice-card" onClick={() => router.push('/product-page?category=gaming-pc')}>
                      <div className="choice-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm6 12h4m-6 4h8" />
                        </svg>
                      </div>
                      <span className="choice-label">Pre-Built PCs</span>
                      <span className="choice-desc">Browse ready-to-play gaming desktops handpicked by our experts</span>
                      <span className="choice-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: AI Prompt */}
              {builderStep === 'ai-prompt' && (
                <div style={{ animation: 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                  {/* Prompt label */}
                  <p className="prompt-section-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    Describe Your Ideal Setup
                  </p>
                  <textarea
                    className="prompt-area"
                    value={promptText}
                    onChange={e => setPromptText(e.target.value)}
                    placeholder="Describe your ideal PC setup..."
                  />

                  <div className="prompt-divider" />

                  {/* Purpose Input */}
                  <p className="prompt-section-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6 4.8 2.4-7.2-6-4.8h7.2z" />
                    </svg>
                    What Is This PC For?
                  </p>
                  <input
                    type="text"
                    list="purpose-options"
                    className="prompt-input"
                    value={selectedPurpose}
                    onChange={e => setSelectedPurpose(e.target.value)}
                    placeholder="e.g. Gaming, Video Editing, Office..."
                  />
                  <datalist id="purpose-options">
                    {purposeTags.map(tag => (
                      <option key={tag.value} value={tag.value}>{tag.label}</option>
                    ))}
                  </datalist>

                  <div className="prompt-divider" />

                  {/* Budget Input */}
                  <p className="prompt-section-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                    Budget Range
                  </p>
                  <input
                    type="text"
                    list="budget-options"
                    className="prompt-input"
                    value={selectedBudget}
                    onChange={e => setSelectedBudget(e.target.value)}
                    placeholder="e.g. 1000 DTN, Mid-Range, Unlimited..."
                  />
                  <datalist id="budget-options">
                    {budgetOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </datalist>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="builder-footer">
              <div>
                {builderStep !== 'choice' && (
                  <button
                    className="back-btn"
                    onClick={() => setBuilderStep('choice')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}
              </div>
              <div>
                {builderStep === 'ai-prompt' && (
                  <button className="generate-btn" onClick={handleGenerate}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6 4.8 2.4-7.2-6-4.8h7.2z" />
                    </svg>
                    Generate Build
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BRANDS TICKER
         ════════════════════════════════════════════ */}
      <div className="brands-section">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--text-dim)',
            margin: 0,
          }}>
            Trusted by top brands
          </p>
        </div>
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          <div className="brands-track">
            {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
              <img key={i} src={logo.src} alt={logo.alt} className="brand-logo" />
            ))}
          </div>
        </div>
      </div>

      

      {/* ════════════════════════════════════════════
          BRAND ACCESSORY SHOWCASE
         ════════════════════════════════════════════ */}
      <BrandAccessoryShowcase />

      {/* ════════════════════════════════════════════
          CATEGORIES
         ════════════════════════════════════════════ */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-badge">
              <span className="section-badge-line" />
              Shop by Category
            </div>
            <h2 className="section-title">Browse Categories</h2>
          </div>
          <Link href="/product-page" className="section-view-all">
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="cat-grid">
          {storefrontCategories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/product-page?category=${encodeURIComponent(cat.name.toLowerCase().replace(/\s+/g, '-'))}`}
              className="cat-card"
              style={{ animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` }}
            >
              <div className="cat-img-wrap">
                <div className="cat-img-inner">
                  <img src={getCategoryImage(cat.name)} alt={cat.name} className="cat-img" />
                </div>
              </div>
              <div style={{ marginTop: 4 }}>
                <div className="cat-name">{cat.name}</div>
                <div className="cat-count">Discover {cat.productCount} Products</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="section-divider"><div className="section-divider-line" /></div>

  
      {/* ════════════════════════════════════════════
          POPULAR PRODUCTS
         ════════════════════════════════════════════ */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-badge">
              <span className="section-badge-line" />
              Most Popular
            </div>
            <h2 className="section-title">Trending Now</h2>
          </div>
          <Link href="/product-page" className="section-view-all">
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="product-grid">
          {popularProducts.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} delay={i} />
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          FOOTER BRANDS (Second Ticker)
         ════════════════════════════════════════════ */}
      <div className="brands-section">
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          <div className="brands-track" style={{ animationDirection: 'reverse' }}>
            {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
              <img key={i} src={logo.src} alt={logo.alt} className="brand-logo" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

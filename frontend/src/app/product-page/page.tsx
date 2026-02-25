'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import MegaMenu from '../mega-menu/megaMenu';

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
`

const sortOptions = ['Featured', 'Price: Low', 'Price: High', 'Newest', 'Top Rated']

const toCategorySlug = (value: string) =>
  value
    .replace(/\(.*?\)/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  cpu: ['cpu', 'cpus', 'processor', 'processors', 'ryzen', 'intel'],
  gpu: ['gpu', 'gpus', 'graphics', 'graphic', 'video-card', 'videocard', 'rtx', 'radeon'],
  ram: ['ram', 'memory', 'ddr4', 'ddr5'],
  storage: ['storage', 'ssd', 'hdd', 'nvme', 'm2', 'hard-drive', 'harddisk'],
  psu: ['psu', 'power', 'power-supply', 'powersupply'],
  motherboard: ['motherboard', 'board', 'mainboard'],
  cooling: ['cooling', 'cooler', 'aio', 'fan', 'fans'],
  case: ['case', 'chassis', 'tower'],
  monitor: ['monitor', 'display', 'screen'],
  keyboard: ['keyboard', 'keyboards'],
  mouse: ['mouse', 'mice'],
  headset: ['headset', 'headphones', 'audio'],
}

const toTokens = (value: string) =>
  toCategorySlug(value).split('-').filter(Boolean)

const hasTokenOverlap = (left: string[], right: string[]) => left.some(token => right.includes(token))


function FilterSection({ label, open, onToggle, children }: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{
      background: 'var(--background)', border: '1px solid var(--border)',
      borderRadius: 12, marginBottom: 8, overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '14px 16px', background: 'none',
        border: 'none', cursor: 'pointer',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 12, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.01em',
      }}>
        {label}
        <span style={{
          fontSize: 14, color: 'var(--text-dim)', lineHeight: 1, display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
        }}>▾</span>
      </button>
      {open && (
        <div style={{
          padding: '4px 16px 16px', display: 'flex',
          flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border)',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

function FilterCheckbox({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void
}) {
  return (
    <label onClick={onChange} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <div style={{
        width: 16, height: 16, flexShrink: 0, borderRadius: 5,
        border: `1.5px solid ${checked ? 'var(--brand-red)' : 'var(--border-strong)'}`,
        background: checked ? 'var(--brand-red)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M2 4L4 6L8 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{
        fontSize: 13, color: checked ? 'var(--foreground)' : 'var(--text-muted)',
        fontWeight: checked ? 700 : 500,
        fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'color 0.2s',
      }}>
        {label}
      </span>
    </label>
  )
}

function PagBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode; onClick: () => void;
  disabled?: boolean; active?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      minWidth: 40, height: 40, padding: '0 8px',
      background: active ? 'var(--foreground)' : 'var(--background)',
      border: `1px solid ${active ? 'var(--foreground)' : 'var(--border-strong)'}`,
      borderRadius: 10,
      color: active ? 'var(--background)' : disabled ? 'var(--text-dim)' : 'var(--foreground)',
      fontSize: 14, fontWeight: active ? 700 : 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: active ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
    }}>
      {children}
    </button>
  )
}

function GridCard({ product, wished, onWish, delay }: {
  product: any; wished: boolean; onWish: () => void; delay: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/product-page/${product.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: 'var(--background)',
          border: `1px solid ${hovered ? 'var(--brand-red)' : 'var(--border)'}`,
          borderRadius: 20, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          animation: `fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay * 50}ms both`,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: hovered
            ? '0 20px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(255,40,0,0.08)'
            : '0 4px 12px rgba(0,0,0,0.04)',
          cursor: 'pointer', position: 'relative',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        }}
      >
        {/* Image Container */}
        <div style={{
          position: 'relative', height: 320,
          background: 'var(--surface)',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl} alt={product.name}
              style={{
                width: '85%', height: '85%', objectFit: 'contain',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.1))',
              }}
            />
          ) : (
            <div style={{ fontSize: 48, opacity: 0.1, color: 'var(--foreground)' }}>◈</div>
          )}

          {product.category && (
            <span style={{
              position: 'absolute', top: 16, left: 16,
              background: 'var(--background)', backdropFilter: 'blur(8px)',
              color: 'var(--foreground)', fontSize: 11, fontWeight: 800,
              letterSpacing: '0.02em', padding: '5px 12px', borderRadius: 30,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              {product.category.name}
            </span>
          )}

          <button
            onClick={e => { e.stopPropagation(); onWish() }}
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 36, height: 36, borderRadius: 12,
              background: wished ? 'var(--brand-red)' : 'var(--background)',
              border: `1px solid ${wished ? 'var(--brand-red)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <svg width="16" height="16" fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : 'var(--foreground)'} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
          </button>

          {product.stock === 0 && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(var(--background-rgb), 0.7)',
              backdropFilter: 'blur(2px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 12, fontWeight: 800, color: 'var(--text-muted)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                border: '1px solid var(--border-strong)', padding: '8px 20px', borderRadius: 40,
                background: 'var(--background)',
              }}>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: 10 }}>
          <div>
            <div style={{
              fontSize: 11, color: 'var(--text-dim)',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
            }}>
              {product.sku}
            </div>

            <p style={{
              margin: 0, fontSize: 16, fontWeight: 800,
              color: 'var(--foreground)', lineHeight: 1.4,
              fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em',
            }}>
              {product.name}
            </p>
          </div>

          {product.description && (
            <p style={{
              margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6,
              fontFamily: "'DM Sans', sans-serif",
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {product.description}
            </p>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
            <span style={{
              fontSize: 22, fontWeight: 900, color: 'var(--foreground)',
              fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.04em',
            }}>
              DTN {product.price ? product.price.toFixed(2) : "0.00"}
            </span>
            <button
              disabled={product.stock === 0}
              style={{
                background: product.stock === 0 ? 'transparent' : 'var(--brand-red)',
                color: product.stock === 0 ? 'var(--text-dim)' : '#fff',
                border: product.stock === 0 ? '1px solid var(--border)' : 'none',
                padding: '10px 20px', borderRadius: 12,
                fontSize: 13, fontWeight: 800,
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.01em', transition: 'all 0.2s',
                boxShadow: product.stock === 0 ? 'none' : '0 4px 12px rgba(255,40,0,0.2)',
              }}
            >
              {product.stock === 0 ? 'Sold Out' : 'View Build →'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ListCard({ product, wished, onWish, delay }: {
  product: any; wished: boolean; onWish: () => void; delay: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/product-page/${product.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: 'var(--background)',
          border: `1px solid ${hovered ? 'var(--brand-red)' : 'var(--border)'}`,
          borderRadius: 20, overflow: 'hidden', display: 'flex',
          animation: `fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay * 40}ms both`,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: hovered ? '0 12px 30px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.02)',
          transform: hovered ? 'translateX(4px)' : 'translateX(0)',
        }}
      >
        <div style={{
          width: 180, flexShrink: 0,
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
            : <div style={{ fontSize: 36, opacity: 0.1, color: 'var(--foreground)' }}>◈</div>
          }
        </div>

        <div style={{
          padding: '20px 28px', flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              fontSize: 10, color: 'var(--text-dim)',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {product.sku}{product.category && ` · ${product.category.name}`}
            </div>
            <p style={{
              margin: 0, fontSize: 18, fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--foreground)', letterSpacing: '-0.02em',
            }}>
              {product.name}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              {product.description}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16, flexShrink: 0 }}>
            <span style={{
              fontSize: 24, fontWeight: 900, color: 'var(--brand-red)',
              fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.04em',
            }}>
              ${product.price ? product.price.toFixed(2) : "0.00"}
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onWish}
                style={{
                  width: 42, height: 42, borderRadius: 12,
                  border: `1px solid ${wished ? 'var(--brand-red)' : 'var(--border)'}`,
                  background: wished ? 'var(--brand-red)' : 'var(--background)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                <svg width="18" height="18" fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : 'var(--foreground)'} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
              </button>
              <button
                disabled={product.stock === 0}
                style={{
                  background: product.stock === 0 ? 'transparent' : 'var(--foreground)',
                  color: product.stock === 0 ? 'var(--text-dim)' : 'var(--background)',
                  border: product.stock === 0 ? '1px solid var(--border)' : 'none',
                  padding: '0 24px', height: 42, borderRadius: 12,
                  fontSize: 14, fontWeight: 800,
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '-0.01em', transition: 'all 0.2s',
                  boxShadow: product.stock === 0 ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {product.stock === 0 ? 'Sold Out' : 'See Details'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [userSelectedCategory, setUserSelectedCategory] = useState(false)
  const [sortIndex, setSortIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [wished, setWished] = useState<string[]>([])

  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [openSections, setOpenSections] = useState({ brand: true, price: true, features: true })

  const { categories } = useCategories()
  const requestedCategorySlug = searchParams.get('category')?.toLowerCase() ?? undefined
  const requestedCategoryKey = searchParams.get('categoryKey')?.toLowerCase() ?? undefined
  const requestedKeywords = requestedCategoryKey ? CATEGORY_KEYWORDS[requestedCategoryKey] ?? [] : []
  const requestedSlugTokens = requestedCategorySlug ? toTokens(requestedCategorySlug) : []
  const categoryFromQuery = categories.find(category => {
    const categorySlug = toCategorySlug(category.name)
    const categoryTokens = toTokens(category.name)

    if (requestedCategorySlug && categorySlug === requestedCategorySlug) return true
    if (requestedKeywords.length > 0) {
      return requestedKeywords.some(keyword => categorySlug.includes(keyword) || categoryTokens.includes(keyword))
    }
    if (requestedSlugTokens.length > 0) {
      return hasTokenOverlap(requestedSlugTokens, categoryTokens)
    }
    return false
  })?.id
  const activeCategory = userSelectedCategory ? selectedCategory : (categoryFromQuery ?? selectedCategory)

  const { products, total, loading, error, refetch } = useProducts({
    page: currentPage,
    categoryId: activeCategory,
  })

  const totalPages = Math.ceil(total / 20)

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const toggleFilter = (val: string, arr: string[], setter: (a: string[]) => void) =>
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])

  const toggleWish = (id: string) =>
    setWished(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])

  const handleCategoryChange = (id: string | undefined) => {
    setUserSelectedCategory(true)
    setSelectedCategory(id)
    setCurrentPage(1)
  }

  const categoryName = activeCategory
    ? categories.find(c => c.id === activeCategory)?.name?.toUpperCase() ?? 'Products'
    : 'Store Front'

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      background: 'var(--background)',
      minHeight: '100vh',
      color: 'var(--foreground)',
    }}>
      <style>{`
        ${FONTS}
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtlePulse {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50%       { transform: scale(1.05); opacity: 0.15; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::selection { background: var(--brand-red); color: #fff; }
      `}</style>

      <MegaMenu />

      {/* ── Hero Banner ── */}
      <div style={{
        position: 'relative', height: 320, overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--background) 0%, var(--surface) 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Soft texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage: `radial-gradient(var(--foreground) 1.2px, transparent 1.2px)`,
          backgroundSize: '32px 32px',
        }} />

        {/* Radial brand glow */}
        <div style={{
          position: 'absolute', right: '15%', top: '50%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,40,0,0.06) 0%, transparent 70%)',
          animation: 'subtlePulse 4s ease-in-out infinite',
        }} />

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '0 80px', maxWidth: 850,
          zIndex: 10,
        }}>
          <div style={{
            fontSize: 12, letterSpacing: '0.2em', color: 'var(--brand-red)',
            fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 16, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ width: 30, height: 2, background: 'var(--brand-red)', borderRadius: 2 }} />
            Premium Performance Hardware
          </div>

          <h1 style={{
            margin: 0, fontSize: 64, fontWeight: 900, lineHeight: 1.1,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.04em', color: 'var(--foreground)',
          }}>
            {categoryName}
          </h1>

          <p style={{
            margin: '20px 0 0', fontSize: 16, color: 'var(--text-muted)',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500, maxWidth: 500,
          }}>
            Exploration without limits. Power your setup with our world-class selection of {categoryName.toLowerCase()}.
          </p>
        </div>
      </div>

      {/* ── Category Navigation ── */}
      <div style={{
        background: 'var(--background)', borderBottom: '1px solid var(--border)',
        padding: '0 40px', overflowX: 'auto', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {[{ id: undefined, name: 'All Collection' }, ...categories].map(cat => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={String(cat.id)}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  padding: '20px 24px', background: 'none', border: 'none',
                  borderBottom: isActive ? '3px solid var(--brand-red)' : '3px solid transparent',
                  color: isActive ? 'var(--foreground)' : 'var(--text-dim)',
                  fontSize: 14, fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.2s', whiteSpace: 'nowrap', letterSpacing: '-0.01em',
                }}
              >
                {cat.name ?? 'All Collection'}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: '40px', display: 'flex', gap: 40, alignItems: 'flex-start',
      }}>

        {/* ── Sidebar Filters ── */}
        <aside style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, position: 'sticky', top: 100 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-dim)',
            textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif",
            paddingBottom: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            Filter Results
            <span style={{ fontSize: 13, background: 'var(--surface-hover)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 6, textTransform: 'none', letterSpacing: 0 }}>{total}</span>
          </div>

          <FilterSection label="Brand" open={openSections.brand} onToggle={() => toggleSection('brand')}>
            {['ASUS ROG', 'MSI', 'Corsair', 'Logitech G', 'Razer', 'SteelSeries'].map(b => (
              <FilterCheckbox key={b} label={b}
                checked={selectedBrands.includes(b)}
                onChange={() => toggleFilter(b, selectedBrands, setSelectedBrands)} />
            ))}
          </FilterSection>

          <FilterSection label="Price Range" open={openSections.price} onToggle={() => toggleSection('price')}>
            {['Under $100', '$100 – $250', '$250 – $500', '$500+'].map(p => (
              <FilterCheckbox key={p} label={p}
                checked={selectedPrices.includes(p)}
                onChange={() => toggleFilter(p, selectedPrices, setSelectedPrices)} />
            ))}
          </FilterSection>

          <FilterSection label="Key Features" open={openSections.features} onToggle={() => toggleSection('features')}>
            {['RGB Lighting', 'Wireless', '4K Support', 'Mechanical', 'Haptic Feed'].map(f => (
              <FilterCheckbox key={f} label={f}
                checked={selectedFeatures.includes(f)}
                onChange={() => toggleFilter(f, selectedFeatures, setSelectedFeatures)} />
            ))}
          </FilterSection>

          {(selectedBrands.length > 0 || selectedFeatures.length > 0 || selectedPrices.length > 0) && (
            <button
              onClick={() => { setSelectedBrands([]); setSelectedFeatures([]); setSelectedPrices([]) }}
              style={{
                marginTop: 12, padding: '12px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                borderRadius: 12, transition: 'all 0.2s',
              }}
            >
              Reset Filters
            </button>
          )}
        </aside>

        {/* ── Main Product Display ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', gap: 6, background: 'var(--surface-hover)', padding: '4px', borderRadius: 12 }}>
              {sortOptions.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => setSortIndex(i)}
                  style={{
                    padding: '8px 16px',
                    background: sortIndex === i ? 'var(--background)' : 'transparent',
                    border: 'none',
                    borderRadius: 10,
                    color: sortIndex === i ? 'var(--foreground)' : 'var(--text-muted)',
                    fontSize: 13, fontWeight: sortIndex === i ? 800 : 600,
                    cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: 'all 0.2s',
                    boxShadow: sortIndex === i ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {(['grid', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    width: 42, height: 42, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border)',
                    background: viewMode === mode ? 'var(--foreground)' : 'var(--background)',
                    cursor: 'pointer',
                    color: viewMode === mode ? 'var(--background)' : 'var(--foreground)',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  {mode === 'grid' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content States ── */}
          {loading ? (
            <div style={{
              display: 'flex', justifyContent: 'center',
              alignItems: 'center', height: 400, flexDirection: 'column', gap: 24,
            }}>
              <div style={{
                width: 48, height: 48,
                border: '3px solid var(--border)', borderTop: '3px solid var(--brand-red)',
                borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite',
              }} />
              <span style={{
                fontSize: 14, color: 'var(--text-dim)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, letterSpacing: '0.05em',
              }}>
                SYNCHRONIZING COLLECTION...
              </span>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 80, background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--brand-red)', fontSize: 14, fontWeight: 600, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
                Unable to load products: {error}
              </p>
              <button
                onClick={refetch}
                style={{
                  background: 'var(--foreground)', color: 'var(--background)', border: 'none',
                  padding: '12px 36px', fontSize: 13, cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, borderRadius: 12,
                }}
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 120, background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 56, marginBottom: 24, opacity: 0.1 }}>◈</div>
              <p style={{
                color: 'var(--text-muted)', fontSize: 15, fontWeight: 600, marginBottom: 24,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                We couldn't find any products matching your selection.
              </p>
              <button
                onClick={() => handleCategoryChange(undefined)}
                style={{
                  color: 'var(--brand-red)', background: 'var(--background)', border: '1.5px solid var(--brand-red)',
                  padding: '12px 28px', fontSize: 14, cursor: 'pointer', borderRadius: 12,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(255,40,0,0.1)',
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr',
                gap: viewMode === 'grid' ? 24 : 16,
              }}>
                {products.map((product, i) =>
                  viewMode === 'grid' ? (
                    <GridCard
                      key={product.id} product={product}
                      wished={wished.includes(product.id)}
                      onWish={() => toggleWish(product.id)} delay={i}
                    />
                  ) : (
                    <ListCard
                      key={product.id} product={product}
                      wished={wished.includes(product.id)}
                      onWish={() => toggleWish(product.id)} delay={i}
                    />
                  )
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 64, padding: '24px', borderTop: '1px solid var(--border)' }}>
                  <PagBtn
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </PagBtn>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <PagBtn key={p} onClick={() => setCurrentPage(p)} active={p === currentPage}>
                      {p}
                    </PagBtn>
                  ))}

                  <PagBtn
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </PagBtn>
                </div>

              )}
            </>
          )}
        </div>
      </div>

      {/* ── Footer Subtle Decor ── */}
      <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-red)', opacity: 0.3 }} />
      </div>
    </div>
  )
}

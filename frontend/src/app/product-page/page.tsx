'use client'

import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import MegaMenu from '../mega-menu/megaMenu';

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
`

const sortOptions = ['Featured', 'Price: Low', 'Price: High', 'Newest', 'Top Rated']


function FilterSection({ label, open, onToggle, children }: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{
      background: '#0f0f0f', border: '1px solid #1a1a1a',
      borderRadius: 8, marginBottom: 6, overflow: 'hidden',
    }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '11px 14px', background: 'none',
        border: 'none', cursor: 'pointer',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: '0.04em',
      }}>
        {label}
        <span style={{
          fontSize: 13, color: '#2a2a2a', lineHeight: 1, display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
        }}>▾</span>
      </button>
      {open && (
        <div style={{
          padding: '4px 14px 12px', display: 'flex',
          flexDirection: 'column', gap: 8, borderTop: '1px solid #151515',
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
        width: 14, height: 14, flexShrink: 0, borderRadius: 3,
        border: `1.5px solid ${checked ? '#ff2800' : '#2a2a2a'}`,
        background: checked ? '#ff2800' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="white">
            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <span style={{
        fontSize: 12, color: checked ? '#e0e0e0' : '#555',
        fontWeight: checked ? 600 : 400,
        fontFamily: "'DM Sans', sans-serif", transition: 'color 0.15s',
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
      minWidth: 34, height: 34, padding: '0 6px',
      background: active ? '#ff2800' : 'transparent',
      border: `1px solid ${active ? '#ff2800' : '#1e1e1e'}`,
      borderRadius: 6,
      color: active ? '#fff' : disabled ? '#222' : '#666',
      fontSize: 13, fontWeight: active ? 700 : 400,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
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
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0d0d0d',
        border: `1px solid ${hovered ? '#ff2800' : '#1a1a1a'}`,
        borderRadius: 10, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: `fadeUp 0.4s ease ${delay * 45}ms both`,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered
          ? '0 0 24px rgba(255,40,0,0.09), 0 8px 32px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer', position: 'relative',
      }}
    >
      {/* Image */}
      <div style={{
        position: 'relative', height: 300,
        background: 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)',
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl} alt={product.name}
            style={{
              width: '80%', height: '80%', objectFit: 'cover',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.4s ease',
            }}
          />
        ) : (
          <div style={{ fontSize: 48, opacity: 0.05, color: '#fff' }}>◈</div>
        )}

        {product.category && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(255,40,0,0.9)', backdropFilter: 'blur(4px)',
            color: '#fff', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.05em', padding: '3px 9px', borderRadius: 20,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {product.category.name}
          </span>
        )}

        <button
          onClick={e => { e.stopPropagation(); onWish() }}
          style={{
            position: 'absolute', bottom: 10, right: 10,
            width: 30, height: 30, borderRadius: 6,
            background: wished ? '#ff2800' : 'rgba(0,0,0,0.6)',
            border: `1px solid ${wished ? '#ff2800' : '#2a2a2a'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s', backdropFilter: 'blur(4px)',
          }}
        >
          <svg width="12" height="12" fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : '#666'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
          </svg>
        </button>

        {product.stock === 0 && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#444',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              border: '1px solid #2a2a2a', padding: '5px 14px', borderRadius: 20,
            }}>Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{
          fontSize: 10, color: '#2e2e2e',
          fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5,
        }}>
          {product.sku}
        </div>

        <p style={{
          margin: '0 0 6px', fontSize: 14, fontWeight: 700,
          color: '#d0d0d0', lineHeight: 1.3,
          fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.01em',
        }}>
          {product.name}
        </p>

        {product.description && (
          <p style={{
            margin: '0 0 12px', fontSize: 12, color: '#444', lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif",
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.description}
          </p>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 20, fontWeight: 800, color: '#ff2800',
            fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em',
          }}>
            ${product.price.toFixed(2)}
          </span>
          <button
            disabled={product.stock === 0}
            style={{
              background: product.stock === 0 ? 'transparent' : '#ff2800',
              color: product.stock === 0 ? '#333' : '#fff',
              border: product.stock === 0 ? '1px solid #1e1e1e' : 'none',
              padding: '7px 16px', borderRadius: 7,
              fontSize: 12, fontWeight: 700,
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.01em', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.background = '#cc2200' }}
            onMouseLeave={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.background = '#ff2800' }}
          >
            {product.stock === 0 ? 'Unavailable' : 'View →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ListCard({ product, wished, onWish, delay }: {
  product: any; wished: boolean; onWish: () => void; delay: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0d0d0d',
        border: `1px solid ${hovered ? '#ff2800' : '#1a1a1a'}`,
        borderRadius: 10, overflow: 'hidden', display: 'flex',
        animation: `fadeUp 0.35s ease ${delay * 30}ms both`,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? '0 0 20px rgba(255,40,0,0.07)' : 'none',
      }}
    >
      <div style={{
        width: 150, flexShrink: 0,
        background: 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} style={{ width: '80%', height: '80%', objectFit: 'cover' }} />
          : <div style={{ fontSize: 36, opacity: 0.05, color: '#fff' }}>◈</div>
        }
      </div>

      <div style={{
        padding: '16px 20px', flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 10, color: '#2e2e2e',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4,
          }}>
            {product.sku}{product.category && ` · ${product.category.name}`}
          </div>
          <p style={{
            margin: '0 0 6px', fontSize: 15, fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#d0d0d0', letterSpacing: '-0.02em',
          }}>
            {product.name}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#444', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
            {product.description}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
          <span style={{
            fontSize: 22, fontWeight: 800, color: '#ff2800',
            fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em',
          }}>
            ${product.price.toFixed(2)}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={onWish}
              style={{
                width: 34, height: 34, borderRadius: 7,
                border: `1px solid ${wished ? '#ff2800' : '#1e1e1e'}`,
                background: wished ? '#ff2800' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <svg width="13" height="13" fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : '#555'} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
              </svg>
            </button>
            <button
              disabled={product.stock === 0}
              style={{
                background: product.stock === 0 ? 'transparent' : '#ff2800',
                color: product.stock === 0 ? '#333' : '#fff',
                border: product.stock === 0 ? '1px solid #1e1e1e' : 'none',
                padding: '0 18px', height: 34, borderRadius: 7,
                fontSize: 12, fontWeight: 700,
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.01em', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.background = '#cc2200' }}
              onMouseLeave={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.background = '#ff2800' }}
            >
              {product.stock === 0 ? 'Unavailable' : 'View →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [sortIndex, setSortIndex]               = useState(0)
  const [viewMode, setViewMode]                 = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage]           = useState(1)
  const [wished, setWished]                     = useState<string[]>([])

  const [selectedBrands, setSelectedBrands]     = useState<string[]>([])
  const [selectedPrices, setSelectedPrices]     = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [openSections, setOpenSections]         = useState({ brand: true, price: true, features: true })

  /* ── Real data hooks ── */
  const { categories } = useCategories()

  const { products, total, loading, error, refetch } = useProducts({
    page:       currentPage,
    categoryId: selectedCategory,
    // extend with sort / brand / price / feature filters when your API supports them
  })

  const totalPages = Math.ceil(total / 20) // matches your default limit of 20

  /* ── Helpers ── */
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const toggleFilter = (val: string, arr: string[], setter: (a: string[]) => void) =>
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])

  const toggleWish = (id: string) =>
    setWished(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])

  const handleCategoryChange = (id: string | undefined) => {
    setSelectedCategory(id)
    setCurrentPage(1)
  }

  const categoryName = selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name?.toUpperCase() ?? 'Products'
    : 'All Products'

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      background: '#090909',
      minHeight: '100vh',
      color: '#e0e0e0',
    }}>
      <style>{`
        ${FONTS}
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.7; transform: translateY(-50%) scale(1); }
          50%       { opacity: 1;  transform: translateY(-50%) scale(1.05); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      <MegaMenu />

      {/* ── Hero Banner ── */}
      <div style={{
        position: 'relative', height: 280, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #180404 40%, #0d0d0d 100%)',
        borderBottom: '1px solid #1a1a1a',
      }}>
        {/* Dot-grid texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(255,40,0,0.08) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }} />
        {/* Radial glow */}
        <div style={{
          position: 'absolute', right: '18%', top: '50%',
          transform: 'translateY(-50%)',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,30,0,0.13) 0%, transparent 70%)',
          animation: 'pulseGlow 3s ease-in-out infinite',
        }} />

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '0 56px', maxWidth: 700,
        }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.18em', color: '#ff2800',
            fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 10, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 20, height: 1, background: '#ff2800', display: 'inline-block' }} />
            The Takeover Is Complete
          </div>

          <h1 style={{
            margin: 0, fontSize: 56, fontWeight: 800, lineHeight: 1,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.03em', color: '#ffffff',
          }}>
            {categoryName}
          </h1>

          {!loading && (
            <p style={{
              margin: '12px 0 0', fontSize: 13, color: '#555',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
            }}>
              {total} items in collection
            </p>
          )}
        </div>

        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 4,
          background: 'linear-gradient(180deg, #ff2800, #880000)',
        }} />
      </div>

      {/* ── Category Tabs ── */}
      <div style={{
        background: '#0f0f0f', borderBottom: '1px solid #1a1a1a',
        padding: '0 24px', overflowX: 'auto',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 0, alignItems: 'center' }}>
          {[{ id: undefined, name: 'All' }, ...categories].map(cat => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={String(cat.id)}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  padding: '14px 18px', background: 'none', border: 'none',
                  borderBottom: isActive ? '2px solid #ff2800' : '2px solid transparent',
                  color: isActive ? '#ff2800' : '#555',
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.2s', whiteSpace: 'nowrap', letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#ccc' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#555' }}
              >
                {cat.name ?? 'All'}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: '28px 24px', display: 'flex', gap: 24, alignItems: 'flex-start',
      }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#333',
            textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif",
            paddingBottom: 10, borderBottom: '1px solid #1a1a1a', marginBottom: 4,
          }}>
            Filters
          </div>

          <FilterSection label="Brand" open={openSections.brand} onToggle={() => toggleSection('brand')}>
            {['ASUS ROG', 'MSI', 'Corsair', 'Logitech G', 'Razer', 'SteelSeries'].map(b => (
              <FilterCheckbox key={b} label={b}
                checked={selectedBrands.includes(b)}
                onChange={() => toggleFilter(b, selectedBrands, setSelectedBrands)} />
            ))}
          </FilterSection>

          <FilterSection label="Price" open={openSections.price} onToggle={() => toggleSection('price')}>
            {['Under $100', '$100 – $250', '$250 – $500', '$500+'].map(p => (
              <FilterCheckbox key={p} label={p}
                checked={selectedPrices.includes(p)}
                onChange={() => toggleFilter(p, selectedPrices, setSelectedPrices)} />
            ))}
          </FilterSection>

          <FilterSection label="Features" open={openSections.features} onToggle={() => toggleSection('features')}>
            {['RGB Lighting', 'Wireless', '4K Support', 'Mechanical', 'Haptic'].map(f => (
              <FilterCheckbox key={f} label={f}
                checked={selectedFeatures.includes(f)}
                onChange={() => toggleFilter(f, selectedFeatures, setSelectedFeatures)} />
            ))}
          </FilterSection>

          {(selectedBrands.length > 0 || selectedFeatures.length > 0 || selectedPrices.length > 0) && (
            <button
              onClick={() => { setSelectedBrands([]); setSelectedFeatures([]); setSelectedPrices([]) }}
              style={{
                marginTop: 4, padding: '8px 12px',
                background: 'transparent', border: '1px solid #ff2800',
                color: '#ff2800', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                borderRadius: 7, transition: 'all 0.2s', letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,40,0,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #1a1a1a',
          }}>
            {/* Sort tabs */}
            <div style={{ display: 'flex', gap: 4 }}>
              {sortOptions.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => setSortIndex(i)}
                  style={{
                    padding: '7px 14px',
                    background: sortIndex === i ? 'rgba(255,40,0,0.1)' : 'none',
                    border: `1px solid ${sortIndex === i ? '#ff2800' : '#1e1e1e'}`,
                    borderRadius: 7,
                    color: sortIndex === i ? '#ff2800' : '#555',
                    fontSize: 12, fontWeight: sortIndex === i ? 700 : 500,
                    cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: 'all 0.15s', letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => { if (sortIndex !== i) (e.currentTarget as HTMLButtonElement).style.color = '#ccc' }}
                  onMouseLeave={e => { if (sortIndex !== i) (e.currentTarget as HTMLButtonElement).style.color = '#555' }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {(['grid', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    width: 34, height: 34, borderRadius: 7,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${viewMode === mode ? '#ff2800' : '#1e1e1e'}`,
                    background: viewMode === mode ? 'rgba(255,40,0,0.1)' : 'transparent',
                    cursor: 'pointer',
                    color: viewMode === mode ? '#ff2800' : '#444',
                    transition: 'all 0.15s',
                  }}
                >
                  {mode === 'grid' ? (
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
                      <rect x="0" y="0" width="6" height="6" rx="1"/>
                      <rect x="8" y="0" width="6" height="6" rx="1"/>
                      <rect x="0" y="8" width="6" height="6" rx="1"/>
                      <rect x="8" y="8" width="6" height="6" rx="1"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
                      <rect x="0" y="0" width="14" height="3" rx="1"/>
                      <rect x="0" y="5.5" width="14" height="3" rx="1"/>
                      <rect x="0" y="11" width="14" height="3" rx="1"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div style={{
              display: 'flex', justifyContent: 'center',
              alignItems: 'center', height: 300, flexDirection: 'column', gap: 16,
            }}>
              <div style={{
                width: 36, height: 36,
                border: '2px solid #1e1e1e', borderTop: '2px solid #ff2800',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{
                fontSize: 12, color: '#333',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500, letterSpacing: '0.04em',
              }}>
                Loading products…
              </span>
            </div>
          )}

          {/* ── Error ── */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p style={{ color: '#444', fontSize: 13, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
                {error}
              </p>
              <button
                onClick={refetch}
                style={{
                  background: '#ff2800', color: '#fff', border: 'none',
                  padding: '10px 28px', fontSize: 12, cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, borderRadius: 7, letterSpacing: '-0.01em',
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && !error && products.length === 0 && (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.1 }}>◈</div>
              <p style={{
                color: '#333', fontSize: 13, marginBottom: 16,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                No products found
              </p>
              <button
                onClick={() => handleCategoryChange(undefined)}
                style={{
                  color: '#ff2800', background: 'none', border: '1px solid #ff2800',
                  padding: '8px 20px', fontSize: 12, cursor: 'pointer', borderRadius: 7,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* ── Product Grid / List ── */}
          {!loading && !error && products.length > 0 && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr',
                gap: viewMode === 'grid' ? 12 : 8,
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 40 }}>
                  <PagBtn
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >‹</PagBtn>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <PagBtn key={p} onClick={() => setCurrentPage(p)} active={p === currentPage}>
                      {p}
                    </PagBtn>
                  ))}

                  <PagBtn
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >›</PagBtn>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
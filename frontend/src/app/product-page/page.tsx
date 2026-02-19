'use client'

import { useState, useRef, useEffect } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import MegaMenu from '../mega-menu/megaMenu'

const seedMessages: { id: number; role: string; text: string; time: string }[] = []

const suggestedQuestions = [
  'Show me pricing plans',
  'How can AI help me shop?',
  'Find products under $50',
  'What are the best sellers?',
  'Do you offer free shipping?',
]


const BRANDS = ['Oculus', 'HTC', 'Samsung', 'Google', 'Sony']
const FEATURES = ['Wireless', '4K Display', 'Built-in Audio', 'Eye Tracking']
const PRICE_RANGES = ['Under $50', '$50 – $100', '$100 – $300', '$300+']

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortIndex, setSortIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    brand: true,
    features: true,
    price: true,
  })
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])

  const { products, total, loading, error, refetch } = useProducts({
    page: currentPage,
    limit: 20,
    categoryId: selectedCategory,
  })
  const { categories } = useCategories()

  const [wished, setWished] = useState<string[]>([])
  const [messages, setMessages] = useState(seedMessages)
  const [input, setInput] = useState('')
  const [chatStarted, setChatStarted] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [aiOpen, setAiOpen] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(total / 20)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleWish = (id: string) =>
    setWished(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleCategoryChange = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }

  const handleSend = (text?: string) => {
    const msg = text ?? input
    if (!msg.trim()) return
    setChatStarted(true)
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        text: msg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInput('')
  }

  const toggleSection = (key: string) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const toggleFilter = (
    val: string,
    selected: string[],
    setSelected: (v: string[]) => void
  ) => {
    setSelected(
      selected.includes(val) ? selected.filter(x => x !== val) : [...selected, val]
    )
  }

  const visibleSuggestions = showMore ? suggestedQuestions : suggestedQuestions.slice(0, 3)

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: '#f8f8fa', minHeight: '100vh' }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <MegaMenu />

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '10px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <nav style={{ fontSize: 12, color: '#999', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ cursor: 'pointer' }}>Home</span>
            <span>›</span>
            <span style={{ cursor: 'pointer', color: '#999' }}>
              {categories.find(c => c.id === selectedCategory)?.name ?? 'Products'}
            </span>
            {selectedCategory && (
              <>
                <span>›</span>
                <span style={{ color: '#333' }}>
                  {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Categories */}
          <div style={{
            background: 'linear-gradient(160deg, #000000 0%, #5b4ccc 100%)',
            borderRadius: 12,
            padding: '20px 0',
            marginBottom: 16,
            boxShadow: '0 4px 20px rgba(108,95,230,0.3)',
          }}>
            <div style={{ padding: '0 20px 12px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              {categories.find(c => c.id === selectedCategory)?.name?.toUpperCase() ?? 'CATEGORIES'}
            </div>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id === selectedCategory ? undefined : cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 20px',
                  background: cat.id === selectedCategory ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: cat.id === selectedCategory ? '#fff' : 'rgba(255,255,255,0.7)',
                  fontSize: 13,
                  fontWeight: cat.id === selectedCategory ? 600 : 400,
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  borderLeft: cat.id === selectedCategory ? '3px solid rgba(255,255,255,0.8)' : '3px solid transparent',
                }}
              >
                <span>{cat.name}</span>
                <span style={{ fontSize: 11, opacity: 0.6, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '1px 7px' }}>
                  {Math.floor(Math.random() * 200) + 10}
                </span>
              </button>
            ))}
          </div>

          {/* Filter: Brand */}
          <FilterSection
            label="Brand"
            open={openSections.brand}
            onToggle={() => toggleSection('brand')}
          >
            {BRANDS.map(b => (
              <FilterCheckbox
                key={b}
                label={b}
                count={Math.floor(Math.random() * 8) + 1}
                checked={selectedBrands.includes(b)}
                onChange={() => toggleFilter(b, selectedBrands, setSelectedBrands)}
              />
            ))}
          </FilterSection>

          {/* Filter: Price */}
          <FilterSection
            label="Price Range"
            open={openSections.price}
            onToggle={() => toggleSection('price')}
          >
            {PRICE_RANGES.map(p => (
              <FilterCheckbox
                key={p}
                label={p}
                checked={selectedPrices.includes(p)}
                onChange={() => toggleFilter(p, selectedPrices, setSelectedPrices)}
              />
            ))}
          </FilterSection>

          {/* Filter: Features */}
          <FilterSection
            label="Features"
            open={openSections.features}
            onToggle={() => toggleSection('features')}
          >
            {FEATURES.map(f => (
              <FilterCheckbox
                key={f}
                label={f}
                checked={selectedFeatures.includes(f)}
                onChange={() => toggleFilter(f, selectedFeatures, setSelectedFeatures)}
              />
            ))}
          </FilterSection>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
                {selectedCategory
                  ? categories.find(c => c.id === selectedCategory)?.name ?? 'Products'
                  : 'All Products'}
              </h1>
              {!loading && (
                <span style={{ fontSize: 12, color: '#999', marginTop: 2, display: 'block' }}>
                  {total} items found
                </span>
              )}
            </div>

            {/* Sort Tabs + View Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              

              {/* Grid / List toggle */}
              <div style={{ display: 'flex', gap: 2 }}>
                {(['grid', 'list'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid',
                      borderColor: viewMode === mode ? '#000000' : '#e0e0e0',
                      background: viewMode === mode ? '#000000' : '#fff',
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: viewMode === mode ? '#fff' : '#aaa',
                      transition: 'all 0.15s',
                    }}
                  >
                    {mode === 'grid' ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                        <rect x="0" y="0" width="6" height="6" rx="1"/>
                        <rect x="8" y="0" width="6" height="6" rx="1"/>
                        <rect x="0" y="8" width="6" height="6" rx="1"/>
                        <rect x="8" y="8" width="6" height="6" rx="1"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                        <rect x="0" y="0" width="14" height="3" rx="1"/>
                        <rect x="0" y="5.5" width="14" height="3" rx="1"/>
                        <rect x="0" y="11" width="14" height="3" rx="1"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
              <div style={{
                width: 36, height: 36, border: '3px solid #e8e8e8',
                borderTop: '3px solid #000000', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: 13, color: '#aaa' }}>Loading products...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p style={{ color: '#999', fontSize: 14, marginBottom: 16 }}>{error}</p>
              <button
                onClick={refetch}
                style={{
                  background: '#000000', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '10px 24px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && products.length === 0 && (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <p style={{ color: '#bbb', fontSize: 14, marginBottom: 12 }}>No products found</p>
              <button
                onClick={() => handleCategoryChange(undefined)}
                style={{ color: '#000000', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr',
                gap: viewMode === 'grid' ? 16 : 10,
              }}>
                {products.map((product, i) =>
                  viewMode === 'grid' ? (
                    <GridCard
                      key={product.id}
                      product={product}
                      wished={wished.includes(product.id)}
                      onWish={() => toggleWish(product.id)}
                      delay={i}
                    />
                  ) : (
                    <ListCard
                      key={product.id}
                      product={product}
                      wished={wished.includes(product.id)}
                      onWish={() => toggleWish(product.id)}
                      delay={i}
                    />
                  )
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 32 }}>
                  <PagBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</PagBtn>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <PagBtn key={p} onClick={() => setCurrentPage(p)} active={p === currentPage}>{p}</PagBtn>
                  ))}
                  <PagBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</PagBtn>
                </div>
              )}
            </>
          )}
        </div>
  

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes orbShimmer {
          from { opacity: 0.4; transform: rotate(0deg); }
          to { opacity: 0.8; transform: rotate(15deg); }
        }
      `}</style>
    </div>
  )
}

/* ── Sub-components ── */

function FilterSection({
  label, open, onToggle, children,
}: {
  label: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: '#222',
          letterSpacing: '0.5px', textTransform: 'uppercase',
        }}
      >
        {label}
        <span style={{ fontSize: 16, color: '#aaa', lineHeight: 1, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ‒
        </span>
      </button>
      {open && (
        <div style={{ padding: '4px 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function FilterCheckbox({
  label, count, checked, onChange,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          onClick={onChange}
          style={{
            width: 14, height: 14, borderRadius: 3, border: '1.5px solid',
            borderColor: checked ? '#000000' : '#d0d0d0',
            background: checked ? '#000000' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          {checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="white"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
        </div>
        <span style={{ fontSize: 12.5, color: '#444' }}>{label}</span>
      </div>
      {count !== undefined && (
        <span style={{ fontSize: 11, color: '#bbb' }}>{count}</span>
      )}
    </label>
  )
}

function GridCard({
  product, wished, onWish, delay,
}: {
  product: any
  wished: boolean
  onWish: () => void
  delay: number
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #ebebeb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: `fadeUp 0.35s ease ${delay * 40}ms both`,
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLDivElement).style.transform = 'none'
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, background: '#f8f8fa', overflow: 'hidden' }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, opacity: 0.2 }}>🛍️</div>
        )}
        {product.category && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: '#000000', color: '#fff',
            fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 4,
          }}>
            {product.category.name}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onWish() }}
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 30, height: 30, borderRadius: '50%',
            background: wished ? '#000000' : 'rgba(255,255,255,0.9)',
            border: '1px solid', borderColor: wished ? '#000000' : 'rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <svg width="13" height="13" fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : '#888'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
          </svg>
        </button>
        {product.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#888', letterSpacing: '0.5px' }}>OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 9, color: '#bbb', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>{product.sku}</div>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500, color: '#1a1a2e', lineHeight: 1.4 }}>{product.name}</p>
        {product.description && (
          <p style={{ margin: '0 0 10px', fontSize: 11, color: '#aaa', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#000000' }}>${product.price.toFixed(2)}</span>
          <button
            disabled={product.stock === 0}
            style={{
              background: product.stock === 0 ? '#f0f0f0' : '#000000',
              color: product.stock === 0 ? '#bbb' : '#fff',
              border: 'none', borderRadius: 8,
              padding: '7px 14px', fontSize: 11, fontWeight: 600,
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', letterSpacing: '0.3px',
              transition: 'all 0.15s',
            }}
          >
            {product.stock === 0 ? 'Unavailable' : 'View Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ListCard({
  product, wished, onWish, delay,
}: {
  product: any
  wished: boolean
  onWish: () => void
  delay: number
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #ebebeb',
        overflow: 'hidden',
        display: 'flex',
        animation: `fadeUp 0.3s ease ${delay * 30}ms both`,
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
    >
      <div style={{ width: 140, flexShrink: 0, background: '#f8f8fa', position: 'relative' }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, opacity: 0.2 }}>🛍️</div>
        )}
      </div>
      <div style={{ padding: '16px 20px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#bbb', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 3 }}>{product.sku}</div>
          <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{product.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>{product.description}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#000000' }}>${product.price.toFixed(2)}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onWish}
              style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid',
                borderColor: wished ? '#000000' : '#e0e0e0',
                background: wished ? '#000000' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <svg width="13" height="13" fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : '#888'} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
              </svg>
            </button>
            <button
              disabled={product.stock === 0}
              style={{
                background: product.stock === 0 ? '#f0f0f0' : '#000000',
                color: product.stock === 0 ? '#bbb' : '#fff',
                border: 'none', borderRadius: 8,
                padding: '0 16px', height: 32, fontSize: 11, fontWeight: 600,
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {product.stock === 0 ? 'Unavailable' : 'View Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PagBtn({
  children, onClick, disabled, active,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 34, height: 34, borderRadius: 8, border: '1px solid',
        borderColor: active ? '#000000' : '#e0e0e0',
        background: active ? '#000000' : '#fff',
        color: active ? '#fff' : disabled ? '#ccc' : '#555',
        fontSize: 13, fontWeight: active ? 600 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}
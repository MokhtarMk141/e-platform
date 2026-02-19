'use client'

import { useState, useRef, useEffect } from 'react'
import { useProducts }   from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import MegaMenu from '../mega-menu/megaMenu'
const seedMessages = [
  { id: 1, role: 'user', text: ' ', time: '2:45 PM' },
 
]
export default function ShopPage() {

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [currentPage, setCurrentPage]           = useState(1)

  const { products, total, loading, error, refetch } = useProducts({
    page:       currentPage,
    limit:      20,
    categoryId: selectedCategory,
  })
  const { categories } = useCategories()

  const [wished, setWished]   = useState<string[]>([])
  const [messages, setMessages] = useState(seedMessages)
  const [input, setInput]       = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(total / 20)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleWish = (id: string) =>
    setWished(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )


  const handleCategoryChange = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }

  return (
    <div> 
        <MegaMenu/>
    <div
      className="relative flex h-screen w-full overflow-hidden bg-black text-white"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >

      <div className="flex flex-1 flex-col overflow-hidden">

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/30">Results:</span>
            <span className="text-[13px] font-semibold text-white">
              {selectedCategory
                ? categories.find(c => c.id === selectedCategory)?.name ?? 'Products'
                : 'All Products'}
            </span>
            {!loading && (
              <span className="text-[11px] text-white/25">[{total} items]</span>
            )}
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto">

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-medium tracking-wider transition-all ${
                  selectedCategory === cat.id
                    ? 'border-white/30 bg-white/10 text-white'
                    : 'border-white/10 bg-transparent text-white/40 hover:border-white/20 hover:text-white/65'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="h-6 w-6 animate-spin text-white/25" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-[12px] text-white/30">Loading products...</span>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <p className="text-[13px] text-white/35">{error}</p>
            <button
              onClick={refetch}
              className="rounded-lg border border-white/15 px-5 py-2 text-[12px] text-white/55 transition-all hover:border-white/30 hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <p className="text-[13px] text-white/35">No products found</p>
            <button
              onClick={() => handleCategoryChange(undefined)}
              className="text-[12px] text-white/40 underline underline-offset-2 hover:text-white/65 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && products.length > 0 && (
          <div className="flex-1 overflow-y-auto px-5 pb-24 pt-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 #000' }}>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#111] transition-all duration-200 hover:-translate-y-[3px] hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
                  style={{ animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 50}ms` }}
                >
                  {/* Top glow */}
                  <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Image */}
                  <div className="relative flex h-[130px] shrink-0 items-center justify-center overflow-hidden bg-[#0d0d0d]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-5xl opacity-60">🖥️</span>
                    )}

                    {/* Category tag */}
                    {product.category && (
                      <div className="absolute left-2.5 top-2.5">
                        <span className="rounded border border-white/15 bg-black/60 px-1.5 py-0.5 text-[9px] tracking-wider text-white/55 backdrop-blur-sm">
                          {product.category.name}
                        </span>
                      </div>
                    )}

                    {/* Low stock badge */}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute right-2.5 top-2.5">
                        <span className="rounded border border-white/10 bg-black/60 px-1.5 py-0.5 text-[9px] text-white/40 backdrop-blur-sm">
                          {product.stock} left
                        </span>
                      </div>
                    )}

                    {/* Out of stock overlay */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                        <span className="text-[11px] font-medium text-white/50">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-3">

                    {/* SKU */}
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span className="font-mono text-[9px] text-white/22">
                        {product.sku}
                      </span>
                    </div>

                    {/* Name */}
                    <p className="mb-1.5 flex-1 text-[11.5px] font-normal leading-snug text-white/75">
                      {product.name}
                    </p>

                    {/* Description (truncated) */}
                    {product.description && (
                      <p className="mb-2 line-clamp-2 text-[10px] leading-relaxed text-white/30">
                        {product.description}
                      </p>
                    )}

                    {/* Price */}
                    <p className="mb-3 text-[14px] font-semibold text-white">
                      ${product.price.toFixed(2)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <button
                        disabled={product.stock === 0}
                        className="flex-1 rounded-lg border border-white/15 py-2 text-[10px] font-medium tracking-wider text-white/65 transition-all hover:border-white/30 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        {product.stock === 0 ? 'Unavailable' : 'View Product'}
                      </button>
                      <button
                        onClick={() => toggleWish(product.id)}
                        className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border transition-all ${
                          wished.includes(product.id)
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-white/15 text-white/28 hover:border-white/25 hover:text-white/55'
                        }`}
                      >
                        <svg className="h-3.5 w-3.5" fill={wished.includes(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                            d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/40 transition-all hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[12px] transition-all ${
                      p === currentPage
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-white/10 text-white/35 hover:border-white/20 hover:text-white/65'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/40 transition-all hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

 




 
      <div className="flex w-[300px] shrink-0 flex-col border-l border-white/[0.08] bg-[#0a0a0a]">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/5">
              <svg className="h-3.5 w-3.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
              </svg>
            </div>
            <span className="text-[12px] font-medium text-white/75">AI assistant</span>
          </div>
          <button className="flex h-6 w-6 items-center justify-center rounded text-white/22 transition-colors hover:text-white/55">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#222 #0a0a0a' }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end self-end' : 'items-start self-start'}`}
              style={{ animation: 'fadeUp 0.25s ease both' }}
            >
              <div className={`max-w-[88%] rounded-lg px-3 py-2 text-[12px] leading-relaxed ${
                msg.role === 'user'
                  ? 'border border-white/15 bg-white/10 text-white/85'
                  : 'border border-white/[0.07] bg-white/[0.04] text-white/65'
              }`}>
                {msg.text}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-white/20">{msg.time}</span>
                {msg.role === 'ai' && (
                  <div className="flex gap-1.5">
                    <button className="text-white/18 transition-colors hover:text-white/45">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M14 10h4.764a2 2 0 0 1 1.789 2.894l-3.5 7A2 2 0 0 1 15.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 0 0-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2.5" />
                      </svg>
                    </button>
                    <button className="text-white/18 transition-colors hover:text-white/45">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 14H5.236a2 2 0 0 1-1.789-2.894l3.5-7A2 2 0 0 1 8.736 3h4.018a2 2 0 0 1 .485.06L17 4m-7 10v2a2 2 0 0 0 2 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2.5" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-white/[0.08] p-3">
          <div className="flex flex-col gap-2.5 rounded-lg px-3 py-2.5 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.11)', background: 'rgba(255,255,255,0.03)' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter'}
              placeholder="Ask anything..."
              className="w-full bg-transparent text-[12px] text-white/75 outline-none placeholder:text-white/22"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button className="text-white/20 transition-colors hover:text-white/45">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                  </svg>
                </button>
                <button className="text-white/20 transition-colors hover:text-white/45">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M19 11a7 7 0 0 1-7 7m0 0a7 7 0 0 1-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 0 1-3-3V5a3 3 0 1 1 6 0v6a3 3 0 0 1-3 3z" />
                  </svg>
                </button>
                <button className="text-white/20 transition-colors hover:text-white/45">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M15.172 7l-6.586 6.586a2 2 0 1 0 2.828 2.828l6.414-6.586a4 4 0 0 0-5.656-5.656l-6.415 6.585a6 6 0 1 0 8.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes brandScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div></div>
  )
}

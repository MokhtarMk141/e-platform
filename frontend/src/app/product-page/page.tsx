'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import MegaMenu from '../mega-menu/megaMenu'

/*
  PRODUCT LISTING PAGE
  How category filtering works:
  1. MegaMenu links pass ?category=<slug>&categoryKey=<key> in the URL
  2. This page reads those params with useSearchParams()
  3. It matches the slug/key against fetched categories from GET /categories
  4. It passes the matched categoryId to useProducts() → GET /products?categoryId=<id>
*/

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  cpu: ['processor', 'cpu'],
  gpu: ['graphics', 'gpu', 'video card'],
  motherboard: ['motherboard', 'mobo'],
  ram: ['memory', 'ram', 'ddr'],
  storage: ['storage', 'ssd', 'hdd', 'nvme', 'hard drive'],
  psu: ['power supply', 'psu'],
  cooling: ['cooler', 'cooling', 'fan', 'aio'],
  case: ['case', 'tower', 'chassis'],
  monitor: ['monitor', 'display', 'screen'],
  keyboard: ['keyboard'],
  mouse: ['mouse', 'mice'],
  headset: ['headset', 'headphone', 'audio'],
}

function ProductsPageInner() {
  const searchParams = useSearchParams()
  const urlCategory = searchParams.get('category')
  const urlKey = searchParams.get('categoryKey')

  const { categories } = useCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<string>('all')

  // Match URL params to a backend category
  useEffect(() => {
    if (!categories || categories.length === 0) return

    if (!urlCategory && !urlKey) {
      setSelectedCategoryId(undefined)
      setActiveTab('all')
      return
    }

    // Try to match by keyword
    if (urlKey && CATEGORY_KEYWORDS[urlKey]) {
      const keywords = CATEGORY_KEYWORDS[urlKey]
      const matched = categories.find((cat: any) =>
        keywords.some(kw => cat.name.toLowerCase().includes(kw))
      )
      if (matched) {
        setSelectedCategoryId(matched.id)
        setActiveTab(matched.name)
        return
      }
    }

    // Try slug tokenization
    if (urlCategory) {
      const tokens = urlCategory.toLowerCase().replace(/-/g, ' ').split(' ')
      const matched = categories.find((cat: any) =>
        tokens.some((t: string) => cat.name.toLowerCase().includes(t))
      )
      if (matched) {
        setSelectedCategoryId(matched.id)
        setActiveTab(matched.name)
        return
      }
    }
  }, [categories, urlCategory, urlKey])

  const { products, loading, error } = useProducts(
    selectedCategoryId ? { categoryId: selectedCategoryId } : {}
  )

  const handleCategoryClick = (cat: any) => {
    if (cat === 'all') {
      setSelectedCategoryId(undefined)
      setActiveTab('all')
    } else {
      setSelectedCategoryId(cat.id)
      setActiveTab(cat.name)
    }
  }

  return (
    <div>
      <MegaMenu />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
        <h1>Products</h1>
        <p style={{ color: '#666', marginBottom: 20 }}>
          {urlCategory
            ? `Filtered by: ${urlCategory} (key: ${urlKey})`
            : 'Showing all products'
          }
        </p>

        {/* ── Category tabs ── */}
        <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleCategoryClick('all')}
            style={{
              padding: '6px 12px', border: '1px solid #ccc',
              background: activeTab === 'all' ? '#cc2200' : '#fff',
              color: activeTab === 'all' ? '#fff' : '#333',
              cursor: 'pointer', fontSize: 12,
            }}
          >
            All
          </button>
          {categories?.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              style={{
                padding: '6px 12px', border: '1px solid #ccc',
                background: activeTab === cat.name ? '#cc2200' : '#fff',
                color: activeTab === cat.name ? '#fff' : '#333',
                cursor: 'pointer', fontSize: 12,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Loading / Error ── */}
        {loading && <p>Loading products...</p>}
        {error && <div className="error">{error}</div>}

        {/* ── Product table ── */}
        {!loading && products && (
          <>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>
              {products.length} product(s) found
            </p>
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id}>
                    <td style={{ width: 60 }}>
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} style={{ width: 50, height: 50, objectFit: 'contain' }} />
                        : <span style={{ color: '#ccc' }}>—</span>
                      }
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      {product.description && (
                        <div style={{ fontSize: 12, color: '#888', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{product.sku}</td>
                    <td>{product.category?.name || '—'}</td>
                    <td>DTN {product.price?.toFixed(2)}</td>
                    <td style={{ color: product.stock === 0 ? 'red' : 'green' }}>
                      {product.stock === 0 ? 'Out of stock' : product.stock}
                    </td>
                    <td>
                      <Link href={`/product-page/${product.id}`}>View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<p style={{ padding: 40 }}>Loading...</p>}>
      <ProductsPageInner />
    </Suspense>
  )
}

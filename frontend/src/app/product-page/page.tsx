'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { Category } from '@/types/product.types'
import MegaMenu from '../mega-menu/megaMenu'

/*
  PRODUCT LISTING PAGE
  How it works:
  1. MegaMenu links go to /product-page?categoryKey=cpu
  2. This page reads ?categoryKey from the URL
  3. It finds the category whose name contains that key
  4. It fetches products for that category
*/

function ProductsPageInner() {
  // Step 1: Read the categoryKey from the URL (e.g. "cpu", "mouse", etc.)
  const searchParams = useSearchParams()
  const categoryKey = searchParams.get('categoryKey')

  // Step 2: Get all categories from the backend
  const { categories } = useCategories()

  // Step 3: Track which category is selected
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined) 
  //selectedCategoryId string → the ID of the category selected
  //setSelectedCategoryId → function to update selectedCategoryId 
  const [activeTab, setActiveTab] = useState('all')

  // Step 4: When categories load or URL changes, find the matching category
  useEffect(() => {
    if (!categories || categories.length === 0) return

    // No key in URL → show all products
    if (!categoryKey) {
      setSelectedCategoryId(undefined)
      setActiveTab('all')
      return
    }

    // Find the category whose name contains the key
    // Example: categoryKey = "cpu" → matches a category named "CPUs & Processors"
    const matched = categories.find(cat =>
      cat.name.toLowerCase().includes(categoryKey.toLowerCase())
    )

    if (matched) {
      setSelectedCategoryId(matched.id)
      setActiveTab(matched.name)
    }
  }, [categories, categoryKey])

  // Step 5: Fetch products (filtered by category if one is selected)
  const { products, loading, error } = useProducts(
    selectedCategoryId ? { categoryId: selectedCategoryId } : {}
  )

  // Step 6: Handle clicking a category tab
  function handleCategoryClick(cat: Category | 'all') {
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
          {categoryKey
            ? `Filtered by: ${categoryKey}`
            : 'Showing all products'
          }
        </p>

        {/* Category tabs */}
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
          {categories?.map((cat) => (
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

        {/* Loading / Error */}
        {loading && <p>Loading products...</p>}
        {error && <div className="error">{error}</div>}

        {/* Product table */}
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
                {products.map((product) => (
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

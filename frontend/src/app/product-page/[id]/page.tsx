'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ProductService } from '@/services/product.service'
import type { Product } from '@/types/product.types'
import MegaMenu from '../../mega-menu/megaMenu'

/*
  PRODUCT DETAIL PAGE
  - Reads product ID from URL params (dynamic route: /product-page/[id])
  - Calls GET /products/:id via ProductService.getById(id)
  - Displays all product fields returned by the backend
*/

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        ProductService.getById(id)
            .then((res: any) => {
                // The API returns { data: Product } or just the Product
                setProduct(res.data || res)
            })
            .catch((err: any) => {
                setError(err.message || 'Failed to load product')
            })
            .finally(() => setLoading(false))
    }, [id])

    return (
        <div>
            <MegaMenu />

            <main style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
                <div style={{ marginBottom: 20 }}>
                    <Link href="/product-page">← Back to Products</Link>
                </div>

                {loading && <p>Loading product...</p>}
                {error && <div className="error">{error}</div>}

                {product && (
                    <div>
                        <h1>{product.name}</h1>

                        {/* ── Image ── */}
                        {product.imageUrl && (
                            <div style={{ marginBottom: 20 }}>
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    style={{ maxWidth: 300, maxHeight: 300, objectFit: 'contain', border: '1px solid #eee' }}
                                />
                            </div>
                        )}

                        {/* ── Product Details Table ── */}
                        <table>
                            <tbody>
                                <tr><th>ID</th><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{product.id}</td></tr>
                                <tr><th>Name</th><td>{product.name}</td></tr>
                                <tr><th>SKU</th><td style={{ fontFamily: 'monospace' }}>{product.sku}</td></tr>
                                <tr><th>Category</th><td>{product.category?.name || 'N/A'}</td></tr>
                                <tr><th>Price</th><td><strong>DTN {product.price?.toFixed(2)}</strong></td></tr>
                                <tr>
                                    <th>Stock</th>
                                    <td style={{ color: product.stock === 0 ? 'red' : 'green' }}>
                                        {product.stock === 0 ? 'Out of stock' : `${product.stock} units`}
                                    </td>
                                </tr>
                                <tr><th>Description</th><td>{product.description || 'No description'}</td></tr>
                                <tr><th>Created</th><td>{new Date(product.createdAt).toLocaleDateString()}</td></tr>
                                <tr><th>Updated</th><td>{new Date(product.updatedAt).toLocaleDateString()}</td></tr>
                            </tbody>
                        </table>

                        {/* ── How this page works ── */}
                        <div style={{ marginTop: 30, padding: 15, background: '#f9f9f9', border: '1px solid #eee' }}>
                            <h3>How this page works</h3>
                            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
                                <li>URL: <code>/product-page/{id}</code> (Next.js dynamic route)</li>
                                <li><code>useParams()</code> extracts the <code>id</code> from the URL</li>
                                <li><code>ProductService.getById(id)</code> calls <code>GET /api/products/{id}</code></li>
                                <li>The API returns the full product object with category info</li>
                            </ul>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

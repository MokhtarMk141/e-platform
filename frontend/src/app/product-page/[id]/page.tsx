'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ProductService } from '@/services/product.service'
import { Product } from '@/types/product.types'
import MegaMenu from '../../mega-menu/megaMenu'

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
`

export default function ProductDetailPage() {
    const params = useParams()
    const id = params.id as string

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [wished, setWished] = useState(false)
    const [selectedImageZoom, setSelectedImageZoom] = useState(false)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await ProductService.getById(id)
                setProduct(res.data)
            } catch (err: any) {
                setError(err.message || 'Failed to load product')
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchProduct()
    }, [id])

    if (loading) {
        return (
            <div style={{
                fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)',
            }}>
                <style>{`
          ${FONTS}
          @keyframes spin { to { transform: rotate(360deg); } }
          * { box-sizing: border-box; }
        `}</style>
                <MegaMenu />
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    height: 'calc(100vh - 64px)', flexDirection: 'column', gap: 24,
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
                        LOADING PRODUCT...
                    </span>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div style={{
                fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)',
            }}>
                <style>{`${FONTS} * { box-sizing: border-box; }`}</style>
                <MegaMenu />
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    height: 'calc(100vh - 64px)', flexDirection: 'column', gap: 24,
                }}>
                    <div style={{ fontSize: 56, opacity: 0.1 }}>◈</div>
                    <p style={{
                        color: 'var(--text-muted)', fontSize: 16, fontWeight: 600,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                        {error || 'Product not found'}
                    </p>
                    <Link href="/product-page" style={{
                        color: 'var(--brand-red)', background: 'var(--background)',
                        border: '1.5px solid var(--brand-red)',
                        padding: '12px 28px', fontSize: 14, borderRadius: 12,
                        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800,
                        boxShadow: '0 4px 12px rgba(255,40,0,0.1)', textDecoration: 'none',
                    }}>
                        ← Back to Products
                    </Link>
                </div>
            </div>
        )
    }

    const inStock = product.stock > 0

    return (
        <div style={{
            fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
            background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)',
        }}>
            <style>{`
        ${FONTS}
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtlePulse {
          0%, 100% { transform: scale(1); opacity: 0.08; }
          50%       { transform: scale(1.05); opacity: 0.12; }
        }
        * { box-sizing: border-box; }
        ::selection { background: var(--brand-red); color: #fff; }

        .detail-img-wrap {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .detail-img-wrap:hover {
          transform: scale(1.03);
        }

        .add-btn {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,40,0,0.3) !important;
        }

        .spec-row {
          transition: background 0.15s;
        }
        .spec-row:hover {
          background: var(--surface-hover) !important;
        }

        .back-link {
          transition: all 0.2s;
        }
        .back-link:hover {
          color: var(--brand-red) !important;
          gap: 12px !important;
        }
      `}</style>

            <MegaMenu />

            {/* ── Breadcrumb ── */}
            <div style={{
                maxWidth: 1400, margin: '0 auto', padding: '24px 40px 0',
                animation: 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}>
                <Link href="/product-page" className="back-link" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    textDecoration: 'none', color: 'var(--text-muted)',
                    fontSize: 13, fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Products
                </Link>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
                    fontSize: 12, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                }}>
                    <Link href="/product-page" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Products</Link>
                    <span>›</span>
                    {product.category && (
                        <>
                            <Link
                                href={`/product-page?category=${encodeURIComponent(product.category.name.toLowerCase())}`}
                                style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
                            >
                                {product.category.name}
                            </Link>
                            <span>›</span>
                        </>
                    )}
                    <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{product.name}</span>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div style={{
                maxWidth: 1400, margin: '0 auto', padding: '40px',
                display: 'flex', gap: 60, alignItems: 'flex-start',
                animation: 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
            }}>

                {/* ── Left: Product Image ── */}
                <div style={{ flex: 1, minWidth: 0, position: 'sticky', top: 40 }}>
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 24,
                        overflow: 'hidden',
                        position: 'relative',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'zoom-in',
                    }}
                        onClick={() => setSelectedImageZoom(!selectedImageZoom)}
                    >
                        {/* Radial glow */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'radial-gradient(circle at 60% 40%, rgba(255,40,0,0.04) 0%, transparent 60%)',
                            animation: 'subtlePulse 4s ease-in-out infinite',
                            pointerEvents: 'none',
                        }} />

                        {product.imageUrl ? (
                            <div className="detail-img-wrap" style={{
                                width: '80%', height: '80%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    style={{
                                        maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                                        filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))',
                                        transform: selectedImageZoom ? 'scale(1.2)' : 'scale(1)',
                                        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{ fontSize: 80, opacity: 0.06, color: 'var(--foreground)' }}>◈</div>
                        )}

                        {/* Category badge */}
                        {product.category && (
                            <span style={{
                                position: 'absolute', top: 20, left: 20,
                                background: 'var(--background)', backdropFilter: 'blur(8px)',
                                color: 'var(--foreground)', fontSize: 11, fontWeight: 800,
                                letterSpacing: '0.02em', padding: '6px 14px', borderRadius: 30,
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                border: '1px solid var(--border)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}>
                                {product.category.name}
                            </span>
                        )}

                        {/* Stock badge */}
                        {!inStock && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span style={{
                                    fontSize: 14, fontWeight: 800, color: '#fff',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    background: 'rgba(0,0,0,0.6)',
                                    padding: '10px 28px', borderRadius: 40,
                                }}>
                                    Out of Stock
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Product Info ── */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* SKU */}
                    <div style={{
                        fontSize: 11, color: 'var(--text-dim)',
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12,
                    }}>
                        SKU: {product.sku}
                    </div>

                    {/* Name */}
                    <h1 style={{
                        margin: '0 0 20px', fontSize: 36, fontWeight: 900,
                        lineHeight: 1.15, letterSpacing: '-0.03em',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: 'var(--foreground)',
                    }}>
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div style={{
                        display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 28,
                    }}>
                        <span style={{
                            fontSize: 40, fontWeight: 900, color: 'var(--brand-red)',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            letterSpacing: '-0.04em',
                        }}>
                            ${product.price ? product.price.toFixed(2) : '0.00'}
                        </span>
                        {inStock && (
                            <span style={{
                                fontSize: 12, fontWeight: 700, color: '#22c55e',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                background: 'rgba(34,197,94,0.1)',
                                padding: '4px 12px', borderRadius: 20,
                                border: '1px solid rgba(34,197,94,0.2)',
                            }}>
                                ● In Stock ({product.stock} available)
                            </span>
                        )}
                        {!inStock && (
                            <span style={{
                                fontSize: 12, fontWeight: 700, color: 'var(--text-dim)',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                background: 'var(--surface)',
                                padding: '4px 12px', borderRadius: 20,
                                border: '1px solid var(--border)',
                            }}>
                                Out of Stock
                            </span>
                        )}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: 'var(--border)', marginBottom: 28 }} />

                    {/* Description */}
                    {product.description && (
                        <div style={{ marginBottom: 32 }}>
                            <h3 style={{
                                margin: '0 0 12px', fontSize: 13, fontWeight: 800,
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                color: 'var(--text-dim)',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}>
                                Description
                            </h3>
                            <p style={{
                                margin: 0, fontSize: 15, color: 'var(--text-muted)',
                                lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
                            }}>
                                {product.description}
                            </p>
                        </div>
                    )}

                    {/* Product Details Table */}
                    <div style={{ marginBottom: 32 }}>
                        <h3 style={{
                            margin: '0 0 16px', fontSize: 13, fontWeight: 800,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'var(--text-dim)',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                            Product Details
                        </h3>
                        <div style={{
                            border: '1px solid var(--border)',
                            borderRadius: 16, overflow: 'hidden',
                        }}>
                            {[
                                { label: 'Product Name', value: product.name },
                                { label: 'SKU', value: product.sku },
                                { label: 'Category', value: product.category?.name ?? '—' },
                                { label: 'Price', value: `$${product.price?.toFixed(2) ?? '0.00'}` },
                                { label: 'Stock', value: inStock ? `${product.stock} units` : 'Out of Stock' },
                                { label: 'Added', value: new Date(product.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                                { label: 'Last Updated', value: new Date(product.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                            ].map((row, i) => (
                                <div
                                    key={row.label}
                                    className="spec-row"
                                    style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '14px 20px',
                                        background: i % 2 === 0 ? 'var(--surface)' : 'var(--background)',
                                        borderBottom: i < 6 ? '1px solid var(--border)' : 'none',
                                    }}
                                >
                                    <span style={{
                                        fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    }}>
                                        {row.label}
                                    </span>
                                    <span style={{
                                        fontSize: 13, fontWeight: 600, color: 'var(--foreground)',
                                        fontFamily: "'DM Sans', sans-serif",
                                        textAlign: 'right',
                                    }}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: 'var(--border)', marginBottom: 28 }} />

                    {/* Quantity + Actions */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        marginBottom: 20,
                    }}>
                        {/* Quantity selector */}
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            border: '1px solid var(--border-strong)',
                            borderRadius: 12, overflow: 'hidden',
                            background: 'var(--background)',
                        }}>
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={!inStock}
                                style={{
                                    width: 44, height: 48, border: 'none',
                                    background: 'var(--surface)',
                                    color: 'var(--foreground)', fontSize: 18, fontWeight: 700,
                                    cursor: inStock ? 'pointer' : 'not-allowed',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    borderRight: '1px solid var(--border)',
                                    transition: 'background 0.15s',
                                }}
                            >
                                −
                            </button>
                            <span style={{
                                width: 56, textAlign: 'center', fontSize: 15, fontWeight: 800,
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                color: 'var(--foreground)',
                            }}>
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                disabled={!inStock}
                                style={{
                                    width: 44, height: 48, border: 'none',
                                    background: 'var(--surface)',
                                    color: 'var(--foreground)', fontSize: 18, fontWeight: 700,
                                    cursor: inStock ? 'pointer' : 'not-allowed',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    borderLeft: '1px solid var(--border)',
                                    transition: 'background 0.15s',
                                }}
                            >
                                +
                            </button>
                        </div>

                        {/* Add to Cart */}
                        <button
                            disabled={!inStock}
                            className="add-btn"
                            style={{
                                flex: 1, height: 48,
                                background: inStock ? 'var(--brand-red)' : 'var(--surface)',
                                color: inStock ? '#fff' : 'var(--text-dim)',
                                border: inStock ? 'none' : '1px solid var(--border)',
                                borderRadius: 12,
                                fontSize: 15, fontWeight: 800,
                                cursor: inStock ? 'pointer' : 'not-allowed',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                letterSpacing: '-0.01em',
                                boxShadow: inStock ? '0 4px 16px rgba(255,40,0,0.2)' : 'none',
                            }}
                        >
                            {inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>

                        {/* Wishlist */}
                        <button
                            onClick={() => setWished(!wished)}
                            style={{
                                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                                border: `1.5px solid ${wished ? 'var(--brand-red)' : 'var(--border-strong)'}`,
                                background: wished ? 'var(--brand-red)' : 'var(--background)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: wished ? '0 4px 12px rgba(255,40,0,0.2)' : '0 4px 12px rgba(0,0,0,0.04)',
                            }}
                        >
                            <svg width="20" height="20" fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : 'var(--foreground)'} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                    d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                            </svg>
                        </button>
                    </div>

                    {/* Trust badges */}
                    <div style={{
                        display: 'flex', gap: 24, marginTop: 28, padding: '20px 0',
                        borderTop: '1px solid var(--border)',
                    }}>
                        {[
                            { icon: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h4l2 4v5h-6m0-9H14M17 21a2 2 0 100-4 2 2 0 000 4zm-9 0a2 2 0 100-4 2 2 0 000 4z', label: 'Free Shipping' },
                            { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Secure Payment' },
                            { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: '30-Day Returns' },
                        ].map(b => (
                            <div key={b.label} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <path d={b.icon} />
                                </svg>
                                <span style={{
                                    fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}>
                                    {b.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Footer Decor ── */}
            <div style={{
                height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--surface)', borderTop: '1px solid var(--border)',
            }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-red)', opacity: 0.3 }} />
            </div>
        </div>
    )
}

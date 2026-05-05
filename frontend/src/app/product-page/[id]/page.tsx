'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ProductService } from '@/services/product.service'
import { ReviewService } from '@/services/review.service'
import { Product, Review, RatingStats } from '@/types/product.types'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { getProductDiscountLabel, getProductFinalPrice, productHasDiscount } from '@/lib/product-pricing'
import MegaMenu from '../../mega-menu/megaMenu'
//hello worlddddd
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
`

export default function ProductDetailPage() {
    const params = useParams()
    const id = params.id as string
    const { user, isAuthenticated } = useAuth()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [wished, setWished] = useState(false)
    const [selectedImageZoom, setSelectedImageZoom] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const { addItem } = useCart()

    // Review state
    const [reviews, setReviews] = useState<Review[]>([])
    const [ratingStats, setRatingStats] = useState<RatingStats | null>(null)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState('')
    const [hoverRating, setHoverRating] = useState(0)
    const [reviewLoading, setReviewLoading] = useState(false)
    const [reviewError, setReviewError] = useState<string | null>(null)
    const [editingReview, setEditingReview] = useState<Review | null>(null)

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await ProductService.getById(id)
                setProduct(res.data)
            } catch (err: unknown) {
                const message = err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string'
                    ? (err as { message: string }).message
                    : 'Failed to load product'
                setError(message)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchProduct()
    }, [id])

    // Fetch reviews
    const fetchReviews = async () => {
        try {
            const res = await ReviewService.getProductReviews(id)
            setReviews(res.data.reviews)
            setRatingStats(res.data.stats)
        } catch {
            // silently fail - reviews are supplementary
        }
    }

    useEffect(() => {
        if (id) fetchReviews()
    }, [id])

    const handleSubmitReview = async () => {
        if (!reviewComment.trim()) return
        setReviewLoading(true)
        setReviewError(null)
        try {
            if (editingReview) {
                await ReviewService.updateReview(editingReview.id, {
                    rating: reviewRating,
                    comment: reviewComment,
                })
                setEditingReview(null)
            } else {
                await ReviewService.createReview(id, {
                    rating: reviewRating,
                    comment: reviewComment,
                })
            }
            setReviewComment('')
            setReviewRating(5)
            fetchReviews()
        } catch (err: any) {
            setReviewError(err?.message || err?.error || 'Failed to submit review')
        } finally {
            setReviewLoading(false)
        }
    }

    const handleDeleteReview = async (reviewId: string) => {
        try {
            await ReviewService.deleteReview(reviewId)
            fetchReviews()
        } catch {
            // silently fail
        }
    }

    const startEditReview = (review: Review) => {
        setEditingReview(review)
        setReviewRating(review.rating)
        setReviewComment(review.comment)
    }

    const cancelEdit = () => {
        setEditingReview(null)
        setReviewRating(5)
        setReviewComment('')
        setReviewError(null)
    }

    // Check if current user already has a review
    const userReview = reviews.find(r => r.userId === user?.id)

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
    const finalPrice = getProductFinalPrice(product)
    const hasDiscount = productHasDiscount(product)
    const discountLabel = getProductDiscountLabel(product, '$')

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

        .review-star {
          cursor: pointer;
          transition: transform 0.15s ease, color 0.15s ease;
        }
        .review-star:hover {
          transform: scale(1.2);
        }

        .rating-bar-fill {
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .review-card {
          transition: all 0.2s ease;
        }
        .review-card:hover {
          border-color: var(--border-strong) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .review-submit-btn {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .review-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,40,0,0.3) !important;
        }

        .review-action-btn {
          transition: all 0.15s;
        }
        .review-action-btn:hover {
          background: var(--surface-hover) !important;
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {hasDiscount && (
                                <span style={{
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: 'var(--text-dim)',
                                    textDecoration: 'line-through',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}>
                                    ${product.price ? product.price.toFixed(2) : '0.00'}
                                </span>
                            )}
                            <span style={{
                                fontSize: 40, fontWeight: 900, color: 'var(--brand-red)',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                letterSpacing: '-0.04em',
                            }}>
                                ${finalPrice.toFixed(2)}
                            </span>
                        </div>
                        {hasDiscount && discountLabel && (
                            <span style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: 'var(--brand-red)',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                background: 'rgba(255,40,0,0.08)',
                                padding: '4px 10px',
                                borderRadius: 999,
                                border: '1px solid rgba(255,40,0,0.14)',
                            }}>
                                {discountLabel}
                            </span>
                        )}
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

                    {/* About Product Card */}
                    <div style={{
                        background: 'var(--surface)',
                        borderRadius: 16,
                        padding: '28px',
                        marginBottom: 32,
                        border: '1px solid var(--border)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 4, height: 16, background: 'var(--brand-red)', borderRadius: 4 }} />
                            <h3 style={{
                                margin: 0, fontSize: 15, fontWeight: 800,
                                letterSpacing: '0.02em', textTransform: 'uppercase',
                                color: 'var(--foreground)',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}>
                                About this Product
                            </h3>
                        </div>
                        
                        {product.description ? (
                            <p style={{
                                margin: '0 0 24px', fontSize: 15, color: 'var(--text-muted)',
                                lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
                            }}>
                                {product.description}
                            </p>
                        ) : (
                            <p style={{
                                margin: '0 0 24px', fontSize: 15, color: 'var(--text-dim)', 
                                fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif",
                            }}>
                                No description provided.
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {product.category && (
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '8px 16px', background: 'var(--background)',
                                    borderRadius: 12, border: '1px solid var(--border)',
                                }}>
                                    <span style={{ 
                                        fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', 
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    }}>
                                        Category
                                    </span>
                                    <span style={{ 
                                        fontSize: 13, fontWeight: 700, color: 'var(--foreground)',
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}>
                                        {product.category.name}
                                    </span>
                                </div>
                            )}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '8px 16px', background: 'var(--background)',
                                borderRadius: 12, border: '1px solid var(--border)',
                            }}>
                                <span style={{ 
                                    fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', 
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}>
                                    Condition
                                </span>
                                <span style={{ 
                                    fontSize: 13, fontWeight: 700, color: 'var(--foreground)',
                                    fontFamily: "'DM Sans', sans-serif",
                                }}>
                                    Brand New
                                </span>
                            </div>
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
                            onClick={() => {
                                if (!inStock) return
                                addItem(product.id, quantity, {
                                    productId: product.id,
                                    name: product.name,
                                    price: finalPrice,
                                    originalPrice: product.price,
                                    discountPercentage: product.discountPercentage,
                                    discountAmount: product.discountAmount,
                                    discountLabel: product.discountLabel,
                                    hasDiscount,
                                    activePromotion: product.activePromotion,
                                    imageUrl: product.imageUrl ?? null,
                                    sku: product.sku,
                                })
                            }}
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

            {/* ── Reviews & Ratings Section ── */}
            <div style={{
                maxWidth: 1400, margin: '0 auto', padding: '0 40px 60px',
                animation: 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
            }}>
                <div style={{ height: 1, background: 'var(--border)', marginBottom: 48 }} />

                <h2 style={{
                    margin: '0 0 36px', fontSize: 28, fontWeight: 900,
                    letterSpacing: '-0.03em',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: 'var(--foreground)',
                }}>
                    Customer Reviews
                </h2>

                <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* ── Left: Rating Summary (Google Maps style) ── */}
                    <div style={{ flex: '0 0 300px', minWidth: 260 }}>
                        <div style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 20,
                            padding: '32px',
                        }}>
                            {/* Big average rating */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                <span style={{
                                    fontSize: 52, fontWeight: 900, color: 'var(--foreground)',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    letterSpacing: '-0.04em', lineHeight: 1,
                                }}>
                                    {ratingStats ? ratingStats.averageRating.toFixed(1) : '0.0'}
                                </span>
                                <div>
                                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <svg key={star} width="18" height="18" viewBox="0 0 24 24"
                                                fill={(ratingStats?.averageRating ?? 0) >= star ? 'var(--brand-red)' : (ratingStats?.averageRating ?? 0) >= star - 0.5 ? 'var(--brand-red)' : 'none'}
                                                stroke="var(--brand-red)" strokeWidth="2">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span style={{
                                        fontSize: 13, color: 'var(--text-muted)',
                                        fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                                    }}>
                                        {ratingStats?.totalReviews ?? 0} review{(ratingStats?.totalReviews ?? 0) !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Rating distribution bars */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = ratingStats?.distribution[star] ?? 0
                                    const total = ratingStats?.totalReviews ?? 0
                                    const pct = total > 0 ? (count / total) * 100 : 0
                                    return (
                                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{
                                                fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                width: 28, textAlign: 'right', flexShrink: 0,
                                            }}>
                                                {star}★
                                            </span>
                                            <div style={{
                                                flex: 1, height: 10, borderRadius: 6,
                                                background: 'var(--border)',
                                                overflow: 'hidden',
                                            }}>
                                                <div className="rating-bar-fill" style={{
                                                    width: `${pct}%`, height: '100%',
                                                    borderRadius: 6,
                                                    background: star >= 4 ? 'var(--brand-red)' : star === 3 ? '#f59e0b' : '#ef4444',
                                                }} />
                                            </div>
                                            <span style={{
                                                fontSize: 12, fontWeight: 600, color: 'var(--text-dim)',
                                                fontFamily: "'DM Sans', sans-serif",
                                                width: 28, flexShrink: 0,
                                            }}>
                                                {count}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Review Form + List ── */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Review Form */}
                        {isAuthenticated && !userReview && !editingReview && (
                            <div style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 20,
                                padding: '28px',
                                marginBottom: 32,
                            }}>
                                <h3 style={{
                                    margin: '0 0 16px', fontSize: 15, fontWeight: 800,
                                    letterSpacing: '-0.01em',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    color: 'var(--foreground)',
                                }}>
                                    Write a Review
                                </h3>

                                {/* Interactive Stars */}
                                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <svg key={star} className="review-star" width="28" height="28" viewBox="0 0 24 24"
                                            fill={(hoverRating || reviewRating) >= star ? '#ffb800' : 'none'}
                                            stroke={(hoverRating || reviewRating) >= star ? '#ffb800' : 'var(--text-dim)'}
                                            strokeWidth="2"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setReviewRating(star)}
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                    <span style={{
                                        fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
                                        fontFamily: "'DM Sans', sans-serif",
                                        alignSelf: 'center', marginLeft: 8,
                                    }}>
                                        {hoverRating || reviewRating} / 5
                                    </span>
                                </div>

                                <textarea
                                    value={reviewComment}
                                    onChange={e => setReviewComment(e.target.value)}
                                    placeholder="Share your experience with this product..."
                                    rows={4}
                                    style={{
                                        width: '100%', padding: '14px 18px',
                                        borderRadius: 14, border: '1px solid var(--border)',
                                        background: 'var(--background)', color: 'var(--foreground)',
                                        fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                                        resize: 'vertical', outline: 'none',
                                        transition: 'border-color 0.2s',
                                        lineHeight: 1.6,
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--brand-red)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />

                                {reviewError && (
                                    <p style={{
                                        margin: '10px 0 0', fontSize: 13, color: '#ef4444',
                                        fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                                    }}>
                                        {reviewError}
                                    </p>
                                )}

                                <button
                                    className="review-submit-btn"
                                    disabled={reviewLoading || !reviewComment.trim()}
                                    onClick={handleSubmitReview}
                                    style={{
                                        marginTop: 14, padding: '12px 32px',
                                        borderRadius: 12, border: 'none',
                                        background: reviewComment.trim() ? 'var(--brand-red)' : 'var(--surface)',
                                        color: reviewComment.trim() ? '#fff' : 'var(--text-dim)',
                                        fontSize: 14, fontWeight: 800,
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        cursor: reviewComment.trim() ? 'pointer' : 'not-allowed',
                                        boxShadow: reviewComment.trim() ? '0 4px 16px rgba(255,40,0,0.2)' : 'none',
                                    }}
                                >
                                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        )}

                        {/* Edit Review Form */}
                        {editingReview && (
                            <div style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--brand-red)',
                                borderRadius: 20,
                                padding: '28px',
                                marginBottom: 32,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h3 style={{
                                        margin: 0, fontSize: 15, fontWeight: 800,
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        color: 'var(--foreground)',
                                    }}>
                                        Edit Your Review
                                    </h3>
                                    <button onClick={cancelEdit} style={{
                                        background: 'none', border: 'none', color: 'var(--text-muted)',
                                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    }}>
                                        Cancel
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <svg key={star} className="review-star" width="28" height="28" viewBox="0 0 24 24"
                                            fill={(hoverRating || reviewRating) >= star ? '#ffb800' : 'none'}
                                            stroke={(hoverRating || reviewRating) >= star ? '#ffb800' : 'var(--text-dim)'}
                                            strokeWidth="2"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setReviewRating(star)}
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>

                                <textarea
                                    value={reviewComment}
                                    onChange={e => setReviewComment(e.target.value)}
                                    rows={4}
                                    style={{
                                        width: '100%', padding: '14px 18px',
                                        borderRadius: 14, border: '1px solid var(--border)',
                                        background: 'var(--background)', color: 'var(--foreground)',
                                        fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                                        resize: 'vertical', outline: 'none',
                                        lineHeight: 1.6,
                                    }}
                                />

                                {reviewError && (
                                    <p style={{ margin: '10px 0 0', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
                                        {reviewError}
                                    </p>
                                )}

                                <button
                                    className="review-submit-btn"
                                    disabled={reviewLoading || !reviewComment.trim()}
                                    onClick={handleSubmitReview}
                                    style={{
                                        marginTop: 14, padding: '12px 32px',
                                        borderRadius: 12, border: 'none',
                                        background: 'var(--brand-red)', color: '#fff',
                                        fontSize: 14, fontWeight: 800,
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 16px rgba(255,40,0,0.2)',
                                    }}
                                >
                                    {reviewLoading ? 'Updating...' : 'Update Review'}
                                </button>
                            </div>
                        )}

                        {!isAuthenticated && (
                            <div style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 16,
                                padding: '20px 24px',
                                marginBottom: 32,
                                display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z" />
                                </svg>
                                <span style={{
                                    fontSize: 13, color: 'var(--text-muted)',
                                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                                }}>
                                    <Link href="/login" style={{ color: 'var(--brand-red)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link> to leave a review
                                </span>
                            </div>
                        )}

                        {/* Reviews List */}
                        {reviews.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {reviews.map(review => (
                                    <div key={review.id} className="review-card" style={{
                                        background: 'var(--background)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 16,
                                        padding: '24px',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                    {/* User avatar */}
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, var(--brand-red), #ff5500)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#fff', fontSize: 14, fontWeight: 800,
                                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                    }}>
                                                        {review.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span style={{
                                                            fontSize: 14, fontWeight: 700,
                                                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                            color: 'var(--foreground)',
                                                        }}>
                                                            {review.user.name}
                                                        </span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                                            <div style={{ display: 'flex', gap: 2 }}>
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <svg key={star} width="13" height="13" viewBox="0 0 24 24"
                                                                        fill={review.rating >= star ? '#ffb800' : 'none'}
                                                                        stroke={review.rating >= star ? '#ffb800' : 'var(--text-dim)'}
                                                                        strokeWidth="2">
                                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                                    </svg>
                                                                ))}
                                                            </div>
                                                            <span style={{
                                                                fontSize: 11, color: 'var(--text-dim)',
                                                                fontFamily: "'DM Sans', sans-serif",
                                                            }}>
                                                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Edit/Delete for own reviews */}
                                            {user?.id === review.userId && !editingReview && (
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button className="review-action-btn" onClick={() => startEditReview(review)} style={{
                                                        background: 'var(--surface)', border: '1px solid var(--border)',
                                                        borderRadius: 8, padding: '6px 12px',
                                                        fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
                                                        cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                    }}>
                                                        Edit
                                                    </button>
                                                    <button className="review-action-btn" onClick={() => handleDeleteReview(review.id)} style={{
                                                        background: 'var(--surface)', border: '1px solid var(--border)',
                                                        borderRadius: 8, padding: '6px 12px',
                                                        fontSize: 12, fontWeight: 700, color: '#ef4444',
                                                        cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                    }}>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <p style={{
                                            margin: 0, fontSize: 14, color: 'var(--text-muted)',
                                            lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
                                        }}>
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center', padding: '48px 20px',
                                color: 'var(--text-dim)',
                            }}>
                                <div style={{ fontSize: 40, opacity: 0.15, marginBottom: 12 }}>★</div>
                                <p style={{
                                    margin: 0, fontSize: 14, fontWeight: 600,
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}>
                                    No reviews yet. Be the first to share your experience!
                                </p>
                            </div>
                        )}
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

'use client';

import React, { useEffect, useState } from 'react';
import Drawer from './Drawer';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
    const { cart, isOpen, setOpen, loading, fetchCart, removeItem, updateQuantity } = useCart();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);

    useEffect(() => {
        if (isOpen && isAuthenticated && !cart && !loading) {
            fetchCart();
        }
    }, [cart, fetchCart, isAuthenticated, isOpen, loading]);

    return (
        <>
        <Drawer isOpen={isOpen} onClose={() => setOpen(false)} title="Shopping Bag">
            {loading && !cart ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <div style={{
                        width: 32, height: 32,
                        border: '2px solid var(--border)', borderTop: '2px solid var(--brand-red)',
                        borderRadius: '50%', animation: 'spin 1s linear infinite',
                    }} />
                </div>
            ) : !cart || cart.items.length === 0 ? (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', height: '100%', gap: 20, textAlign: 'center'
                }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', background: 'var(--surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, opacity: 0.5
                    }}>
                        🛒
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 8px', fontWeight: 700 }}>Your bag is empty</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Start adding some premium hardware to your setup.</p>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        style={{
                            padding: '12px 24px', background: 'var(--foreground)', color: 'var(--background)',
                            border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13
                        }}
                    >
                        Keep Shopping
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {cart.items.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex', gap: 16, padding: '16px', borderRadius: 16,
                                    background: 'var(--surface)', border: '1px solid var(--border)'
                                }}
                            >
                                <div style={{
                                    width: 80, height: 80, background: '#fff', borderRadius: 12,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8,
                                    border: '1px solid var(--border)'
                                }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ fontSize: 24, opacity: 0.1 }}>◈</span>
                                    )}
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.name}</h4>
                                        <button
                                            disabled={loading}
                                            onClick={() => removeItem(item.id)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: loading ? 'not-allowed' : 'pointer', padding: 4 }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>{item.sku}</p>

                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            background: 'var(--background)', padding: '4px 8px',
                                            borderRadius: 8, border: '1px solid var(--border)'
                                        }}>
                                            <button
                                                disabled={loading}
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                style={{ background: 'none', border: 'none', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--foreground)' }}
                                            >
                                                -
                                            </button>
                                            <span style={{ fontSize: 13, fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                                            <button
                                                disabled={loading}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                style={{ background: 'none', border: 'none', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--foreground)' }}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--brand-red)' }}>
                                            DTN {(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        paddingTop: 24, borderTop: '1px solid var(--border)',
                        display: 'flex', flexDirection: 'column', gap: 16
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>Subtotal ({cart.totalItems} items)</span>
                            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>DTN {cart.totalAmount.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={() => {
                                if (!isAuthenticated) {
                                    setShowAuthPrompt(true);
                                    return;
                                }
                                alert('Checkout page is not connected yet.');
                            }}
                            style={{
                                width: '100%', padding: '16px', background: 'var(--brand-red)', color: '#fff',
                                border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800,
                                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                                boxShadow: '0 8px 24px rgba(255,40,0,0.25)', transition: 'all 0.2s'
                            }}
                        >
                            Checkout Now
                        </button>
                        <p style={{ textAlign: 'center', margin: 0, fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>
                            {!isAuthenticated
                                ? 'Login is only required when you are ready to checkout.'
                                : 'Free shipping on all premium hardware assemblies.'}
                        </p>
                    </div>
                </div>
            )}
            <style jsx>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </Drawer>
        {showAuthPrompt && (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    background: 'rgba(10,10,14,0.35)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                }}
                onClick={() => setShowAuthPrompt(false)}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: 460,
                        borderRadius: 24,
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.24)',
                        padding: 28,
                        textAlign: 'center',
                    }}
                >
                    <div style={{
                        width: 72,
                        height: 72,
                        margin: '0 auto 18px',
                        borderRadius: 20,
                        background: 'linear-gradient(135deg, rgba(255,40,0,0.14) 0%, rgba(255,122,0,0.08) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--brand-red)',
                    }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 7V6a4 4 0 018 0v1" />
                            <path d="M6 7h12l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 7Z" />
                            <path d="M10 11a2 2 0 004 0" />
                        </svg>
                    </div>
                    <h3 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>
                        Continue to checkout
                    </h3>
                    <p style={{ margin: '0 0 22px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)' }}>
                        Your items are saved in the bag. To continue with checkout, choose whether you want to log in or create a new account.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => {
                                setShowAuthPrompt(false);
                                setOpen(false);
                                router.push('/login');
                            }}
                            style={{
                                minWidth: 150,
                                padding: '13px 18px',
                                borderRadius: 14,
                                border: 'none',
                                background: 'var(--foreground)',
                                color: 'var(--background)',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => {
                                setShowAuthPrompt(false);
                                setOpen(false);
                                router.push('/register');
                            }}
                            style={{
                                minWidth: 150,
                                padding: '13px 18px',
                                borderRadius: 14,
                                border: '1px solid var(--border-strong)',
                                background: 'var(--surface-hover)',
                                color: 'var(--foreground)',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                        >
                            Register
                        </button>
                    </div>
                    <button
                        onClick={() => setShowAuthPrompt(false)}
                        style={{
                            marginTop: 14,
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        )}
        </>
    );
}

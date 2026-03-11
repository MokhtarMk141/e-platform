'use client';

import React, { useEffect } from 'react';
import Drawer from './Drawer';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';

export default function CartDrawer() {
    const { cart, isOpen, setOpen, loading, fetchCart, removeItem, updateQuantity } = useCart();

    useEffect(() => {
        if (isOpen) {
            fetchCart();
        }
    }, [isOpen, fetchCart]);

    return (
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
                                            onClick={() => removeItem(item.id)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}
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
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                style={{ background: 'none', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', color: 'var(--foreground)' }}
                                            >
                                                -
                                            </button>
                                            <span style={{ fontSize: 13, fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                style={{ background: 'none', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', color: 'var(--foreground)' }}
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
                            Free shipping on all premium hardware assemblies.
                        </p>
                    </div>
                </div>
            )}
            <style jsx>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </Drawer>
    );
}

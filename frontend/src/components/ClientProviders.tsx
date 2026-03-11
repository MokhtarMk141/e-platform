'use client';

import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import CartDrawer from '@/components/CartDrawer';

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    const { fetchCart } = useCart();

    useEffect(() => {
        // Initial fetch for the cart
        fetchCart();

        // Theme initialization (can be done here or in RootLayout as a script)
        try {
            if (typeof window !== 'undefined') {
                const savedTheme = localStorage.getItem('theme');
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const theme = savedTheme || systemTheme;
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        } catch (e) { }
    }, [fetchCart]);

    return (
        <>
            {children}
            <CartDrawer />
        </>
    );
}

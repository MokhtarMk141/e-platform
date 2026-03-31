'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/hooks/useAuth';
import CartDrawer from '@/components/CartDrawer';

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    const { fetchCart, resetCart } = useCart();
    const { syncAuth, isAuthenticated } = useAuthStore();
    const pathname = usePathname();

    useEffect(() => {
        syncAuth();
    }, [syncAuth]);

    useEffect(() => {
        const isAuthPage = pathname?.startsWith('/login') || 
                          pathname?.startsWith('/register') || 
                          pathname?.startsWith('/forgot-password') || 
                          pathname?.startsWith('/reset-password');

        if (isAuthPage) {
            resetCart();
            return;
        }

        if (isAuthenticated) {
            fetchCart();
            return;
        }

        resetCart();
    }, [fetchCart, isAuthenticated, pathname, resetCart]);

    useEffect(() => {
        // Theme initialization
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
    }, []);

    return (
        <>
            {children}
            <CartDrawer />
        </>
    );
}

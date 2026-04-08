'use client'

import { useState, useEffect } from 'react'
import { HomepageConfigService, HomepageConfig } from '@/services/homepage-config.service'

const DEFAULT_CONFIG: HomepageConfig = {
  id: '',
  heroSlides: [
    {
      badge: '🔥 Seasonal Deals',
      title: 'Upgrade Your\nGaming Setup',
      sub: 'Discover the latest GPUs, processors & accessories at unbeatable prices.',
      cta: 'Shop Now',
      link: '/product-page',
      img: 'https://dlcdnwebimgs.asus.com/gain/9AC8BE01-2A3C-4E58-93E3-FD06B6B51FDF/w717/h525/q87/fwebp',
    },
    {
      badge: '⚡ New Arrivals',
      title: 'Next-Gen\nComponents',
      sub: 'Be the first to get the latest CPUs, SSDs, and DDR5 memory kits.',
      cta: 'Explore',
      link: '/product-page',
      img: 'https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2505603-ryzen-9-702702-702703.jpg',
    },
    {
      badge: '🤖 AI Builder',
      title: 'Build Your\nDream PC',
      sub: 'Let our AI configure the perfect build. Just describe what you need.',
      cta: 'Build with AI',
      link: '/build-with-ai',
      img: 'https://cdn.deepcool.com/public/Global-images/products/Cases/2025/05/CH690_DIGITAL_1.jpg?fm=webp&q=60',
    },
  ],
  features: [
    { icon: 'M5 12h14M12 5l7 7', title: 'Free Shipping', desc: 'On orders over 500 DTN' },
    { icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1-14v4l3 3', title: '24/7 Support', desc: 'Always here to help' },
    { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
    { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'Easy Returns', desc: '30-day return policy' },
  ],
  flashTitle: '⚡ Flash Sale',
  sections: {
    flash: { title: '⚡ Flash Sale' },
    newest: { badge: 'New Arrivals', title: 'Just Dropped' },
    popular: { badge: 'Most Popular', title: 'Trending Now' },
    categories: { badge: 'Shop by Category', title: 'Browse Categories' },
  },
  aiCta: {
    badge: 'AI-Powered',
    title: 'Not sure what to pick?',
    sub: "Let our AI assistant build the perfect PC for you. Just describe your needs — gaming, streaming, design — and we'll handle the rest.",
    cta: 'Build with AI',
  },
  updatedAt: '',
}

export function useHomepageConfig() {
  const [config, setConfig] = useState<HomepageConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    HomepageConfigService.get()
      .then((data) => {
        // Merge with defaults to guard against missing keys from older DB rows
        setConfig({
          ...DEFAULT_CONFIG,
          ...data,
          sections: { ...DEFAULT_CONFIG.sections, ...(data.sections as any) },
          aiCta: { ...DEFAULT_CONFIG.aiCta, ...(data.aiCta as any) },
          heroSlides: Array.isArray(data.heroSlides) && data.heroSlides.length > 0
            ? data.heroSlides
            : DEFAULT_CONFIG.heroSlides,
          features: Array.isArray(data.features) && data.features.length > 0
            ? data.features
            : DEFAULT_CONFIG.features,
        })
      })
      .catch(() => {
        // Silently fall back to defaults if API is unreachable
        setConfig(DEFAULT_CONFIG)
      })
      .finally(() => setLoading(false))
  }, [])

  return { config, loading }
}

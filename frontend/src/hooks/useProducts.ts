'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProductService } from '@/services/product.service'
import { Product, ProductFilters } from '@/types/product.types'

interface UseProductsReturn {
  products: Product[]
  total: number
  page: number
  limit: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProducts(filters: ProductFilters = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [limit, setLimit]       = useState(20)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const filtersKey = JSON.stringify(filters)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await ProductService.getAll(filters)

      setProducts(res.data)
      setTotal(res.total)
      setPage(res.page)
      setLimit(res.limit)
    } catch (err: any) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [filtersKey])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, total, page, limit, loading, error, refetch: fetchProducts }
}
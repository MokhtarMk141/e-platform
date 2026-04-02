'use client'

import { useCallback, useEffect, useState } from 'react'
import { BrandService } from '@/services/brand.service'
import { Brand } from '@/types/product.types'

interface UseBrandsReturn {
  brands: Brand[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useBrands(): UseBrandsReturn {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBrands = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await BrandService.getAll()
      setBrands(res.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load brands')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  return { brands, loading, error, refetch: fetchBrands }
}

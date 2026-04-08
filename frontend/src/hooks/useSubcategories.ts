'use client'

import { useState, useEffect, useCallback } from 'react'
import { Subcategory } from '@/types/product.types'
import { SubcategoryService } from '@/services/subcategory.service'

interface UseSubcategoriesReturn {
  subcategories: Subcategory[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useSubcategories(): UseSubcategoriesReturn {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubcategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await SubcategoryService.getAll()
      setSubcategories(res.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load subcategories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubcategories()
  }, [fetchSubcategories])

  return { subcategories, loading, error, refetch: fetchSubcategories }
}

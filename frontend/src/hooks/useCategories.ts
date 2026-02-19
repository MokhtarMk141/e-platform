
'use client'

import { useState, useEffect } from 'react'
import { CategoryService } from '@/services/category.service'
import { Category } from '@/types/product.types'

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await CategoryService.getAll()
        setCategories(res.data)
      } catch (err: any) {
        setError(err.message || 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { categories, loading, error }
}
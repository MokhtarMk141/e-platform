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
//get the data form data base and manager their state
export function useProducts(filters: ProductFilters = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal]       = useState(0) //Stores the total number of products in the database.
  const [page, setPage]         = useState(1) //Stores the current page number.
  const [limit, setLimit]       = useState(20) //Stores how many products appear per page. 
  const [loading, setLoading]   = useState(true) // indicates if products are sill loading 
  const [error, setError]       = useState<string | null>(null) //Stores error message if API fails. 

  const filtersKey = JSON.stringify(filters) //converts an object into a string.

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

/*usecallback meaning : Meaning:

If filtersKey does NOT change
→ React keeps the same fetchProducts function

But if filters change:

filtersKey changes
↓
useCallback creates new fetchProducts
↓
useEffect runs again
↓
new products fetched
*/
'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserService } from '@/services/user.service'
import { User } from '@/types/auth.types'

interface UseUsersReturn {
  users: User[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await UserService.getAll()
      setUsers(res.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return { users, loading, error, refetch: fetchUsers }
}

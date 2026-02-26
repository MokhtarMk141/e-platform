'use client'
import React, { useState } from 'react'
import { AuthService } from '@/services/auth.service'
import { LoginCredentials } from '@/types/auth.types'
import { useRouter } from 'next/navigation'

/*
  LOGIN PAGE
  - Calls POST /auth/login via AuthService.login()
  - On success: stores accessToken + user in localStorage, redirects to /dashboard
  - On error: displays error message from backend
*/

export default function Login() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError(null)
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
//Si tu ne mets pas e.preventDefault(), la page se recharge et tu ne verras jamais ton console.log.
//Si tu mets e.preventDefault(), la page reste sur place, et tu peux faire ce que tu veux avec les données du formulaire.

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const loginData: LoginCredentials = {
        email: formData.email,
        password: formData.password,
      }
//Prépare un objet loginData respectant le type LoginCredentials.
//Contient les informations nécessaires pour l’API de login.


      await AuthService.login(loginData)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>Sign in to your account</p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email"><strong>Email</strong></label><br />
          <input
            id="email" name="email" type="email"
            placeholder="name@company.com"
            value={formData.email} onChange={handleInputChange}
            disabled={isLoading}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password"><strong>Password</strong></label><br />
          <input
            id="password" name="password" type="password"
            placeholder="Your password"
            value={formData.password} onChange={handleInputChange}
            disabled={isLoading}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <a href="/forgot-password">Forgot password?</a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%', padding: 10,
            background: '#cc2200', color: '#fff', border: 'none',
            fontWeight: 'bold', fontSize: 14,
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: 16, textAlign: 'center' }}>
        Don't have an account? <a href="/register">Create account</a>
      </p>
    </div>
  )
}

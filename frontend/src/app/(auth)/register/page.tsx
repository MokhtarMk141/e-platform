'use client'
import { useState } from 'react'
import { AuthService } from '@/services/auth.service'
import { RegisterCredentials } from '@/types/auth.types'
import { useRouter } from 'next/navigation'

/*
  REGISTER PAGE
  - Calls POST /auth/register via AuthService.register()
  - On success: stores accessToken + user (with role) in localStorage, redirects to /dashboard
  - On error: displays error message from backend
*/

export default function Register() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const hasMinLength = formData.password.length >= 8
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword
  const isFormValid = formData.fullName && formData.email && hasMinLength && passwordsMatch

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    setIsLoading(true)
    setError(null)
    try {
      const registerData: RegisterCredentials = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      }
      // POST /auth/register → returns { accessToken, user: { id, name, email, role } }
      await AuthService.register(registerData)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2>Create Account</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>Register a new account</p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="fullName"><strong>Full Name</strong></label><br />
          <input
            id="fullName" name="fullName" type="text" placeholder="John Doe"
            value={formData.fullName} onChange={handleInputChange}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email"><strong>Email</strong></label><br />
          <input
            id="email" name="email" type="email" placeholder="name@company.com"
            value={formData.email} onChange={handleInputChange}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password"><strong>Password</strong> (min 8 chars)</label><br />
          <input
            id="password" name="password" type="password" placeholder="Min 8 characters"
            value={formData.password} onChange={handleInputChange}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc' }}
          />
          {formData.password && (
            <small style={{ color: hasMinLength ? 'green' : 'red' }}>
              {hasMinLength ? '✓' : '✗'} 8+ characters
            </small>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="confirmPassword"><strong>Confirm Password</strong></label><br />
          <input
            id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter password"
            value={formData.confirmPassword} onChange={handleInputChange}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc' }}
          />
          {formData.confirmPassword && (
            <small style={{ color: passwordsMatch ? 'green' : 'red' }}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </small>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          style={{
            width: '100%', padding: 10,
            background: isFormValid ? '#cc2200' : '#ccc',
            color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 14,
          }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: 16, textAlign: 'center' }}>
        Already have an account? <a href="/login">Sign In</a>
      </p>
    </div>
  )
}

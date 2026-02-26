'use client'
import { useState, useEffect, Suspense } from 'react'
import { AuthService } from '@/services/auth.service'
import { useRouter, useSearchParams } from 'next/navigation'

/*
  RESET PASSWORD PAGE
  - Reads ?token= from URL query params
  - Calls POST /auth/reset-password via AuthService.resetPassword({ token, password })
  - On success: redirects to /login after 3 seconds
*/

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token.')
  }, [token])

  const hasMinLength = formData.password.length >= 8
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword
  const isFormValid = hasMinLength && passwordsMatch && token

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error && token) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || !token) return
    setIsLoading(true)
    setError(null)
    try {
      await AuthService.resetPassword({ token, password: formData.password })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(err.message || 'Reset failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2>Reset Password</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>Enter your new password</p>

      {success && <div className="success">Password reset! Redirecting to login...</div>}
      {error && <div className="error">{error}</div>}

      {!success && token && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="password"><strong>New Password</strong></label><br />
            <input
              id="password" name="password" type="password" placeholder="Min 8 characters"
              value={formData.password} onChange={handleInputChange}
              style={{ width: '100%', padding: 8, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="confirmPassword"><strong>Confirm Password</strong></label><br />
            <input
              id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter password"
              value={formData.confirmPassword} onChange={handleInputChange}
              style={{ width: '100%', padding: 8, border: '1px solid #ccc' }}
            />
          </div>
          <button
            type="submit" disabled={!isFormValid || isLoading}
            style={{ width: '100%', padding: 10, background: '#cc2200', color: '#fff', border: 'none', fontWeight: 'bold' }}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      <p style={{ marginTop: 16, textAlign: 'center' }}>
        <a href="/login">Back to Login</a>
      </p>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResetPasswordForm />
    </Suspense>
  )
}

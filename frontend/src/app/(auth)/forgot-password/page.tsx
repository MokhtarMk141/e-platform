'use client'
import { useState } from 'react'
import { AuthService } from '@/services/auth.service'

/*
  FORGOT PASSWORD PAGE
  - Calls POST /auth/forgot-password via AuthService.forgotPassword()
  - On success: shows confirmation message
*/

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email'); return }
    setIsLoading(true)
    setError(null)
    try {
      await AuthService.forgotPassword({ email })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2>Forgot Password</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>Enter your email to receive a reset link</p>

      {success && <div className="success">If an account exists with that email, a reset link has been sent.</div>}
      {error && <div className="error">{error}</div>}

      {!success && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="email"><strong>Email</strong></label><br />
            <input
              id="email" type="email" placeholder="name@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: 8, border: '1px solid #ccc' }}
            />
          </div>
          <button
            type="submit" disabled={isLoading || !email}
            style={{ width: '100%', padding: 10, background: '#cc2200', color: '#fff', border: 'none', fontWeight: 'bold' }}
          >
            {isLoading ? 'Processing...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p style={{ marginTop: 16, textAlign: 'center' }}>
        <a href="/login">Back to Login</a>
      </p>
    </div>
  )
}

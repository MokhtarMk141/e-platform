'use client'
import img from '../../../../public/icons8-razer-logo-3.png'
import { useState, useEffect, Suspense } from 'react'
import { AuthService } from '@/services/auth.service'
import { useRouter, useSearchParams } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token. Please request a new link.')
  }, [token])

  const hasNumber = /\d/.test(formData.password)
  const hasUppercase = /[A-Z]/.test(formData.password)
  const hasLowercase = /[a-z]/.test(formData.password)
  const hasMinLength = formData.password.length >= 8
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword
  const isFormValid = hasMinLength && hasNumber && hasUppercase && hasLowercase && passwordsMatch && token

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
      setError(err.message || 'Reset failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-sm mx-auto">
      <div className="w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Reset Password</h2>
          <p className="mt-2 text-sm text-text-muted font-medium">Enter your new password below</p>
        </div>

        {success && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 p-4">
            <p className="text-sm text-green-700 dark:text-green-400 text-center font-medium">
              Password has been reset successfully! Redirecting to login...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4">
            <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
          </div>
        )}

        {!success && token && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 relative">
              <label htmlFor="password" className="text-xs font-bold text-text-dim uppercase tracking-widest ml-1">New Password</label>
              <div className="relative">
                <input
                  id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required
                  value={formData.password} onChange={handleInputChange} autoComplete="new-password"
                  className="block w-full rounded-xl bg-surface border border-border px-4 py-3.5 text-foreground placeholder:text-text-dim focus:border-brand-red focus:bg-background focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-foreground">
                  {showPassword ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                </button>
              </div>
            </div>

            <div className="space-y-1 relative">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-text-dim uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" required
                  value={formData.confirmPassword} onChange={handleInputChange} autoComplete="new-password"
                  className="block w-full rounded-xl bg-surface border border-border px-4 py-3.5 text-foreground placeholder:text-text-dim focus:border-brand-red focus:bg-background focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-foreground">
                  {showConfirmPassword ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 p-3 bg-surface rounded-lg">
              <p className={`text-[10px] font-bold uppercase tracking-tight ${hasMinLength ? "text-green-600" : "text-text-dim"}`}>{hasMinLength ? "✓" : "○"} 8+ Characters</p>
              <p className={`text-[10px] font-bold uppercase tracking-tight ${hasUppercase ? "text-green-600" : "text-text-dim"}`}>{hasUppercase ? "✓" : "○"} Uppercase</p>
              <p className={`text-[10px] font-bold uppercase tracking-tight ${hasLowercase ? "text-green-600" : "text-text-dim"}`}>{hasLowercase ? "✓" : "○"} Lowercase</p>
              <p className={`text-[10px] font-bold uppercase tracking-tight ${hasNumber ? "text-green-600" : "text-text-dim"}`}>{hasNumber ? "✓" : "○"} Number</p>
              {formData.confirmPassword && <p className={`text-[10px] font-bold uppercase tracking-tight ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>{passwordsMatch ? "✓ Passwords Match" : "✗ Passwords Mismatch"}</p>}
            </div>

            <button
              type="submit" disabled={!isFormValid || isLoading}
              className="flex w-full justify-center rounded-xl bg-foreground px-4 py-4 text-sm font-bold text-background hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {(!token && !success) && (
          <div className="text-center">
             <a href="/forgot-password" title="redirect email reset" className="font-bold text-foreground hover:text-brand-red transition-colors underline decoration-2 underline-offset-4">Request a new link</a>
          </div>
        )}

        <p className="text-center text-sm text-text-muted font-medium">
          <a href="/login" className="font-bold text-foreground hover:text-brand-red transition-colors underline decoration-2 underline-offset-4">Back to Login</a>
        </p>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <div className="bg-background min-h-screen flex relative transition-colors duration-300">
      
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full h-screen flex relative">
        <div 
          className="w-3/5 relative hidden lg:block"
          style={{
            backgroundImage: `url(${img.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
        </div>

        <div className="w-full lg:w-2/5 bg-background flex items-center justify-center p-12 lg:ml-auto relative z-20 lg:border-l border-border shadow-xl">
          <div style={{position:'relative', right:'0 lg:100px'}} className="w-full max-w-md space-y-6 bg-background p-10 rounded-2xl shadow-2xl border border-border">
            <Suspense fallback={<div className="text-foreground">Loading...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

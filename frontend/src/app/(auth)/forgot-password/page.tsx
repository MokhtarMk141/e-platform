'use client'
import img from '../../../../public/icons8-razer-logo-3.png'
import { useState } from 'react'
import { AuthService } from '@/services/auth.service'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await AuthService.forgotPassword({ email })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
            <div className="w-full max-w-sm mx-auto">
              <div className="w-full space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">Forgot Password</h2>
                  <p className="mt-2 text-sm text-text-muted font-medium">Enter your email to receive a reset link</p>
                </div>

                {success && (
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 p-4">
                    <p className="text-sm text-green-700 dark:text-green-400 text-center font-medium">
                      If an account exists with that email, a password reset link has been sent.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
                  </div>
                )}

                {!success && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-xs font-bold text-text-dim uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        id="email" name="email" type="email" placeholder="name@company.com" required
                        value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                        className="block w-full rounded-xl bg-surface border border-border px-4 py-4 text-foreground placeholder:text-text-dim focus:border-brand-red focus:bg-background focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all"
                      />
                    </div>

                    <button
                      type="submit" disabled={isLoading || !email}
                      className="flex w-full justify-center rounded-xl bg-foreground px-4 py-4 text-sm font-bold text-background hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isLoading ? 'Processing...' : 'Send Reset Link'}
                    </button>
                  </form>
                )}

                <p className="text-center text-sm text-text-muted font-medium">
                  Remember your password?{' '}
                  <a href="/login" className="font-bold text-foreground hover:text-brand-red transition-colors underline decoration-2 underline-offset-4">Sign In</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

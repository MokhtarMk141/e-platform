'use client'
import img from '../../../../public/icons8-razer-logo-3.png'
import { useState } from 'react'
import { AuthService } from '@/services/auth.service'
import { LoginCredentials } from '@/types/auth.types'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'

export default function Login() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const loginData: LoginCredentials = {
        email: formData.email,
        password: formData.password
      }
      await AuthService.login(loginData)
      router.push('/dashboard') 
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-background min-h-screen flex relative transition-colors duration-300">
      
      {/* Fixed Theme Toggle for Auth Pages */}
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full h-screen flex relative">
        
        {/* Left Side - Background Image */}
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

        {/* Right Side - Form */}
        <div className="w-full lg:w-2/5 bg-background flex items-center justify-center p-12 lg:ml-auto relative z-20 lg:border-l border-border shadow-xl">
          <div style={{position:'relative', right:'0 lg:100px'}} className="w-full max-w-md space-y-6 bg-background p-10 rounded-2xl shadow-2xl border border-border">
            
            <div className="w-full max-w-sm mx-auto">
              <div className="w-full space-y-6">

                {/* Title */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    Welcome Back
                  </h2>
                  <p className="mt-2 text-sm text-text-muted font-medium">
                    Please enter your details to sign in
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
                  </div>
                )}

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-bold text-text-dim uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      disabled={isLoading}
                      className="block w-full rounded-xl bg-surface border border-border px-4 py-3.5 text-foreground placeholder:text-text-dim focus:border-brand-red focus:bg-background focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label htmlFor="password" className="text-xs font-bold text-text-dim uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="block w-full rounded-xl bg-surface border border-border px-4 py-3.5 text-foreground placeholder:text-text-dim focus:border-brand-red focus:bg-background focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <a href="/forgot-password" title="reset password" className="text-sm font-bold text-brand-red hover:text-brand-red-hover transition-colors">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !formData.email || !formData.password}
                    className="flex w-full justify-center rounded-xl bg-foreground px-4 py-4 text-sm font-bold text-background hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                    <span className="bg-background px-4 text-text-dim">OR</span>
                  </div>
                </div>

                <p className="text-center text-sm text-text-muted font-medium">
                  Don't have an account?{' '}
                  <a href="/register" className="font-bold text-foreground hover:text-brand-red transition-colors underline decoration-2 underline-offset-4">
                    Create account
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
        <div className="absolute bottom-0 left-0 right-0 z-30 overflow-hidden bg-gradient-to-t from-black/50 to-transparent py-6">
          <div className="flex items-center gap-12 animate-scroll">
            {/* First set of logos */}
            <div className="flex items-center gap-12 shrink-0">
              {/* Intel */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg"
                  alt="Intel"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* NVIDIA */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/NVIDIA_logo_white.svg/3840px-NVIDIA_logo_white.svg.png"
                  alt="NVIDIA"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* AMD */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://media.johnlewiscontent.com/i/JohnLewis/amd_brl_white?fmt=auto&$alpha$"
                  alt="AMD"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* Corsair */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://www.pngplay.com/wp-content/uploads/13/Corsair-PNG-HD-Quality.png"
                  alt="Corsair"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* Razer */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://www.svgrepo.com/show/306644/razer.svg"
                  alt="Razer"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* ASUS */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://www.freepnglogos.com/uploads/logo-asus-png/asus-white-logo-png-22.png"
                  alt="ASUS"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* MSI */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://storage-asset.msi.com/event/spb/2017/InfiniteA_H5page/images/logo.png"
                  alt="MSI"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* Logitech */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://companieslogo.com/img/orig/LOGI_BIG.D-3f288e21.png?t=1720244492"
                  alt="Logitech"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>
            </div>

            {/* Duplicate set for seamless loop */}
            <div className="flex items-center gap-12 shrink-0">
              {/* Intel */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg"
                  alt="Intel"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* NVIDIA */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/NVIDIA_logo_white.svg/3840px-NVIDIA_logo_white.svg.png"
                  alt="NVIDIA"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* AMD */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://media.johnlewiscontent.com/i/JohnLewis/amd_brl_white?fmt=auto&$alpha$"
                  alt="AMD"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* Corsair */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://www.pngplay.com/wp-content/uploads/13/Corsair-PNG-HD-Quality.png"
                  alt="Corsair"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* Razer */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://www.svgrepo.com/show/306644/razer.svg"
                  alt="Razer"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* ASUS */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://www.freepnglogos.com/uploads/logo-asus-png/asus-white-logo-png-22.png"
                  alt="ASUS"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* MSI */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://storage-asset.msi.com/event/spb/2017/InfiniteA_H5page/images/logo.png"
                  alt="MSI"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>

              {/* Logitech */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://companieslogo.com/img/orig/LOGI_BIG.D-3f288e21.png?t=1720244492"
                  alt="Logitech"
                  className="h-6 opacity-80 brightness-0 invert"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Keyframe Animations */}
        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .animate-scroll {
            animation: scroll 30s linear infinite;
          }

          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
    </div>
  )
}
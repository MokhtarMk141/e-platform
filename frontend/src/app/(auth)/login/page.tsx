  'use client'
  import img from '../../../../public/icons8-razer-logo-3.png'
  import { useState } from 'react'
  import { AuthService } from '@/services/auth.service'
  import { LoginCredentials } from '@/types/auth.types'
  import { useRouter } from 'next/navigation'

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
      
      // Basic validation
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

        const response = await AuthService.login(loginData)
        
        console.log('Login successful:', response)
        
        router.push('/dashboard') 
        
      } catch (err: any) {
        setError(err.message || 'Login failed. Please check your credentials and try again.')
        console.error('Login error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    const handleSocialLogin = (provider: 'google' | 'facebook') => {
      console.log(`Login with ${provider}`)
  
    }

    return (
      <div className="bg-white min-h-screen flex relative">
        <div className="w-full h-screen flex relative">
          
          {/* Left Side - Background Image */}
          <div 
            className="w-3/5 relative"
            style={{
              backgroundImage: `url(${img.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Left side content can go here if needed */}
          </div>

          {/* Right Side - Black Form */}
          <div className="w-2/5 bg-black flex items-center justify-center p-12 ml-auto relative z-20">
            <div style={{position:'relative', right:'100px'}} className="w-full max-w-md space-y-6">
              
  
              {/* Centered Login Form */}
              <div className="w-full max-w-sm mx-auto">
                <div className="w-full space-y-6">

                  {/* Title */}
                  <div className="text-center">
                    <h2 className="text-3xl font-semibold tracking-tight text-white">
                      Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                      Please enter your details to sign in
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </div>
                  )}

                  


                  {/* Email/Password Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="email"
                        disabled={isLoading}
                        className="block w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="block w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
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

                    {/* Forgot Password Link */}
                    <div className="flex items-center justify-end">
                      <a 
                        href="/forgot-password" 
                        className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !formData.email || !formData.password}
                      className="flex w-full justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Signing in...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-black px-4 text-gray-400">OR</span>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-400">
                    Don t have an account?{' '}
                    <a 
                      href="/register" 
                      className="font-semibold text-white hover:text-gray-300 transition-colors"
                    >
                      Sign Up
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Logos at Bottom - Full Width */}
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
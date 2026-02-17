'use client'
import img from '../../../../public/icons8-razer-logo-3.png'
import { useState } from 'react'

export default function Example() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')

  // Password validation
  const hasNumber = /\d/.test(password)
  const hasMinLength = password.length >= 8

  return (
    <div className="bg-white min-h-screen flex relative">
      <div className="w-full h-screen flex relative">
        
        {/* Left Side - Background Image */}
        <div 
          className="w-1/2 relative"
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
        <div className="w-1/2 bg-black flex items-center justify-center p-12 ml-auto relative z-20">
          <div className="w-full max-w-md space-y-6">
            
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white">
                Build Your Dream PC
              </h2>
            </div>

            {/* Centered Login Form */}
            <div className="w-full max-w-sm mx-auto">
              <div className="w-full space-y-6">
                
                {/* Logo */}
                <div className="flex justify-center">
                  <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2"/>
                  </svg>
                </div>

                {/* Title */}
                <div className="text-center">
                  <h2 className="text-3xl font-semibold tracking-tight text-white">
                    Welcome 
                  </h2>
                  <p className="mt-2 text-sm text-gray-400">
                    Please enter your details to create your account
                  </p>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.796.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.763v2.314h3.587l-.467 3.622h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"/>
                    </svg>
                    Continue with Facebook
                  </button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-black px-4 text-gray-400">OR</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form className="space-y-4">
                  <div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      required
                      autoComplete="email"
                      className="block w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                    />
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="block w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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

                  {/* Password validation hints */}
                  {password && (
                    <div className="space-y-1 text-sm">
                      <p className={hasMinLength ? "text-green-400" : "text-gray-400"}>
                        ✓ At least 8 characters
                      </p>
                      <p className={hasNumber ? "text-green-400" : "text-gray-400"}>
                        ✓ Contains at least 1 number
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-gray-100 transition-colors"
                  >
                    Sign In
                  </button>
                </form>

                <p className="text-center text-sm text-gray-400">
                  Don't have an account?{' '}
                  <a href="#" className="font-semibold text-white hover:text-gray-300">
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
        </div></div>
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
'use client'
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

  const isFormValid = formData.email && formData.password

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) {
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

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )

  const logos = [
    { src: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg', alt: 'Intel' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/NVIDIA_logo_white.svg/3840px-NVIDIA_logo_white.svg.png', alt: 'NVIDIA' },
    { src: 'https://media.johnlewiscontent.com/i/JohnLewis/amd_brl_white?fmt=auto&$alpha$', alt: 'AMD' },
    { src: 'https://www.pngplay.com/wp-content/uploads/13/Corsair-PNG-HD-Quality.png', alt: 'Corsair' },
    { src: 'https://www.svgrepo.com/show/306644/razer.svg', alt: 'Razer' },
    { src: 'https://www.freepnglogos.com/uploads/logo-asus-png/asus-white-logo-png-22.png', alt: 'ASUS' },
    { src: 'https://storage-asset.msi.com/event/spb/2017/InfiniteA_H5page/images/logo.png', alt: 'MSI' },
    { src: 'https://companieslogo.com/img/orig/LOGI_BIG.D-3f288e21.png?t=1720244492', alt: 'Logitech' }
  ]

  return (
    <>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }

        .auth-root {
          --panel-bg: #ffffff;
          --panel-border: rgba(0,0,0,0.08);
          --input-bg: #f5f5f7;
          --input-border: #e0e0e5;
          --input-border-focus: var(--brand-red);
          --input-ring: rgba(255,40,0,0.14);
          --label-color: #6b6b7b;
          --placeholder-color: #b0b0bc;
          --heading-color: #0a0a0f;
          --subtext-color: #6b6b7b;
          --btn-bg: var(--brand-red);
          --btn-color: #ffffff;
          --btn-hover: var(--brand-red-hover);
          --divider-color: #e0e0e5;
          --divider-text: #b0b0bc;
          --link-color: #0a0a0f;
          --link-hover: var(--brand-red);
          --ticker-bg: rgba(0,0,0,0.72);
          --ticker-filter: brightness(0) invert(1);
        }

        :global(.dark) .auth-root {
          --panel-bg: #111115;
          --panel-border: rgba(255,255,255,0.08);
          --input-bg: #1c1c22;
          --input-border: rgba(255,255,255,0.1);
          --input-border-focus: var(--brand-red);
          --input-ring: rgba(255,40,0,0.2);
          --label-color: rgba(255,255,255,0.4);
          --placeholder-color: rgba(255,255,255,0.2);
          --heading-color: #f0f0f5;
          --subtext-color: rgba(255,255,255,0.4);
          --btn-bg: var(--brand-red);
          --btn-color: #ffffff;
          --btn-hover: var(--brand-red-hover);
          --divider-color: rgba(255,255,255,0.08);
          --divider-text: rgba(255,255,255,0.25);
          --link-color: #f0f0f5;
          --link-hover: var(--brand-red);
          --ticker-bg: rgba(0,0,0,0.65);
          --ticker-filter: brightness(0) invert(1);
        }

        .auth-root {
          min-height: 100vh;
          display: flex;
          position: relative;
          background: var(--panel-bg);
          transition: background 0.3s;
        }
        .photo-panel {
          width: 55%;
          position: relative;
          display: none;
          background-color: #050507;
        }
        @media (min-width: 1024px) {
          .photo-panel { display: block; }
        }
        .photo-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, transparent 70%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
        }
        .form-panel {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background: var(--panel-bg);
          position: relative;
          z-index: 20;
          transition: background 0.3s;
        }
        @media (min-width: 1024px) {
          .form-panel {
            width: 42%;
            border-left: 1px solid var(--panel-border);
          }
        }
        .form-card {
          width: 100%;
          max-width: 400px;
        }
        .form-heading {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          color: var(--heading-color);
          margin-bottom: 6px;
          line-height: 1.1;
        }
        .form-subtext {
          font-size: 0.875rem;
          color: var(--subtext-color);
        }
        .field-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--label-color);
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%;
          border-radius: 10px;
          background: var(--input-bg);
          border: 1.5px solid var(--input-border);
          padding: 11px 16px;
          font-size: 0.875rem;
          color: var(--heading-color);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.3s;
          box-sizing: border-box;
        }
        .field-input::placeholder {
          color: var(--placeholder-color);
        }
        .field-input:hover {
          border-color: var(--brand-red);
        }
        .field-input:focus {
          border-color: var(--input-border-focus);
          box-shadow: 0 0 0 3px var(--input-ring);
          background: var(--panel-bg);
        }
        .pw-wrap {
          position: relative;
        }
        .pw-wrap .field-input {
          padding-right: 44px;
        }
        .pw-toggle {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--label-color);
          padding: 0;
          display: flex;
          align-items: center;
        }
        .pw-toggle:hover {
          color: var(--brand-red);
        }
        .submit-btn {
          width: 100%;
          padding: 13px 16px;
          border-radius: 10px;
          background: var(--btn-bg);
          color: var(--btn-color);
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--btn-hover);
          color: #ffffff;
        }
        .submit-btn:active:not(:disabled) {
          transform: scale(0.99);
        }
        .submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .or-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }
        .or-line {
          flex: 1;
          height: 1px;
          background: var(--divider-color);
        }
        .or-text {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--divider-text);
        }
        .signin-text {
          text-align: center;
          font-size: 0.8125rem;
          color: var(--subtext-color);
        }
        .signin-link {
          font-weight: 700;
          color: var(--link-color);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s;
        }
        .signin-link:hover {
          color: var(--link-hover);
        }
        .error-box {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 0.8125rem;
          color: #ef4444;
          text-align: center;
          font-weight: 500;
        }
        .ticker-wrap {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 30;
          overflow: hidden;
          background: var(--ticker-bg);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 12px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .ticker-logos {
          display: flex;
          align-items: center;
          gap: 48px;
        }
        .ticker-logos-set {
          display: flex;
          align-items: center;
          gap: 48px;
          flex-shrink: 0;
        }
        .ticker-logo {
          height: 20px;
          filter: var(--ticker-filter);
          opacity: 0.7;
          object-fit: contain;
        }
        .theme-toggle-wrap {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 50;
        }
        .space-y-5 > * + * { margin-top: 20px; }
        .space-y-4 > * + * { margin-top: 16px; }
        .mb-8 { margin-bottom: 32px; }
        .mb-2 { margin-bottom: 8px; }
      `}</style>

      <div className="auth-root">
        <div className="theme-toggle-wrap">
          <ThemeToggle />
        </div>

        <div className="photo-panel">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(https://antrikshy.com/assets/reviews/2023-pc-build-hero.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '3px',
              height: '100%',
              background: 'linear-gradient(to bottom, transparent, #e53935 40%, transparent)',
              opacity: 0.6
            }}
          />
        </div>

        <div className="form-panel">
          <div className="form-card">
            <div className="mb-8">
              <h2 className="form-heading">Welcome Back</h2>
              <p className="form-subtext">Sign in to continue building your perfect setup</p>
            </div>

            {error && <div className="error-box mb-2">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="field-label">Email Address</label>
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
                  className="field-input"
                />
              </div>

              <div>
                <label htmlFor="password" className="field-label">Password</label>
                <div className="pw-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="........"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="field-input"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="pw-toggle" disabled={isLoading}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <a href="/forgot-password" className="signin-link" style={{ fontSize: '0.8125rem' }}>
                  Forgot password?
                </a>
              </div>

              <button type="submit" disabled={!isFormValid || isLoading} className="submit-btn" style={{ marginTop: 24 }}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{ marginTop: 20 }}>
              <div className="or-divider">
                <div className="or-line" />
                <span className="or-text">or</span>
                <div className="or-line" />
              </div>
            </div>

            <p className="signin-text" style={{ marginTop: 16 }}>
              Don't have an account?{' '}
              <a href="/register" className="signin-link">Create account</a>
            </p>
          </div>
        </div>

        <div className="ticker-wrap">
          <div className="ticker-logos animate-scroll">
            {[...logos, ...logos].map((logo, i) => (
              <div key={i} className="ticker-logos-set" style={{ display: 'inline-flex' }}>
                <img src={logo.src} alt={logo.alt} className="ticker-logo" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

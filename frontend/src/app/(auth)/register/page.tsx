'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { RegisterCredentials } from '@/types/auth.types'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import { AuthService } from '@/services/auth.service'

export default function Register() {
  const router = useRouter()
  const { register } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const hasNumber = /\d/.test(formData.password)
  const hasUppercase = /[A-Z]/.test(formData.password)
  const hasLowercase = /[a-z]/.test(formData.password)
  const hasMinLength = formData.password.length >= 8
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword
  const isFormValid = formData.fullName && formData.email && hasMinLength && hasNumber && hasUppercase && hasLowercase && passwordsMatch

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
        password: formData.password
      }
      await register(registerData)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return setForgotError('Please enter your email')
    setForgotLoading(true)
    setForgotError(null)
    try {
      await AuthService.forgotPassword({ email: forgotEmail })
      setForgotSuccess(true)
    } catch (err: any) {
      setForgotError(err.message || 'Something went wrong.')
    } finally {
      setForgotLoading(false)
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
    { src: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg", alt: "Intel" },
    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/NVIDIA_logo_white.svg/3840px-NVIDIA_logo_white.svg.png", alt: "NVIDIA" },
    { src: "https://media.johnlewiscontent.com/i/JohnLewis/amd_brl_white?fmt=auto&$alpha$", alt: "AMD" },
    { src: "https://www.pngplay.com/wp-content/uploads/13/Corsair-PNG-HD-Quality.png", alt: "Corsair" },
    { src: "https://www.svgrepo.com/show/306644/razer.svg", alt: "Razer" },
    { src: "https://www.freepnglogos.com/uploads/logo-asus-png/asus-white-logo-png-22.png", alt: "ASUS" },
    { src: "https://storage-asset.msi.com/event/spb/2017/InfiniteA_H5page/images/logo.png", alt: "MSI" },
    { src: "https://companieslogo.com/img/orig/LOGI_BIG.D-3f288e21.png?t=1720244492", alt: "Logitech" },
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

        /* ── LIGHT MODE ── */
        .auth-root {
          --panel-bg: #ffffff;
          --panel-border: rgba(0,0,0,0.08);
          --panel-shadow: 0 32px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06);
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
          --strength-bg: #f0f0f3;
          --ticker-bg: rgba(0,0,0,0.72);
          --ticker-filter: brightness(0) invert(1);
        }

        /* ── DARK MODE ── */
        :global(.dark) .auth-root {
          --panel-bg: #111115;
          --panel-border: rgba(255,255,255,0.08);
          --panel-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4);
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
          --strength-bg: #1c1c22;
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

        /* Left panel — always the dark photo side */
        .photo-panel {
          width: 55%;
          position: relative;
          display: none;
          background-color: #050507;
        }
        @media (min-width: 1024px) {
          .photo-panel { display: block; }
        }
        .photo-panel-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
        }
        /* Subtle right-edge fade so the photo bleeds into the form panel */
        .photo-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, transparent 70%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
        }

        /* Right panel — adapts to theme */
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

        /* Card */
        .form-card {
          width: 100%;
          max-width: 400px;
        }

        /* Heading */
        .form-heading {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          color: var(--heading-color);
          margin-bottom: 6px;
          line-height: 1.1;
          transition: color 0.3s;
        }
        .form-subtext {
          font-size: 0.875rem;
          color: var(--subtext-color);
          transition: color 0.3s;
        }

        /* Labels */
        .field-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--label-color);
          margin-bottom: 6px;
          transition: color 0.3s;
        }

        /* Inputs */
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

        /* Password wrapper */
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
          transition: color 0.2s;
        }
        .pw-toggle:hover {
          color: var(--brand-red);
        }

        /* Strength indicators */
        .strength-box {
          background: var(--strength-bg);
          border-radius: 10px;
          padding: 10px 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 12px;
          transition: background 0.3s;
        }
        .strength-item {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .strength-ok { color: #22c55e; }
        .strength-no { color: var(--label-color); }
        .strength-err { color: #ef4444; }

        /* Submit button */
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

        /* Divider */
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
          transition: background 0.3s;
        }
        .or-text {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--divider-text);
          transition: color 0.3s;
        }

        /* Sign in link */
        .signin-text {
          text-align: center;
          font-size: 0.8125rem;
          color: var(--subtext-color);
          transition: color 0.3s;
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

        /* Error box */
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

        /* Logo ticker */
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
          transition: background 0.3s;
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

        /* Theme toggle */
        .theme-toggle-wrap {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 50;
        }

        /* Spacing helpers */
        .space-y-5 > * + * { margin-top: 20px; }
        .space-y-4 > * + * { margin-top: 16px; }
        .mb-8 { margin-bottom: 32px; }
        .mb-2 { margin-bottom: 8px; }

        /* ── Modal Overlay — blurs the page behind it ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 10, 15, 0.55);
          backdrop-filter: blur(16px) saturate(1.2);
          -webkit-backdrop-filter: blur(16px) saturate(1.2);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          opacity: 0;
          animation: overlayFadeIn 0.25s ease forwards;
        }
        @keyframes overlayFadeIn { to { opacity: 1; } }

        /* ── Modal Card — fully opaque, matches site design ── */
        .modal-content {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.09);
          border-radius: 20px;
          padding: 0;
          width: 100%;
          max-width: 420px;
          position: relative;
          box-shadow: 0 32px 64px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.1);
          overflow: hidden;
          transform: scale(0.94) translateY(16px);
          opacity: 0;
          animation: modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
        }
        :global(.dark) .modal-content {
          background: #111115;
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 32px 64px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5);
        }
        @keyframes modalPop { to { opacity: 1; transform: scale(1) translateY(0); } }

        /* Red accent bar at the very top of the modal */
        .modal-accent-bar {
          height: 4px;
          background: linear-gradient(90deg, var(--brand-red) 0%, #ff6b35 100%);
          width: 100%;
        }

        /* Inner padding container */
        .modal-inner {
          padding: 32px 32px 36px;
        }

        /* Icon badge */
        .modal-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(229, 57, 53, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: var(--brand-red);
        }
        :global(.dark) .modal-icon {
          background: rgba(229, 57, 53, 0.15);
        }

        .modal-close {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(0,0,0,0.05);
          border: none;
          border-radius: 8px;
          color: var(--label-color);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
          z-index: 2;
        }
        :global(.dark) .modal-close {
          background: rgba(255,255,255,0.07);
        }
        .modal-close:hover {
          background: rgba(229, 57, 53, 0.1);
          color: var(--brand-red);
        }

        /* Success state */
        .modal-success {
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }
        .modal-success-icon {
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .modal-success-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: #16a34a;
          margin-bottom: 6px;
        }
        .modal-success-text {
          font-size: 0.8rem;
          color: #22c55e;
          line-height: 1.5;
        }
      `}</style>

      <div className="auth-root">
        {/* Theme toggle */}
        <div className="theme-toggle-wrap">
          <ThemeToggle />
        </div>

        {/* Left — photo */}
        <div className="photo-panel">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(https://www.cultofmac.com/wp-content/uploads/2024/01/4tdaruveksdc1.jpeg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Dark overlay gradient for depth */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)',
          }} />
          {/* Subtle brand accent line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '3px',
            height: '100%',
            background: 'linear-gradient(to bottom, transparent, #e53935 40%, transparent)',
            opacity: 0.6,
          }} />
        </div>

        {/* Right — form */}
        <div className="form-panel">
          <div className="form-card">
            {/* Header */}
            <div className="mb-8">
              <h2 className="form-heading">Create Account</h2>
              <p className="form-subtext">Join us and start building your perfect setup</p>
            </div>

            {error && <div className="error-box mb-2">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="field-label">Full Name</label>
                <input
                  id="fullName" name="fullName" type="text" placeholder="John Doe" required
                  value={formData.fullName} onChange={handleInputChange} autoComplete="name"
                  className="field-input"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="field-label">Email Address</label>
                <input
                  id="email" name="email" type="email" placeholder="name@company.com" required
                  value={formData.email} onChange={handleInputChange} autoComplete="email"
                  className="field-input"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="field-label">Password</label>
                <div className="pw-wrap">
                  <input
                    id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required
                    value={formData.password} onChange={handleInputChange} autoComplete="new-password"
                    className="field-input"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="pw-toggle">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="field-label">Confirm Password</label>
                <div className="pw-wrap">
                  <input
                    id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" required
                    value={formData.confirmPassword} onChange={handleInputChange} autoComplete="new-password"
                    className="field-input"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="pw-toggle">
                    <EyeIcon open={showConfirmPassword} />
                  </button>
                </div>
              </div>

              {/* Password strength */}
              {formData.password && (
                <div className="strength-box">
                  <span className={`strength-item ${hasMinLength ? 'strength-ok' : 'strength-no'}`}>{hasMinLength ? '✓' : '○'} 8+ chars</span>
                  <span className={`strength-item ${hasUppercase ? 'strength-ok' : 'strength-no'}`}>{hasUppercase ? '✓' : '○'} Uppercase</span>
                  <span className={`strength-item ${hasLowercase ? 'strength-ok' : 'strength-no'}`}>{hasLowercase ? '✓' : '○'} Lowercase</span>
                  <span className={`strength-item ${hasNumber ? 'strength-ok' : 'strength-no'}`}>{hasNumber ? '✓' : '○'} Number</span>
                  {formData.confirmPassword && (
                    <span className={`strength-item ${passwordsMatch ? 'strength-ok' : 'strength-err'}`} style={{ gridColumn: '1 / -1' }}>
                      {passwordsMatch ? '✓ Passwords match' : '✗ Passwords mismatch'}
                    </span>
                  )}
                </div>
              )}

              <button type="submit" disabled={!isFormValid || isLoading} className="submit-btn" style={{ marginTop: 24 }}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
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
              Already have an account?{' '}
              <a href="/login" className="signin-link">Sign In</a>
            </p>
            <p className="signin-text" style={{ marginTop: 10 }}>
              <button
                type="button"
                onClick={() => { setForgotSuccess(false); setForgotError(null); setForgotEmail(''); setShowForgotModal(true); }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--subtext-color)' }}
              >
                Forgot your password?{' '}
                <span style={{ fontWeight: 700, color: 'var(--brand-red)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Reset it</span>
              </button>
            </p>
          </div>
        </div>

        {/* Logo ticker — always dark so logos stay visible */}
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          onClick={() => setShowForgotModal(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(10,10,15,0.60)',
            backdropFilter: 'blur(18px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.10)',
              borderRadius: 20,
              width: '100%', maxWidth: 420,
              position: 'relative',
              boxShadow: '0 32px 64px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.14)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setShowForgotModal(false)}
              aria-label="Close"
              style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b7b', zIndex: 2 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            {/* Red accent bar */}
            <div style={{ height: 4, background: 'linear-gradient(90deg, #e53935 0%, #ff6b35 100%)', width: '100%' }} />
            <div style={{ padding: '32px 32px 36px' }}>
              {/* Lock icon badge */}
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(229,57,53,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#e53935' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#0a0a0f', marginBottom: 8, lineHeight: 1.2 }}>Forgot Password?</h2>
                <p style={{ fontSize: '0.875rem', color: '#6b6b7b' }}>No worries — enter your email and we'll send you a reset link.</p>
              </div>
              {forgotSuccess ? (
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#16a34a', marginBottom: 6 }}>Check your inbox!</div>
                  <div style={{ fontSize: '0.8rem', color: '#22c55e', lineHeight: 1.5 }}>If an account exists with that email, a password reset link has been sent.</div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {forgotError && <div className="error-box">{forgotError}</div>}
                  <div>
                    <label className="field-label">Email Address</label>
                    <input type="email" required className="field-input" placeholder="name@company.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} disabled={forgotLoading} autoFocus />
                  </div>
                  <button type="submit" disabled={!forgotEmail || forgotLoading} style={{ marginTop: 8, width: '100%', padding: '13px 16px', borderRadius: 10, background: '#e53935', color: '#ffffff', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.03em', border: 'none', cursor: 'pointer', opacity: (!forgotEmail || forgotLoading) ? 0.5 : 1 }}>
                    {forgotLoading ? 'Processing...' : 'Send Reset Link'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6b6b7b', marginTop: 4 }}>
                    Remember your password?{' '}
                    <button type="button" onClick={() => setShowForgotModal(false)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 700, color: '#e53935', fontSize: '0.8rem' }}>Sign in</button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

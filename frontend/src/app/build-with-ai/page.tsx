'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MegaMenu from '../mega-menu/megaMenu'

/* ─── AI builder purpose tags ─── */
const purposeTags = [
  { label: '🎮 Gaming', value: 'gaming' },
  { label: '🎬 Streaming', value: 'streaming' },
  { label: '💼 Office', value: 'office' },
  { label: '🎨 Design', value: 'design' },
  { label: '🔬 Engineering', value: 'engineering' },
  { label: '📹 Video Editing', value: 'video-editing' },
]

const budgetOptions = [
  { label: 'Budget (300-500 DTN)', value: '300-500' },
  { label: 'Mid-Range (500-1000 DTN)', value: '500-1000' },
  { label: 'High-End (1000-2000 DTN)', value: '1000-2000' },
  { label: 'Premium (2000+ DTN)', value: '2000+' },
]

const howItWorks = [
  {
    step: '01',
    title: 'Describe Your Needs',
    desc: 'Tell us what you need — gaming, streaming, design, or anything else. Add your budget and preferences.',
    icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  },
  {
    step: '02',
    title: 'AI Builds Your PC',
    desc: 'Our AI analyzes thousands of components to find the perfect combination for your needs and budget.',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    step: '03',
    title: 'Review & Order',
    desc: 'Review your personalized build, swap any parts you want, and order with one click.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
]

const exampleBuilds = [
  {
    title: 'Budget Gaming',
    budget: '300-500 DTN',
    desc: 'Perfect for 1080p gaming at medium-high settings. Play Fortnite, Valorant, and more.',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    lightGradient: 'linear-gradient(135deg, #e8f0fe 0%, #d2e3fc 50%, #c3d7f7 100%)',
    emoji: '🎮',
  },
  {
    title: 'Streaming Setup',
    budget: '1000-1500 DTN',
    desc: 'Stream and game simultaneously. Powerful CPU for encoding with a beefy GPU.',
    gradient: 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #462255 100%)',
    lightGradient: 'linear-gradient(135deg, #f3e5f5 0%, #e8daef 50%, #f0e0f5 100%)',
    emoji: '🎬',
  },
  {
    title: 'Creative Workstation',
    budget: '1500-2500 DTN',
    desc: 'Video editing, 3D rendering, and design work. Lots of RAM and fast storage.',
    gradient: 'linear-gradient(135deg, #1a3a2a 0%, #0d2818 50%, #1a4a35 100%)',
    lightGradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #dcedc8 100%)',
    emoji: '🎨',
  },
]

export default function BuildWithAIPage() {
  const router = useRouter()

  const [builderStep, setBuilderStep] = useState<'choice' | 'ai-prompt'>('choice')
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [selectedBudget, setSelectedBudget] = useState('')
  const [promptText, setPromptText] = useState(
    'I need a PC for gaming with a budget around 1000 DTN. I want to play modern AAA games at 1080p with high settings. I also need good cooling and a clean aesthetic.'
  )

  const handleGenerate = () => {
    const searchTerms = [selectedPurpose, selectedBudget].filter(Boolean).join(' ')
    router.push(`/product-page${searchTerms ? `?search=${encodeURIComponent(searchTerms)}` : ''}`)
  }

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      background: 'var(--background)',
      minHeight: '100vh',
      color: 'var(--foreground)',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes gridPan {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-32px, -32px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-12px); }
        }

        * { box-sizing: border-box; }
        ::selection { background: var(--brand-red); color: #fff; }

        .bai-hero {
          position: relative;
          min-height: 680px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(160deg, #110505 0%, #0a0a0a 40%, #0f0a0a 100%);
        }
        :root .bai-hero { background: linear-gradient(160deg, #fffafa 0%, #ffffff 40%, #fcf5f5 100%); }
        .dark .bai-hero { background: linear-gradient(160deg, #110505 0%, #0a0a0a 40%, #0f0a0a 100%); }

        .bai-grid-bg {
          position: absolute; inset: -32px; opacity: 0.04;
          background-image: linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridPan 20s linear infinite;
        }

        .bai-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .bai-orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(255,40,0,0.15) 0%, transparent 70%); top: -100px; right: -50px; animation: pulseGlow 6s ease-in-out infinite; }
        .bai-orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,120,0,0.1) 0%, transparent 70%); bottom: -80px; left: -60px; animation: pulseGlow 8s ease-in-out infinite 2s; }
        .bai-orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,40,0,0.08) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); animation: pulseGlow 5s ease-in-out infinite 1s; }

        .bai-content {
          position: relative; z-index: 10;
          max-width: 780px; width: 100%;
          padding: 80px 32px 60px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }

        .bai-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 20px; border-radius: 999px;
          font-size: 13px; font-weight: 700; letter-spacing: 0.02em;
          margin-bottom: 32px;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both;
          border: 1px solid rgba(255,40,0,0.2);
          background: rgba(255,40,0,0.08);
          color: var(--brand-red);
          backdrop-filter: blur(12px);
        }
        .bai-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand-red); animation: pulseGlow 2s ease-in-out infinite; }

        .bai-title {
          font-size: clamp(36px, 5.5vw, 64px); font-weight: 900;
          line-height: 1.08; letter-spacing: -0.04em;
          margin: 0 0 24px;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }
        .bai-title-gradient {
          background: linear-gradient(135deg, var(--foreground) 0%, var(--foreground) 40%, var(--brand-red) 80%, #ff7a00 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .bai-subtitle {
          font-size: 16px; line-height: 1.7; color: var(--text-muted);
          max-width: 540px; margin: 0 0 40px;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }

        .builder-box {
          width: 100%; max-width: 680px; border-radius: 20px;
          border: 1px solid var(--border-strong); background: var(--background);
          overflow: hidden;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.04);
        }
        .builder-inner { padding: 28px; }

        .choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .choice-card {
          position: relative; display: flex; flex-direction: column; align-items: center; gap: 14px;
          padding: 36px 24px 32px; border-radius: 18px; border: 1.5px solid var(--border);
          background: linear-gradient(145deg, var(--surface) 0%, var(--background) 100%);
          cursor: pointer; transition: all 0.35s cubic-bezier(0.16,1,0.3,1); text-align: center; overflow: hidden;
        }
        .choice-card::before { content: ''; position: absolute; inset: 0; border-radius: 18px; opacity: 0; background: radial-gradient(ellipse at 50% 0%, rgba(255,40,0,0.08) 0%, transparent 70%); transition: opacity 0.4s; }
        .choice-card:hover::before { opacity: 1; }
        .choice-card:hover { border-color: rgba(255,40,0,0.5); transform: translateY(-6px) scale(1.01); box-shadow: 0 20px 40px rgba(255,40,0,0.12), 0 0 0 1px rgba(255,40,0,0.1); }

        .choice-icon {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,40,0,0.08); color: var(--brand-red);
          border: 1px solid rgba(255,40,0,0.15); transition: all 0.35s; position: relative; z-index: 1;
        }
        .choice-card:hover .choice-icon { background: rgba(255,40,0,0.14); border-color: rgba(255,40,0,0.3); box-shadow: 0 8px 24px rgba(255,40,0,0.18); transform: scale(1.08); }

        .choice-label { font-size: 16px; font-weight: 900; color: var(--foreground); letter-spacing: -0.02em; position: relative; z-index: 1; }
        .choice-desc { font-size: 13px; color: var(--text-dim); font-family: 'DM Sans', sans-serif; line-height: 1.5; max-width: 200px; position: relative; z-index: 1; }
        .choice-arrow {
          display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(255,40,0,0.08); color: var(--brand-red);
          transition: all 0.3s; position: relative; z-index: 1; margin-top: 4px;
        }
        .choice-card:hover .choice-arrow { background: var(--brand-red); color: #fff; transform: translateX(3px); }

        .prompt-area {
          width: 100%; min-height: 110px;
          border: 1.5px solid var(--border); background: var(--surface); border-radius: 14px;
          padding: 18px 20px; font-size: 14px; color: var(--foreground);
          font-family: 'DM Sans', sans-serif; resize: vertical; outline: none; line-height: 1.7;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .prompt-area::placeholder { color: var(--text-dim); }
        .prompt-area:focus { border-color: var(--brand-red); box-shadow: 0 0 0 3px rgba(255,40,0,0.12), 0 8px 24px rgba(255,40,0,0.06); }

        .prompt-section-label {
          display: flex; align-items: center; gap: 8px; margin: 0 0 12px;
          font-size: 11px; font-weight: 800; color: var(--text-dim);
          letter-spacing: 0.1em; text-transform: uppercase;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .prompt-section-label svg { color: var(--brand-red); opacity: 0.7; }

        .prompt-divider { width: 100%; height: 1px; background: var(--border); margin: 20px 0; }

        .prompt-input {
          width: 100%; padding: 12px 16px; border-radius: 10px;
          border: 1.5px solid var(--border); background: var(--surface);
          color: var(--foreground); font-size: 13px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .prompt-input::placeholder { color: var(--text-dim); font-weight: 500; }
        .prompt-input:focus { border-color: var(--brand-red); box-shadow: 0 0 0 3px rgba(255,40,0,0.1); }

        .generate-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, var(--brand-red) 0%, #ff5500 100%);
          color: #fff; font-size: 14px; font-weight: 800;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 8px 24px rgba(255,40,0,0.3); letter-spacing: -0.01em;
        }
        .generate-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255,40,0,0.4); }

        .back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--surface);
          color: var(--text-muted); font-size: 12px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .back-btn:hover { border-color: var(--foreground); color: var(--foreground); }

        .builder-footer {
          padding: 16px 28px; border-top: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          background: var(--surface);
        }

        /* ── How It Works ── */
        .hiw-section {
          max-width: 1100px; margin: 0 auto; padding: 100px 40px 80px;
        }
        .hiw-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .hiw-card {
          padding: 36px 28px; border-radius: 20px;
          border: 1px solid var(--border); background: var(--surface);
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1); position: relative; overflow: hidden;
        }
        .hiw-card::before {
          content: ''; position: absolute; inset: 0; opacity: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(255,40,0,0.06) 0%, transparent 70%);
          transition: opacity 0.4s;
        }
        .hiw-card:hover::before { opacity: 1; }
        .hiw-card:hover { border-color: rgba(255,40,0,0.3); transform: translateY(-6px); box-shadow: 0 20px 40px rgba(255,40,0,0.08); }

        .hiw-step {
          font-size: 48px; font-weight: 900; color: rgba(255,40,0,0.1);
          letter-spacing: -0.04em; line-height: 1; margin-bottom: 20px; position: relative; z-index: 1;
        }
        .hiw-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,40,0,0.08); color: var(--brand-red);
          border: 1px solid rgba(255,40,0,0.15); margin-bottom: 20px; position: relative; z-index: 1;
          transition: all 0.35s;
        }
        .hiw-card:hover .hiw-icon { background: rgba(255,40,0,0.14); box-shadow: 0 8px 20px rgba(255,40,0,0.15); transform: scale(1.06); }
        .hiw-title { font-size: 18px; font-weight: 800; color: var(--foreground); margin: 0 0 10px; letter-spacing: -0.02em; position: relative; z-index: 1; }
        .hiw-desc { font-size: 14px; color: var(--text-muted); font-family: 'DM Sans', sans-serif; line-height: 1.65; margin: 0; position: relative; z-index: 1; }

        /* ── Example Builds ── */
        .examples-section {
          max-width: 1100px; margin: 0 auto; padding: 0 40px 100px;
        }
        .examples-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .example-card {
          border-radius: 20px; padding: 32px 28px; min-height: 220px;
          display: flex; flex-direction: column; justify-content: flex-end;
          cursor: pointer; transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          border: 1px solid transparent; position: relative; overflow: hidden;
        }
        .example-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .example-emoji { font-size: 40px; margin-bottom: 16px; }
        .example-title { font-size: 20px; font-weight: 900; color: var(--foreground); margin: 0 0 6px; letter-spacing: -0.02em; }
        .example-budget {
          display: inline-flex; font-size: 11px; font-weight: 800; letter-spacing: 0.05em;
          padding: 4px 10px; border-radius: 6px;
          background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8);
          margin-bottom: 10px; width: fit-content;
        }
        :root .example-budget { background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.6); }
        .example-desc { font-size: 13px; color: rgba(255,255,255,0.65); font-family: 'DM Sans', sans-serif; line-height: 1.5; margin: 0; }
        :root .example-desc { color: rgba(0,0,0,0.5); }

        .section-label {
          display: flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--brand-red); margin-bottom: 14px;
        }
        .section-label-line { width: 24px; height: 2px; background: var(--brand-red); border-radius: 2px; }
        .section-heading {
          font-size: 36px; font-weight: 900; color: var(--foreground); margin: 0 0 48px;
          letter-spacing: -0.04em; line-height: 1.15;
        }

        @media (max-width: 800px) {
          .choice-grid { grid-template-columns: 1fr; }
          .hiw-grid { grid-template-columns: 1fr; }
          .examples-grid { grid-template-columns: 1fr; }
          .hiw-section { padding: 60px 20px 40px; }
          .examples-section { padding: 0 20px 60px; }
        }
      `}</style>

      <MegaMenu />

      {/* ════════════════════════════════════════════
          HERO — AI PC BUILDER
         ════════════════════════════════════════════ */}
      <section className="bai-hero">
        <div className="bai-grid-bg" />
        <div className="bai-orb bai-orb-1" />
        <div className="bai-orb bai-orb-2" />
        <div className="bai-orb bai-orb-3" />

        {/* Decorative floating shapes */}
        <div style={{
          position: 'absolute', top: '15%', left: '8%',
          width: 60, height: 60, borderRadius: 16,
          border: '1px solid rgba(255,40,0,0.15)',
          animation: 'float 6s ease-in-out infinite', transform: 'rotate(20deg)', opacity: 0.3,
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: 40, height: 40, borderRadius: '50%',
          border: '1px solid rgba(255,40,0,0.12)',
          animation: 'float 5s ease-in-out infinite 1s', opacity: 0.25,
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '20%',
          width: 80, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(255,40,0,0.2), transparent)',
          animation: 'float 7s ease-in-out infinite 0.5s', opacity: 0.4,
        }} />

        <div className="bai-content">
          <div className="bai-badge">
            <span className="bai-badge-dot" />
            AI-Powered PC Builder
          </div>

          <h1 className="bai-title">
            <span className="bai-title-gradient">Build Your Dream PC.</span>
            <br />
            <span className="bai-title-gradient">Just Describe It.</span>
          </h1>

          <p className="bai-subtitle">
            Our AI assistant helps you configure the perfect PC for your needs.
            Simply describe what you want — we handle the components, compatibility, and budget.
          </p>

          {/* ── Builder Box ── */}
          <div className="builder-box">
            <div className="builder-inner">
              {/* Step 1: Choice */}
              {builderStep === 'choice' && (
                <div style={{ animation: 'slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                  <div className="choice-grid">
                    <div className="choice-card" onClick={() => setBuilderStep('ai-prompt')}>
                      <div className="choice-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6 4.8 2.4-7.2-6-4.8h7.2z" />
                        </svg>
                      </div>
                      <span className="choice-label">Build Your PC</span>
                      <span className="choice-desc">Use AI to configure the perfect build based on your needs and budget</span>
                      <span className="choice-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                    <div className="choice-card" onClick={() => router.push('/product-page?category=gaming-pc')}>
                      <div className="choice-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm6 12h4m-6 4h8" />
                        </svg>
                      </div>
                      <span className="choice-label">Pre-Built PCs</span>
                      <span className="choice-desc">Browse ready-to-play gaming desktops handpicked by our experts</span>
                      <span className="choice-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: AI Prompt */}
              {builderStep === 'ai-prompt' && (
                <div style={{ animation: 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                  <p className="prompt-section-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    Describe Your Ideal Setup
                  </p>
                  <textarea
                    className="prompt-area"
                    value={promptText}
                    onChange={e => setPromptText(e.target.value)}
                    placeholder="Describe your ideal PC setup..."
                  />

                  <div className="prompt-divider" />

                  <p className="prompt-section-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6 4.8 2.4-7.2-6-4.8h7.2z" />
                    </svg>
                    What Is This PC For?
                  </p>
                  <input
                    type="text"
                    list="purpose-options"
                    className="prompt-input"
                    value={selectedPurpose}
                    onChange={e => setSelectedPurpose(e.target.value)}
                    placeholder="e.g. Gaming, Video Editing, Office..."
                  />
                  <datalist id="purpose-options">
                    {purposeTags.map(tag => (
                      <option key={tag.value} value={tag.value}>{tag.label}</option>
                    ))}
                  </datalist>

                  <div className="prompt-divider" />

                  <p className="prompt-section-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                    Budget Range
                  </p>
                  <input
                    type="text"
                    list="budget-options"
                    className="prompt-input"
                    value={selectedBudget}
                    onChange={e => setSelectedBudget(e.target.value)}
                    placeholder="e.g. 1000 DTN, Mid-Range, Unlimited..."
                  />
                  <datalist id="budget-options">
                    {budgetOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </datalist>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="builder-footer">
              <div>
                {builderStep !== 'choice' && (
                  <button className="back-btn" onClick={() => setBuilderStep('choice')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    Back
                  </button>
                )}
              </div>
              <div>
                {builderStep === 'ai-prompt' && (
                  <button className="generate-btn" onClick={handleGenerate}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6 4.8 2.4-7.2-6-4.8h7.2z" />
                    </svg>
                    Generate Build
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW IT WORKS
         ════════════════════════════════════════════ */}
      <section className="hiw-section">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            <span className="section-label-line" />
            How It Works
            <span className="section-label-line" />
          </div>
          <h2 className="section-heading" style={{ marginBottom: 0 }}>Three Simple Steps</h2>
        </div>

        <div className="hiw-grid">
          {howItWorks.map((item, i) => (
            <div key={i} className="hiw-card" style={{ animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms both` }}>
              <div className="hiw-step">{item.step}</div>
              <div className="hiw-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              <h3 className="hiw-title">{item.title}</h3>
              <p className="hiw-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          EXAMPLE BUILDS
         ════════════════════════════════════════════ */}
      <section className="examples-section">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            <span className="section-label-line" />
            Inspiration
            <span className="section-label-line" />
          </div>
          <h2 className="section-heading" style={{ marginBottom: 0 }}>Popular Build Ideas</h2>
        </div>

        <div className="examples-grid">
          {exampleBuilds.map((build, i) => (
            <div
              key={i}
              className="example-card"
              style={{
                background: build.gradient,
                animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms both`,
              }}
              onClick={() => {
                setSelectedPurpose(build.title.toLowerCase())
                setSelectedBudget(build.budget)
                window.scrollTo({ top: 0, behavior: 'smooth' })
                setBuilderStep('ai-prompt')
              }}
            >
              <style>{`
                :root .example-card:nth-child(${i + 1}) { background: ${build.lightGradient} !important; }
                .dark .example-card:nth-child(${i + 1}) { background: ${build.gradient} !important; }
              `}</style>
              <div className="example-emoji">{build.emoji}</div>
              <div className="example-budget">{build.budget}</div>
              <h3 className="example-title">{build.title}</h3>
              <p className="example-desc">{build.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

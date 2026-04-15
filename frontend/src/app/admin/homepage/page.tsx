'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  HomepageConfigService,
  type HomepageHeroSlide,
} from '@/services/homepage-config.service'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
const MAX_HERO_SLIDES = 6

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
)

const icons = {
  chevronLeft: 'M15 18l-6-6 6-6',
  upload: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
  save: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8V3',
  desktop: 'M4 5h16v10H4zM8 19h8M10 15v4M14 15v4',
  plus: 'M12 5v14M5 12h14',
  trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDown: 'M12 5v14M19 12l-7 7-7-7',
}

type EditableHeroSlide = HomepageHeroSlide & {
  localId: string
}

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function toEditableSlide(slide: HomepageHeroSlide): EditableHeroSlide {
  return { ...slide, localId: createLocalId() }
}

function toPersistedSlide(slide: EditableHeroSlide): HomepageHeroSlide {
  return {
    title: slide.title.trim(),
    subtitle: slide.subtitle.trim(),
    buttonText: slide.buttonText.trim(),
    buttonLink: slide.buttonLink.trim(),
    imageUrl: slide.imageUrl.trim(),
  }
}

const NEW_SLIDE_TEMPLATE: HomepageHeroSlide = {
  title: 'New Hero Title',
  subtitle: 'Add a short supporting message for this homepage slide.',
  buttonText: 'Shop Now',
  buttonLink: '/product-page',
  imageUrl: '',
}

export default function AdminHomepageConfig() {
  const router = useRouter()
  const [slides, setSlides] = useState<EditableHeroSlide[]>([])
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    HomepageConfigService.get()
      .then((data) => {
        const loadedSlides = data.heroSlides.map(toEditableSlide)
        setSlides(loadedSlides)
        setSelectedSlideId(loadedSlides[0]?.localId ?? null)
      })
      .catch((err) => {
        setError('Failed to load homepage hero content. Make sure the backend is running.')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

  const selectedSlide = useMemo(
    () => slides.find((slide) => slide.localId === selectedSlideId) ?? slides[0] ?? null,
    [slides, selectedSlideId]
  )

  useEffect(() => {
    if (!slides.length) {
      setSelectedSlideId(null)
      return
    }

    if (!selectedSlideId || !slides.some((slide) => slide.localId === selectedSlideId)) {
      setSelectedSlideId(slides[0].localId)
    }
  }, [slides, selectedSlideId])

  const updateSelectedSlide = (field: keyof HomepageHeroSlide, value: string) => {
    if (!selectedSlide) {
      return
    }

    setSlides((current) =>
      current.map((slide) =>
        slide.localId === selectedSlide.localId ? { ...slide, [field]: value } : slide
      )
    )
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    updateSelectedSlide(name as keyof HomepageHeroSlide, value)
  }

  const handleAddSlide = () => {
    if (slides.length >= MAX_HERO_SLIDES) {
      setError(`You can add up to ${MAX_HERO_SLIDES} hero slides.`)
      return
    }

    const newSlide = toEditableSlide(NEW_SLIDE_TEMPLATE)
    setSlides((current) => [...current, newSlide])
    setSelectedSlideId(newSlide.localId)
    setError(null)
    setSuccess(null)
  }

  const handleRemoveSlide = (slideId: string) => {
    if (slides.length <= 1) {
      setError('At least one hero slide is required.')
      return
    }

    setSlides((current) => {
      const index = current.findIndex((slide) => slide.localId === slideId)
      const nextSlides = current.filter((slide) => slide.localId !== slideId)

      if (selectedSlideId === slideId) {
        const fallbackIndex = Math.max(0, Math.min(index, nextSlides.length - 1))
        setSelectedSlideId(nextSlides[fallbackIndex]?.localId ?? null)
      }

      return nextSlides
    })

    setError(null)
    setSuccess(null)
  }

  const handleMoveSlide = (slideId: string, direction: -1 | 1) => {
    setSlides((current) => {
      const index = current.findIndex((slide) => slide.localId === slideId)
      const targetIndex = index + direction

      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) {
        return current
      }

      const nextSlides = [...current]
      const [slide] = nextSlides.splice(index, 1)
      nextSlides.splice(targetIndex, 0, slide)
      return nextSlides
    })
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, slideId: string) => {
    const file = event.target.files?.[0] ?? null
    event.target.value = ''

    if (!file) {
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError('Image too large. Max size is 10MB.')
      return
    }

    setError(null)
    setSuccess(null)
    setUploadingSlideId(slideId)

    try {
      const imageUrl = await HomepageConfigService.uploadHeroImage(file)
      setSlides((current) =>
        current.map((slide) => (slide.localId === slideId ? { ...slide, imageUrl } : slide))
      )
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to upload hero image.'
      setError(message)
      console.error(err)
    } finally {
      setUploadingSlideId(null)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const saved = await HomepageConfigService.update({
        heroSlides: slides.map(toPersistedSlide),
      })

      const savedSlides = saved.heroSlides.map(toEditableSlide)
      setSlides(savedSlides)
      setSelectedSlideId(savedSlides[0]?.localId ?? null)
      setSuccess('Homepage hero slides updated successfully.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to save homepage hero slides.'
      setError(message)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .gap-page { font-family: 'Plus Jakarta Sans', sans-serif; padding: 32px; flex: 1; display: flex; flex-direction: column; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
        .page-title { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; margin: 0; color: var(--foreground); }
        .page-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; font-weight: 500; max-width: 560px; }
        .btn-back { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13.5px; font-weight: 600; background: transparent; border: none; cursor: pointer; padding: 0; margin-bottom: 24px; transition: color 0.2s; }
        .btn-back:hover { color: var(--foreground); }
        .btn-save, .btn-secondary, .btn-icon { display: inline-flex; align-items: center; gap: 7px; border: none; border-radius: 10px; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
        .btn-save { padding: 9px 20px; background: var(--brand-red); color: #fff; font-size: 13.5px; font-weight: 700; box-shadow: 0 4px 14px rgba(255,40,0,0.25); letter-spacing: -0.01em; }
        .btn-save:hover:not(:disabled) { background: var(--brand-red-hover); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255,40,0,0.32); }
        .btn-secondary { padding: 9px 14px; background: var(--surface); color: var(--foreground); border: 1px solid var(--border); font-size: 13px; font-weight: 700; }
        .btn-secondary:hover:not(:disabled) { border-color: var(--brand-red); color: var(--brand-red); transform: translateY(-1px); }
        .btn-icon { justify-content: center; width: 36px; height: 36px; background: var(--background); color: var(--text-muted); border: 1px solid var(--border); }
        .btn-icon:hover:not(:disabled) { color: var(--foreground); border-color: var(--border-strong); }
        .btn-save:disabled, .btn-secondary:disabled, .btn-icon:disabled { opacity: 0.6; cursor: not-allowed; }
        .page-grid { display: grid; grid-template-columns: minmax(280px, 320px) minmax(0, 1fr) minmax(320px, 0.95fr); gap: 24px; align-items: start; }
        .form-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 24px; transition: border-color 0.2s, box-shadow 0.2s; }
        .form-card:hover { border-color: var(--border-strong); box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .card-title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
        .card-title { font-size: 16px; font-weight: 700; color: var(--foreground); margin: 0; letter-spacing: -0.01em; }
        .card-subtitle { font-size: 12.5px; color: var(--text-muted); margin: -12px 0 20px; }
        .slide-list { display: flex; flex-direction: column; gap: 12px; }
        .slide-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; border: 1px solid var(--border); border-radius: 14px; background: var(--background); padding: 10px; }
        .slide-item.selected { border-color: rgba(255,40,0,0.45); box-shadow: 0 8px 24px rgba(255,40,0,0.08); }
        .slide-select { display: flex; align-items: center; gap: 12px; width: 100%; border: none; background: transparent; padding: 0; text-align: left; cursor: pointer; }
        .slide-thumb { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; background: linear-gradient(135deg, rgba(255,40,0,0.08), rgba(0,0,0,0.04)); border: 1px solid var(--border); flex-shrink: 0; }
        .slide-order { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--brand-red); margin-bottom: 4px; }
        .slide-name { font-size: 13px; font-weight: 700; color: var(--foreground); line-height: 1.4; margin: 0 0 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .slide-link { font-size: 12px; color: var(--text-muted); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .slide-actions { display: flex; flex-direction: column; gap: 8px; }
        .form-group { margin-bottom: 20px; }
        .form-group:last-child { margin-bottom: 0; }
        .form-label { display: block; font-size: 12px; font-weight: 700; color: var(--text-dim); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; }
        .form-input, .form-textarea { width: 100%; padding: 10px 14px; background: var(--background); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; color: var(--foreground); font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; transition: border-color 0.2s, box-shadow 0.2s; outline: none; box-sizing: border-box; }
        .form-input::placeholder, .form-textarea::placeholder { color: var(--text-dim); }
        .form-input:focus, .form-textarea:focus { border-color: var(--brand-red); box-shadow: 0 0 0 3px rgba(255,40,0,0.08); }
        .form-textarea { resize: vertical; min-height: 140px; line-height: 1.6; }
        .upload-area { border: 2px dashed var(--border); border-radius: 14px; padding: 24px; text-align: center; cursor: pointer; background: var(--background); transition: all 0.2s; display: block; overflow: hidden; }
        .upload-area:hover { border-color: var(--brand-red); background: var(--surface); }
        .upload-icon { color: var(--text-dim); margin-bottom: 16px; opacity: 0.6; }
        .upload-text { font-size: 15px; font-weight: 700; color: var(--foreground); margin-bottom: 6px; }
        .upload-sub { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .preview-img { width: 100%; max-height: 240px; object-fit: cover; border-radius: 12px; }
        .status-banner { padding: 14px 16px; border-radius: 12px; margin-bottom: 20px; font-size: 14px; font-weight: 600; }
        .status-banner.error { background: rgba(255,40,0,0.1); color: var(--brand-red); border: 1px solid rgba(255,40,0,0.2); }
        .status-banner.success { background: rgba(40,200,80,0.1); color: #1eb84f; border: 1px solid rgba(40,200,80,0.2); }
        .hero-preview { position: relative; min-height: 420px; border-radius: 18px; overflow: hidden; background: var(--background); border: 1px solid var(--border); }
        .hero-preview-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
        .hero-preview-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.48) 45%, rgba(0,0,0,0.18) 100%); }
        .hero-preview-content { position: relative; z-index: 2; padding: 32px; color: #fff; display: flex; flex-direction: column; justify-content: flex-end; min-height: 420px; }
        .hero-preview-badge { display: inline-flex; align-items: center; gap: 8px; width: fit-content; padding: 7px 14px; border-radius: 999px; background: rgba(255,40,0,0.85); color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 16px; }
        .hero-preview-title { font-size: clamp(30px, 4vw, 44px); font-weight: 900; line-height: 1.08; letter-spacing: -0.04em; margin: 0 0 14px; white-space: pre-line; }
        .hero-preview-subtitle { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.78); margin: 0 0 22px; max-width: 440px; }
        .hero-preview-cta { display: inline-flex; align-items: center; gap: 8px; width: fit-content; padding: 13px 22px; border-radius: 12px; background: #fff; color: var(--brand-red); text-decoration: none; font-size: 13px; font-weight: 800; }
        .hero-preview-meta { margin-top: 12px; font-size: 12px; color: var(--text-muted); }
        .loading-card { display: flex; align-items: center; justify-content: center; min-height: 320px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; color: var(--text-muted); font-weight: 600; }
        @media (max-width: 1240px) { .page-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="gap-page">
        <button className="btn-back" type="button" onClick={() => router.push('/admin/dashboard')}>
          <Icon d={icons.chevronLeft} size={15} /> Back to dashboard
        </button>

        <div className="page-header">
          <div>
            <h1 className="page-title">Homepage Heroes</h1>
            <p className="page-sub">
              Manage the ordered hero slider shown on the storefront homepage. Add up to {MAX_HERO_SLIDES} slides, set their content, and control their order.
            </p>
          </div>
          <button
            className="btn-save"
            type="submit"
            form="homepage-hero-form"
            disabled={saving || loading || uploadingSlideId !== null}
          >
            <Icon d={icons.save} size={15} />
            {saving ? 'Saving...' : uploadingSlideId ? 'Uploading...' : 'Save Slides'}
          </button>
        </div>

        {error && <div className="status-banner error">{error}</div>}
        {success && <div className="status-banner success">{success}</div>}

        {loading ? (
          <div className="loading-card">Loading homepage hero content...</div>
        ) : (
          <div className="page-grid">
            <div className="form-card">
              <div className="card-title-row">
                <h2 className="card-title">Hero Slides</h2>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={handleAddSlide}
                  disabled={slides.length >= MAX_HERO_SLIDES}
                >
                  <Icon d={icons.plus} size={14} />
                  Add Hero
                </button>
              </div>
              <p className="card-subtitle">
                The homepage rotates through these slides in the order shown here.
              </p>

              <div className="slide-list">
                {slides.map((slide, index) => (
                  <div
                    key={slide.localId}
                    className={`slide-item ${slide.localId === selectedSlide?.localId ? 'selected' : ''}`}
                  >
                    <button
                      className="slide-select"
                      type="button"
                      onClick={() => setSelectedSlideId(slide.localId)}
                    >
                      {slide.imageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slide.imageUrl} alt={slide.title || `Hero ${index + 1}`} className="slide-thumb" />
                        </>
                      ) : (
                        <div className="slide-thumb" />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div className="slide-order">Hero {index + 1}</div>
                        <p className="slide-name">{slide.title || 'Untitled hero slide'}</p>
                        <p className="slide-link">{slide.buttonLink || '/product-page'}</p>
                      </div>
                    </button>

                    <div className="slide-actions">
                      <button
                        className="btn-icon"
                        type="button"
                        onClick={() => handleMoveSlide(slide.localId, -1)}
                        disabled={index === 0}
                        aria-label={`Move hero ${index + 1} up`}
                      >
                        <Icon d={icons.arrowUp} size={14} />
                      </button>
                      <button
                        className="btn-icon"
                        type="button"
                        onClick={() => handleMoveSlide(slide.localId, 1)}
                        disabled={index === slides.length - 1}
                        aria-label={`Move hero ${index + 1} down`}
                      >
                        <Icon d={icons.arrowDown} size={14} />
                      </button>
                      <button
                        className="btn-icon"
                        type="button"
                        onClick={() => handleRemoveSlide(slide.localId)}
                        disabled={slides.length === 1}
                        aria-label={`Remove hero ${index + 1}`}
                      >
                        <Icon d={icons.trash} size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form id="homepage-hero-form" className="form-card" onSubmit={handleSubmit}>
              <div className="card-title-row">
                <h2 className="card-title">
                  {selectedSlide ? `Edit Hero ${slides.findIndex((slide) => slide.localId === selectedSlide.localId) + 1}` : 'Edit Hero'}
                </h2>
              </div>

              {selectedSlide ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Hero Title</label>
                    <textarea
                      className="form-textarea"
                      name="title"
                      value={selectedSlide.title}
                      onChange={handleChange}
                      placeholder="Upgrade Your Gaming Setup"
                      required
                      style={{ minHeight: 120 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hero Subtitle</label>
                    <textarea
                      className="form-textarea"
                      name="subtitle"
                      value={selectedSlide.subtitle}
                      onChange={handleChange}
                      placeholder="Short supporting text for the homepage hero"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Button Text</label>
                    <input
                      className="form-input"
                      name="buttonText"
                      value={selectedSlide.buttonText}
                      onChange={handleChange}
                      placeholder="Shop Now"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Button Link</label>
                    <input
                      className="form-input"
                      name="buttonLink"
                      value={selectedSlide.buttonLink}
                      onChange={handleChange}
                      placeholder="/product-page or https://..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hero Banner Image URL</label>
                    <input
                      className="form-input"
                      name="imageUrl"
                      value={selectedSlide.imageUrl}
                      onChange={handleChange}
                      placeholder="Paste an image URL or upload a new hero image below"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload New Hero Image</label>
                    <label className="upload-area">
                      <input
                        style={{ display: 'none' }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => handleFileChange(event, selectedSlide.localId)}
                      />

                      {selectedSlide.imageUrl ? (
                        <div style={{ position: 'relative' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={selectedSlide.imageUrl} alt="Homepage hero preview" className="preview-img" />
                          <div className="hero-preview-meta">
                            {uploadingSlideId === selectedSlide.localId
                              ? 'Uploading image...'
                              : 'Current hero image'}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="upload-icon">
                            <Icon d={icons.upload} size={42} />
                          </div>
                          <p className="upload-text">Upload hero banner image</p>
                          <p className="upload-sub">PNG, JPG, or WEBP up to 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </>
              ) : (
                <div className="loading-card" style={{ minHeight: 240 }}>
                  Select a hero slide to edit it.
                </div>
              )}
            </form>

            <div className="form-card">
              <h2 className="card-title">Live Preview</h2>
              <div className="hero-preview">
                <div
                  className="hero-preview-bg"
                  style={{ backgroundImage: `url(${selectedSlide?.imageUrl || ''})` }}
                />
                <div className="hero-preview-overlay" />
                <div className="hero-preview-content">
                  <div className="hero-preview-badge">
                    <Icon d={icons.desktop} size={14} /> Storefront Hero
                  </div>
                  <h3 className="hero-preview-title">
                    {selectedSlide?.title || 'Your hero title'}
                  </h3>
                  <p className="hero-preview-subtitle">
                    {selectedSlide?.subtitle || 'Your hero subtitle will appear here.'}
                  </p>
                  <span className="hero-preview-cta">
                    {selectedSlide?.buttonText || 'Call to Action'}
                  </span>
                </div>
              </div>
              <div className="hero-preview-meta">
                CTA destination: {selectedSlide?.buttonLink || '/product-page'}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

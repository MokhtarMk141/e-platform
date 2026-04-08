'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HomepageConfigService } from '@/services/homepage-config.service'

export default function AdminHomepageConfig() {
  const router = useRouter()
  const [jsonStr, setJsonStr] = useState('{\n  "loading": true\n}')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch current config on load
  useEffect(() => {
    HomepageConfigService.get()
      .then(data => {
        // format nicely
        setJsonStr(JSON.stringify(data, null, 2))
      })
      .catch(err => {
        setError('Failed to load current configuration. Is backend running?')
        console.error(err)
      })
  }, [])

  const handleSave = async () => {
    setError(null)
    setSuccess(false)
    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`)
      return
    }

    setSaving(true)
    try {
      const responseData = await HomepageConfigService.update(parsed)
      setJsonStr(JSON.stringify(responseData, null, 2))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) {
      setError(`Failed to save: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--foreground)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Homepage CMS
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
            Directly edit the JSON configuration that powers the storefront homepage.
          </p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? 'var(--surface-hover)' : 'var(--brand-red)',
            color: saving ? 'var(--text-muted)' : '#fff',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 800,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: saving ? 'none' : '0 4px 14px rgba(255,40,0,0.2)'
          }}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(255,40,0,0.1)', color: 'var(--brand-red)', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(255,40,0,0.2)' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '16px', background: 'rgba(40,200,80,0.1)', color: '#1eb84f', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(40,200,80,0.2)' }}>
          Configuration saved successfully! The homepage is now updated.
        </div>
      )}

      <div style={{ 
        background: 'var(--surface)', 
        borderRadius: '16px', 
        border: '1px solid var(--border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '12px 20px', background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
          <span style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', fontFamily: 'monospace' }}>homepage-config.json</span>
        </div>
        <textarea
          value={jsonStr}
          onChange={(e) => setJsonStr(e.target.value)}
          spellCheck={false}
          style={{
            width: '100%',
            height: '600px',
            padding: '24px',
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            lineHeight: 1.6,
            resize: 'vertical',
            tabSize: 2
          }}
        />
      </div>
    </div>
  )
}

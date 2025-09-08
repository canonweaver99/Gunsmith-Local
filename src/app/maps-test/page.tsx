'use client'

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMapsScript } from '@/lib/google-maps'

export default function MapsTestPage() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [overrideKey, setOverrideKey] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<{
    keyPresent: boolean
    keyMasked: string
    scriptLoaded: boolean
    placesReady: boolean
    error?: string
  }>({ keyPresent: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, keyMasked: mask(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY), scriptLoaded: false, placesReady: false })

  const [lastPlace, setLastPlace] = useState<any>(null)

  useEffect(() => {
    // Read ?key= override for quick prod testing
    try {
      const sp = new URLSearchParams(window.location.search)
      const k = sp.get('key') || sp.get('apiKey') || sp.get('apikey') || undefined
      if (k) {
        setOverrideKey(k)
        setStatus(prev => ({ ...prev, keyPresent: true, keyMasked: mask(k) }))
      }
    } catch {}

    let cancelled = false
    async function init() {
      try {
        await loadGoogleMapsScript(overrideKey)
        if (cancelled) return
        setStatus(prev => ({ ...prev, scriptLoaded: true, placesReady: !!window.google?.maps?.places }))

        if (!inputRef.current || !window.google?.maps?.places) return
        const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
        })
        ac.addListener('place_changed', () => {
          const p = ac.getPlace()
          setLastPlace(safePlace(p))
        })
      } catch (e: any) {
        setStatus(prev => ({ ...prev, error: e?.message || String(e) }))
      }
    }
    init()
    return () => { cancelled = true }
  }, [overrideKey])

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gunsmith-gold">Google Places Autocomplete Demo</h1>

      <div className="p-4 rounded border border-gunsmith-border bg-gunsmith-card text-gunsmith-text text-sm space-y-1">
        <div>Key present: {String(status.keyPresent)}</div>
        <div>Key (masked): {status.keyMasked}</div>
        <div>Script loaded: {String(status.scriptLoaded)}</div>
        <div>Places ready: {String(status.placesReady)}</div>
        {status.error && <div className="text-red-400">Error: {status.error}</div>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-gunsmith-text">Street Address</label>
        <input
          ref={inputRef}
          name="street_address"
          placeholder="Start typing your address..."
          className="input w-full h-11"
        />
        <p className="text-gunsmith-text-secondary text-xs">Try selecting an address; parsed result will appear below.</p>
      </div>

      <div className="p-4 rounded border border-gunsmith-border bg-gunsmith-card text-gunsmith-text text-sm">
        <div className="font-semibold mb-2">Last selected place (sanitized):</div>
        <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(lastPlace, null, 2)}</pre>
      </div>
    </div>
  )
}

function mask(value?: string) {
  if (!value) return 'undefined'
  const s = String(value)
  if (s.length <= 8) return '********'
  return `${s.slice(0, 4)}...${s.slice(-4)}`
}

function safePlace(place: any) {
  if (!place) return null
  return {
    description: place.description || place.formatted_address || null,
    components: Array.isArray(place.address_components)
      ? place.address_components.map((c: any) => ({ long_name: c?.long_name, short_name: c?.short_name, types: c?.types }))
      : null,
  }
}



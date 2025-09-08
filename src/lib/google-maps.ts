// Promise-based Google Maps Places loader to avoid race conditions

declare global {
  interface Window {
    google: any
  }
}

export function loadGoogleMapsScript(apiKey?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      resolve(window.google)
      return
    }

    if (typeof document === 'undefined') {
      reject(new Error('Document not available'))
      return
    }

    // If a script is already present, wait for readiness
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]') as HTMLScriptElement | null
    if (existing) {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval)
          resolve(window.google)
        }
      }, 100)
      // Safety timeout after 15s
      setTimeout(() => {
        clearInterval(interval)
        if (!window.google?.maps?.places) reject(new Error('Google Maps failed to become ready'))
      }, 15000)
      return
    }

    const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    // Safe debug (masked)
    if (process.env.NODE_ENV !== 'production') {
      const masked = key ? `${String(key).slice(0, 4)}...${String(key).slice(-4)}` : 'undefined'
      console.debug('[Maps] API key present:', !!key, masked)
    }
    if (!key) {
      reject(new Error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.google?.maps?.places) {
        resolve(window.google)
      } else {
        reject(new Error('Google Maps Places not available after load'))
      }
    }

    script.onerror = () => reject(new Error('Failed to load Google Maps script'))

    document.head.appendChild(script)
  })
}



'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { MapPin, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function LocationSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [location, setLocation] = useState({
    city: '',
    state: '',
    searchRadius: '25'
  })

  useEffect(() => {
    if (user) {
      fetchLocationPreferences()
    }
  }, [user])

  const fetchLocationPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('default_city, default_state, search_radius')
        .eq('user_id', user?.id)
        .single()

      if (data) {
        setLocation({
          city: data.default_city || '',
          state: data.default_state || '',
          searchRadius: data.search_radius || '25'
        })
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          default_city: location.city,
          default_state: location.state,
          search_radius: location.searchRadius,
          updated_at: new Date()
        })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to update location preferences')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gunsmith-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-8">LOCATION PREFERENCES</h1>
            
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 mt-0.5" />
                    <span className="text-sm">Location preferences updated successfully!</span>
                  </div>
                )}

                <div>
                  <label className="label">Default City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                    <input
                      type="text"
                      value={location.city}
                      onChange={(e) => setLocation({ ...location, city: e.target.value })}
                      className="input w-full pl-10"
                      placeholder="Austin"
                    />
                  </div>
                  <p className="text-xs text-gunsmith-text-secondary mt-1">
                    Your default search location
                  </p>
                </div>

                <div>
                  <label className="label">Default State</label>
                  <select
                    value={location.state}
                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Search Radius</label>
                  <select
                    value={location.searchRadius}
                    onChange={(e) => setLocation({ ...location, searchRadius: e.target.value })}
                    className="input w-full"
                  >
                    <option value="10">10 miles</option>
                    <option value="25">25 miles</option>
                    <option value="50">50 miles</option>
                    <option value="100">100 miles</option>
                    <option value="250">250 miles</option>
                  </select>
                  <p className="text-xs text-gunsmith-text-secondary mt-1">
                    Default search distance from your location
                  </p>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

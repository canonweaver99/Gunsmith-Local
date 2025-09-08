'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BusinessHoursEditor from '@/components/BusinessHoursEditor'
import { supabase } from '@/lib/supabase'
import { Building2, Save, Loader2, AlertCircle, CheckCircle, MapPin, Phone, Globe } from 'lucide-react'

export default function BusinessSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [hasListing, setHasListing] = useState(false)
  const [business, setBusiness] = useState({
    business_name: '',
    phone: '',
    website: '',
    street_address: '',
    city: '',
    state_province: '',
    postal_code: '',
    description: '',
    business_hours: null as any
  })

  useEffect(() => {
    if (user) {
      fetchBusinessInfo()
    }
  }, [user])

  const fetchBusinessInfo = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      console.log('Session before query (business settings):', session)

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user?.id)
        .maybeSingle()

      if (error || !data) {
        if (error) console.error('Listings query error (business settings):', error)
        setHasListing(false)
        return
      }

      setHasListing(true)
      setBusiness({
        business_name: data.business_name || '',
        phone: data.phone || '',
        website: data.website || '',
        street_address: data.street_address || '',
        city: data.city || '',
        state_province: data.state_province || '',
        postal_code: data.postal_code || '',
        description: data.description || '',
        business_hours: data.business_hours || null
      })
    } catch (error) {
      console.error('Error fetching business info:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('listings')
        .update({
          business_name: business.business_name,
          phone: business.phone,
          website: business.website,
          street_address: business.street_address,
          city: business.city,
          state_province: business.state_province,
          postal_code: business.postal_code,
          description: business.description,
          business_hours: business.business_hours,
          updated_at: new Date()
        })
        .eq('owner_id', user?.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to update business information')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  if (!hasListing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gunsmith-black flex items-center justify-center">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-gunsmith-gold/30 mx-auto mb-4" />
            <h2 className="font-bebas text-2xl text-gunsmith-gold mb-2">NO BUSINESS LISTING</h2>
            <p className="text-gunsmith-text-secondary mb-6">
              You need to create a business listing first
            </p>
            <button
              onClick={() => router.push('/business-portal')}
              className="btn-primary"
            >
              Business Portal
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gunsmith-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-8">BUSINESS INFORMATION</h1>
            
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
                    <span className="text-sm">Business information updated successfully!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Business Name</label>
                    <input
                      type="text"
                      value={business.business_name}
                      onChange={(e) => setBusiness({ ...business, business_name: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                      <input
                        type="tel"
                        value={business.phone}
                        onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                        className="input w-full pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                      <input
                        type="url"
                        value={business.website}
                        onChange={(e) => setBusiness({ ...business, website: e.target.value })}
                        className="input w-full pl-10"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                      <input
                        type="text"
                        value={business.street_address}
                        onChange={(e) => setBusiness({ ...business, street_address: e.target.value })}
                        className="input w-full pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">City</label>
                    <input
                      type="text"
                      value={business.city}
                      onChange={(e) => setBusiness({ ...business, city: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">State</label>
                    <input
                      type="text"
                      value={business.state_province}
                      onChange={(e) => setBusiness({ ...business, state_province: e.target.value })}
                      className="input w-full"
                      maxLength={2}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">ZIP Code</label>
                    <input
                      type="text"
                      value={business.postal_code}
                      onChange={(e) => setBusiness({ ...business, postal_code: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Description</label>
                    <textarea
                      value={business.description}
                      onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                      className="input w-full h-32 resize-none"
                      placeholder="Tell customers about your business..."
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label mb-4">Business Hours</label>
                    <BusinessHoursEditor
                      hours={business.business_hours}
                      onChange={(hours) => setBusiness({ ...business, business_hours: hours })}
                    />
                  </div>
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
                        Save Changes
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

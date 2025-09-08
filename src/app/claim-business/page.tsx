'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Building2, Shield, Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react'

export default function ClaimBusinessPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [claimData, setClaimData] = useState({
    ffl_license_number: '',
    verification_documents: '',
    additional_info: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/claim-business')
    }
  }, [user, router])

  // Validate FFL: 15 alphanumeric chars, exactly 14 digits and 1 letter
  const isValidFfl = (value: string): boolean => {
    const raw = value.replace(/[^A-Za-z0-9]/g, '')
    if (raw.length !== 15) return false
    const digits = (raw.match(/\d/g) || []).length
    const letters = (raw.match(/[A-Za-z]/g) || []).length
    return digits === 14 && letters === 1
  }

  const searchBusinesses = async () => {
    const raw = searchQuery.trim()
    if (!raw) return
    setSearchLoading(true)
    try {
      // Parse "City, ST" quick format
      const cityStateMatch = raw.match(/^([^,]+),\s*([A-Za-z]{2})$/)
      let primaryQuery
      if (cityStateMatch) {
        const city = cityStateMatch[1].trim()
        const state = cityStateMatch[2].toUpperCase()
        primaryQuery = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .is('owner_id', null)
          .ilike('city', `%${city}%`)
          .eq('state_province', state)
          .limit(25)
      } else {
        // Tokenize and build ORs across multiple fields for best-effort matching
        const tokens = raw.split(/\s+/).filter(Boolean)
        const searchableFields = [
          'business_name',
          'city',
          'state_province',
          'street_address',
          'postal_code',
          'description',
          'website',
          'phone'
        ]
        const orParts: string[] = []
        for (const field of searchableFields) {
          for (const t of tokens) {
            orParts.push(`${field}.ilike.%${t}%`)
          }
        }
        const orClause = orParts.join(',')
        primaryQuery = supabase
          .from('listings')
          .select('*')
          .or(orClause)
          .eq('status', 'active')
          .is('owner_id', null)
          .limit(25)
      }

      let { data, error } = await primaryQuery
      if (error) throw error

      // Fallback: include claimed businesses if none unclaimed matched
      if (!data || data.length === 0) {
        let fallback
        if (cityStateMatch) {
          const city = cityStateMatch[1].trim()
          const state = cityStateMatch[2].toUpperCase()
          const { data: fb, error: fbErr } = await supabase
            .from('listings')
            .select('*')
            .eq('status', 'active')
            .ilike('city', `%${city}%`)
            .eq('state_province', state)
            .limit(25)
          if (fbErr) throw fbErr
          fallback = fb
        } else {
          const tokens = raw.split(/\s+/).filter(Boolean)
          const searchableFields = ['business_name','city','state_province','street_address','postal_code','description','website','phone']
          const orParts: string[] = []
          for (const field of searchableFields) {
            for (const t of tokens) {
              orParts.push(`${field}.ilike.%${t}%`)
            }
          }
          const { data: fb, error: fbErr } = await supabase
            .from('listings')
            .select('*')
            .or(orParts.join(','))
            .eq('status', 'active')
            .limit(25)
          if (fbErr) throw fbErr
          fallback = fb
        }
        setSearchResults(fallback || [])
      } else {
        setSearchResults(data)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to search businesses')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBusiness || !user) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Validate FFL
      if (!isValidFfl(claimData.ffl_license_number)) {
        throw new Error('Invalid FFL number. It must be 15 characters with 14 digits and 1 letter.')
      }

      // Create a claim request
      const { error: claimError } = await supabase
        .from('business_claims')
        .insert({
          listing_id: selectedBusiness.id,
          claimer_id: user.id,
          claimer_email: user.email,
          ffl_license_number: claimData.ffl_license_number.replace(/[^A-Za-z0-9]/g, ''),
          verification_documents: claimData.verification_documents,
          additional_info: claimData.additional_info,
          status: 'pending',
          submitted_at: new Date().toISOString()
        })

      if (claimError) throw claimError

      setSuccess(true)
      setSelectedBusiness(null)
      setClaimData({
        ffl_license_number: '',
        verification_documents: '',
        additional_info: ''
      })
    } catch (error: any) {
      setError(error.message || 'Failed to submit claim')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gunsmith-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Building2 className="h-16 w-16 text-gunsmith-gold mx-auto mb-4" />
              <h1 className="font-bebas text-4xl text-gunsmith-gold mb-4">CLAIM YOUR BUSINESS</h1>
              <p className="text-gunsmith-text-secondary max-w-2xl mx-auto">
                If your gunsmith business is already listed but not claimed, you can claim ownership 
                by providing your FFL license verification.
              </p>
            </div>

            {error && (
              <div className="bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded flex items-start gap-2 mb-6">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded flex items-start gap-2 mb-6">
                <CheckCircle className="h-5 w-5 mt-0.5" />
                <span className="text-sm">
                  Claim submitted successfully! We'll review your FFL verification and contact you within 2-3 business days.
                </span>
              </div>
            )}

            {/* Search for Business */}
            <div className="card mb-8">
              <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">SEARCH FOR YOUR BUSINESS</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchBusinesses()}
                  className="input flex-1"
                  placeholder="Enter business name, city, or state..."
                />
                <button
                  onClick={searchBusinesses}
                  disabled={searchLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  {searchLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  Search
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-bebas text-lg text-gunsmith-gold">UNCLAIMED BUSINESSES</h3>
                  {searchResults.map((business) => (
                    <div
                      key={business.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedBusiness?.id === business.id
                          ? 'border-gunsmith-gold bg-gunsmith-gold/10'
                          : 'border-gunsmith-border hover:border-gunsmith-gold/50'
                      }`}
                      onClick={() => setSelectedBusiness(business)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bebas text-lg text-gunsmith-gold">{business.business_name}</h4>
                          <p className="text-gunsmith-text-secondary text-sm">
                            {business.street_address}, {business.city}, {business.state_province}
                          </p>
                          <p className="text-gunsmith-text-secondary text-xs">
                            Listed: {new Date(business.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedBusiness?.id === business.id
                            ? 'border-gunsmith-gold bg-gunsmith-gold'
                            : 'border-gunsmith-border'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Not listed CTA */}
              <div className="mt-8 p-6 rounded-lg bg-gunsmith-accent/20 border border-gunsmith-border">
                <h3 className="font-bebas text-xl text-gunsmith-gold mb-2">MY BUSINESS ISN'T LISTED</h3>
                <p className="text-gunsmith-text-secondary mb-4">Can't find your shop? Add it now and get verified.</p>
                <button
                  onClick={() => router.push('/add-business/new')}
                  className="btn-primary"
                >
                  Add My Business
                </button>
              </div>
            </div>

            {/* Claim Form */}
            {selectedBusiness && (
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">
                  CLAIM: {selectedBusiness.business_name}
                </h2>
                
                <form onSubmit={handleClaim} className="space-y-6">
                  <div className="bg-gunsmith-gold/10 border border-gunsmith-gold/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-gunsmith-gold" />
                      <span className="font-bebas text-lg text-gunsmith-gold">FFL VERIFICATION REQUIRED</span>
                    </div>
                    <p className="text-gunsmith-text-secondary text-sm">
                      To claim this business, you must provide your FFL license number for verification. 
                      This ensures only legitimate gunsmith businesses can claim listings.
                    </p>
                  </div>

                  <div>
                    <label className="label">FFL License Number *</label>
                    <input
                      type="text"
                      value={claimData.ffl_license_number}
                      onChange={(e) => setClaimData({ ...claimData, ffl_license_number: e.target.value })}
                      className="input w-full"
                      placeholder="Enter your FFL license number"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Additional Information</label>
                    <textarea
                      value={claimData.additional_info}
                      onChange={(e) => setClaimData({ ...claimData, additional_info: e.target.value })}
                      className="input w-full h-24 resize-none"
                      placeholder="Any additional information to help verify your claim..."
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedBusiness(null)}
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
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5" />
                          Submit Claim
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
